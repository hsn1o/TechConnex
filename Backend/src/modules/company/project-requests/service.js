// src/modules/company/project-requests/service.js
import { prisma } from "./model.js";
import { GetProjectRequestsDto, AcceptProposalDto, RejectProposalDto } from "./dto.js";

export async function getProjectRequests(dto) {
  try {
    const where = {
      serviceRequest: {
        customerId: dto.customerId,
      },
    };

    if (dto.status) {
      where.serviceRequest = {
        ...where.serviceRequest,
        status: dto.status,
      };
    }

    if (dto.category) {
      where.serviceRequest = {
        ...where.serviceRequest,
        category: dto.category,
      };
    }

    const skip = (dto.page - 1) * dto.limit;

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              providerProfile: {
                select: {
                  rating: true,
                  totalProjects: true,
                  location: true,
                  bio: true,
                  skills: true,
                  hourlyRate: true,
                  yearsExperience: true,
                  successRate: true,
                  responseTime: true,
                },
              },
            },
          },
          serviceRequest: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              budgetMin: true,
              budgetMax: true,
              timeline: true,
              priority: true,
              status: true,
              requirements: true,
              deliverables: true,
              createdAt: true,
            },
          },
          milestones: {
            select: {
              id: true,
              title: true,
              description: true,
              dueDate: true,
              amount: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: dto.limit,
      }),
      prisma.proposal.count({ where }),
    ]);

    const totalPages = Math.ceil(total / dto.limit);

    return {
      proposals,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching project requests:", error);
    throw new Error("Failed to fetch project requests");
  }
}

export async function getProjectRequestById(requestId, customerId) {
  try {
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: requestId,
        serviceRequest: {
          customerId: customerId,
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            providerProfile: {
              select: {
                rating: true,
                totalProjects: true,
                location: true,
                bio: true,
                skills: true,
                hourlyRate: true,
                yearsExperience: true,
                successRate: true,
                responseTime: true,
                availability: true,
                languages: true,
                website: true,
                certifications: {
                  select: {
                    name: true,
                    issuer: true,
                    issuedDate: true,
                    verified: true,
                  },
                },
                portfolios: {
                  select: {
                    title: true,
                    description: true,
                    techStack: true,
                    client: true,
                    date: true,
                    imageUrl: true,
                    externalUrl: true,
                  },
                },
              },
            },
          },
        },
        serviceRequest: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            budgetMin: true,
            budgetMax: true,
            timeline: true,
            priority: true,
            status: true,
            requirements: true,
            deliverables: true,
            createdAt: true,
          },
        },
        milestones: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    });

    if (!proposal) {
      throw new Error("Project request not found");
    }

    return proposal;
  } catch (error) {
    console.error("Error fetching project request:", error);
    throw new Error("Failed to fetch project request");
  }
}

export async function acceptProposal(dto) {
  try {
    // Check if proposal exists and belongs to customer's service request
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: dto.proposalId,
        serviceRequest: {
          customerId: dto.customerId,
        },
      },
      include: {
        serviceRequest: true,
        provider: true,
        milestones: true,
      },
    });

    if (!proposal) {
      throw new Error("Proposal not found or you don't have permission to accept it");
    }

    if (proposal.serviceRequest.status !== "OPEN") {
      throw new Error("This service request is no longer accepting proposals");
    }

    // Start a transaction to create project and update service request
    const result = await prisma.$transaction(async (tx) => {
      // Create project from accepted proposal
      const project = await tx.project.create({
        data: {
          title: proposal.serviceRequest.title,
          description: proposal.serviceRequest.description,
          category: proposal.serviceRequest.category,
          budgetMin: proposal.serviceRequest.budgetMin,
          budgetMax: proposal.serviceRequest.budgetMax,
          timeline: proposal.serviceRequest.timeline,
          priority: proposal.serviceRequest.priority,
          skills: proposal.serviceRequest.aiStackSuggest || [],
          customerId: dto.customerId,
          providerId: proposal.providerId,
          status: "IN_PROGRESS",
          requirements: proposal.serviceRequest.requirements,
          deliverables: proposal.serviceRequest.deliverables,
          milestones: {
            create: proposal.milestones.map((milestone) => ({
              title: milestone.title,
              description: milestone.description,
              dueDate: milestone.dueDate,
              amount: milestone.amount,
              status: "PENDING",
            })),
          },
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          provider: {
            select: {
              name: true,
              email: true,
            },
          },
          milestones: true,
        },
      });

      // Update service request status to MATCHED
      await tx.serviceRequest.update({
        where: { id: proposal.serviceRequest.id },
        data: { 
          status: "MATCHED",
          projectId: project.id,
        },
      });

      // Create notification for provider
      await tx.notification.create({
        data: {
          userId: proposal.providerId,
          type: "proposal",
          content: `Your proposal for "${proposal.serviceRequest.title}" has been accepted!`,
        },
      });

      return project;
    });

    return result;
  } catch (error) {
    console.error("Error accepting proposal:", error);
    throw new Error(error.message || "Failed to accept proposal");
  }
}

export async function rejectProposal(dto) {
  try {
    // Check if proposal exists and belongs to customer's service request
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: dto.proposalId,
        serviceRequest: {
          customerId: dto.customerId,
        },
      },
      include: {
        serviceRequest: true,
        provider: true,
      },
    });

    if (!proposal) {
      throw new Error("Proposal not found or you don't have permission to reject it");
    }

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: proposal.providerId,
        type: "proposal",
        content: `Your proposal for "${proposal.serviceRequest.title}" has been rejected.${dto.reason ? ` Reason: ${dto.reason}` : ""}`,
      },
    });

    return { message: "Proposal rejected successfully" };
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    throw new Error(error.message || "Failed to reject proposal");
  }
}

export async function getProposalStats(customerId) {
  try {
    const stats = await prisma.proposal.groupBy({
      by: ['serviceRequestId'],
      where: {
        serviceRequest: {
          customerId: customerId,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalProposals = await prisma.proposal.count({
      where: {
        serviceRequest: {
          customerId: customerId,
        },
      },
    });

    const openRequests = await prisma.serviceRequest.count({
      where: {
        customerId: customerId,
        status: "OPEN",
      },
    });

    const matchedRequests = await prisma.serviceRequest.count({
      where: {
        customerId: customerId,
        status: "MATCHED",
      },
    });

    return {
      totalProposals,
      openRequests,
      matchedRequests,
      averageProposalsPerRequest: stats.length > 0 ? totalProposals / stats.length : 0,
    };
  } catch (error) {
    console.error("Error fetching proposal stats:", error);
    throw new Error("Failed to fetch proposal statistics");
  }
}