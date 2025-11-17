// src/modules/company/reviews/service.js
import { prisma } from "./model.js";
import { CreateReviewDto, GetReviewsDto, UpdateReviewDto, CreateReviewReplyDto } from "./dto.js";

// Create a new review
export async function createReview(dto) {
  try {
    // Check if project exists and is completed
    const project = await prisma.project.findFirst({
      where: {
        id: dto.projectId,
        customerId: dto.reviewerId,
        status: "COMPLETED"
      },
      include: {
        provider: true,
        customer: true
      }
    });

    if (!project) {
      throw new Error("Project not found or not completed");
    }

    // Check if review already exists for this project
    const existingReview = await prisma.review.findFirst({
      where: {
        projectId: dto.projectId,
        reviewerId: dto.reviewerId
      }
    });

    if (existingReview) {
      throw new Error("Review already exists for this project");
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        projectId: dto.projectId,
        reviewerId: dto.reviewerId,
        recipientId: dto.recipientId,
        company: dto.company,
        role: dto.role,
        content: dto.content,
        rating: dto.rating,
        communicationRating: dto.communicationRating,
        qualityRating: dto.qualityRating,
        timelinessRating: dto.timelinessRating,
        professionalismRating: dto.professionalismRating
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            customerProfile: {
              select: {
                companySize: true,
                industry: true
              }
            }
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            providerProfile: {
              select: {
                rating: true,
                totalReviews: true,
                location: true
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true
          }
        },
        ReviewReply: true
      }
    });

    // Update provider's rating and review count
    await updateProviderRating(dto.recipientId);

    return review;
  } catch (error) {
    console.error("Error in createReview:", error);
    throw error;
  }
}

// Get reviews for a customer (given or received)
export async function getReviews(dto) {
  try {
    const whereClause = {};
    const includeClause = {
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          customerProfile: {
            select: {
              companySize: true,
              industry: true
            }
          }
        }
      },
      recipient: {
        select: {
          id: true,
          name: true,
          email: true,
          providerProfile: {
            select: {
              rating: true,
              totalReviews: true,
              location: true
            }
          }
        }
      },
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true
        }
      },
      ReviewReply: true
    };

    // Build where clause based on status
    if (dto.status === "given") {
      whereClause.reviewerId = dto.customerId;
    } else if (dto.status === "received") {
      whereClause.recipientId = dto.customerId;
    } else {
      // Get both given and received reviews
      whereClause.OR = [
        { reviewerId: dto.customerId },
        { recipientId: dto.customerId }
      ];
    }

    // Add rating filter
    if (dto.rating) {
      whereClause.rating = dto.rating;
    }

    // Add search filter
    if (dto.search) {
      whereClause.OR = [
        { content: { contains: dto.search, mode: 'insensitive' } },
        { project: { title: { contains: dto.search, mode: 'insensitive' } } },
        { recipient: { name: { contains: dto.search, mode: 'insensitive' } } },
        { reviewer: { name: { contains: dto.search, mode: 'insensitive' } } }
      ];
    }

    // Build order clause
    let orderBy = {};
    switch (dto.sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get total count
    const totalCount = await prisma.review.count({ where: whereClause });

    // Get paginated results
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: orderBy,
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit
    });

    return {
      reviews,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / dto.limit)
      }
    };
  } catch (error) {
    console.error("Error in getReviews:", error);
    throw error;
  }
}

// Get review by ID
export async function getReviewById(reviewId, userId) {
  try {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        OR: [
          { reviewerId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            customerProfile: {
              select: {
                companySize: true,
                industry: true
              }
            }
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            providerProfile: {
              select: {
                rating: true,
                totalReviews: true,
                location: true
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true
          }
        },
        ReviewReply: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  } catch (error) {
    console.error("Error in getReviewById:", error);
    throw error;
  }
}

// Update review
export async function updateReview(dto) {
  try {
    // Check if review exists and user is the reviewer
    const existingReview = await prisma.review.findFirst({
      where: {
        id: dto.reviewId,
        reviewerId: dto.customerId
      }
    });

    if (!existingReview) {
      throw new Error("Review not found or unauthorized");
    }

    // Update the review
    const review = await prisma.review.update({
      where: { id: dto.reviewId },
      data: {
        content: dto.content,
        rating: dto.rating,
        communicationRating: dto.communicationRating,
        qualityRating: dto.qualityRating,
        timelinessRating: dto.timelinessRating,
        professionalismRating: dto.professionalismRating
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        },
        ReviewReply: true
      }
    });

    // Update provider's rating
    await updateProviderRating(existingReview.recipientId);

    return review;
  } catch (error) {
    console.error("Error in updateReview:", error);
    throw error;
  }
}

// Delete review
export async function deleteReview(reviewId, userId) {
  try {
    console.log("🔍 deleteReview called with:", { reviewId, userId });

    // Check if review exists and user is the reviewer
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        reviewerId: userId
      }
    });

    console.log("🔍 Existing review found:", existingReview);

    if (!existingReview) {
      throw new Error("Review not found or unauthorized");
    }

    // Delete related replies and votes before the review to satisfy FK constraints
    await prisma.$transaction([
      prisma.reviewReply.deleteMany({
        where: { reviewId },
      }),
      prisma.reviewVote.deleteMany({
        where: { reviewId },
      }),
      prisma.review.delete({
        where: { id: reviewId },
      }),
    ]);

    console.log("🔍 Review deleted successfully");

    // Update provider's rating
    await updateProviderRating(existingReview.recipientId);

    console.log("🔍 Provider rating updated");

    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("Error in deleteReview:", error);
    throw error;
  }
}

// Create review reply
export async function createReviewReply(dto) {
  try {
    // Check if review exists and user is the recipient
    const review = await prisma.review.findFirst({
      where: {
        id: dto.reviewId,
        recipientId: dto.userId
      }
    });

    if (!review) {
      throw new Error("Review not found or unauthorized to reply");
    }

    // Check if reply already exists
    const existingReply = await prisma.reviewReply.findFirst({
      where: { reviewId: dto.reviewId }
    });

    if (existingReply) {
      throw new Error("Reply already exists for this review");
    }

    // Create the reply
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId: dto.reviewId,
        userId: dto.userId,
        content: dto.content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return reply;
  } catch (error) {
    console.error("Error in createReviewReply:", error);
    throw error;
  }
}

// Update review reply
export async function updateReviewReply(replyId, content, userId) {
  try {
    // Check if reply exists and user is the author
    const existingReply = await prisma.reviewReply.findFirst({
      where: {
        id: replyId,
        userId: userId
      }
    });

    if (!existingReply) {
      throw new Error("Reply not found or unauthorized");
    }

    // Update the reply
    const reply = await prisma.reviewReply.update({
      where: { id: replyId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return reply;
  } catch (error) {
    console.error("Error in updateReviewReply:", error);
    throw error;
  }
}

// Vote on review
// Get completed projects for review
export async function getCompletedProjectsForReview(customerId) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        customerId: customerId,
        status: "COMPLETED"
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            providerProfile: {
              select: {
                rating: true,
                totalReviews: true,
                location: true
              }
            }
          }
        },
        reviews: {
          where: {
            reviewerId: customerId
          }
        }
      }
    });

    // Return all completed projects with review status
    const projectsWithReviewStatus = projects.map(project => ({
      ...project,
      hasReview: project.reviews.length > 0,
      existingReview: project.reviews[0] || null
    }));

    return projectsWithReviewStatus;
  } catch (error) {
    console.error("Error in getCompletedProjectsForReview:", error);
    throw error;
  }
}

// Get review statistics for customer
export async function getReviewStatistics(customerId) {
  try {
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        reviewerId: customerId
      },
      _count: {
        rating: true
      }
    });

    const totalReviews = await prisma.review.count({
      where: { reviewerId: customerId }
    });

    const averageRating = await prisma.review.aggregate({
      where: { reviewerId: customerId },
      _avg: { rating: true }
    });

    const pendingProjects = await prisma.project.count({
      where: {
        customerId: customerId,
        status: "COMPLETED",
        reviews: {
          none: {
            reviewerId: customerId
          }
        }
      }
    });

    return {
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      pendingReviews: pendingProjects,
      ratingDistribution: stats
    };
  } catch (error) {
    console.error("Error in getReviewStatistics:", error);
    throw error;
  }
}

// Helper function to update provider rating
async function updateProviderRating(providerId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { recipientId: providerId },
      select: { rating: true }
    });

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await prisma.providerProfile.update({
        where: { userId: providerId },
        data: {
          rating: averageRating,
          totalReviews: reviews.length
        }
      });
    }
  } catch (error) {
    console.error("Error updating provider rating:", error);
  }
}
