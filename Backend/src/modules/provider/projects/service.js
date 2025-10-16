// src/modules/provider/projects/service.js
import { prisma } from "./model.js";
import { GetProviderProjectsDto, UpdateProjectStatusDto, UpdateMilestoneStatusDto } from "./dto.js";

/**
 * Get all projects for a provider
 */
export async function getProviderProjects(dto) {
  try {
    const where = {
      providerId: dto.providerId,
    };

    // Apply filters
    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search, mode: "insensitive" } },
        { description: { contains: dto.search, mode: "insensitive" } },
      ];
    }

    const skip = (dto.page - 1) * dto.limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              customerProfile: {
                select: {
                  companySize: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
          milestones: {
            orderBy: {
              order: "asc",
            },
          },
          _count: {
            select: {
              milestones: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: dto.limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Calculate progress for each project
    const projectsWithProgress = projects.map((project) => {
      const totalMilestones = project._count.milestones;
      const completedMilestones = project.milestones.filter(
        (m) => m.status === "APPROVED" || m.status === "PAID"
      ).length;
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      return {
        ...project,
        progress,
        completedMilestones,
        totalMilestones,
      };
    });

    const totalPages = Math.ceil(total / dto.limit);

    return {
      projects: projectsWithProgress,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching provider projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

/**
 * Get a single project by ID for a provider
 */
export async function getProviderProjectById(projectId, providerId) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        providerId: providerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            customerProfile: {
              select: {
                companySize: true,
                industry: true,
                location: true,
                website: true,
                description: true,
              },
            },
          },
        },
        milestones: {
          orderBy: {
            order: "asc",
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                customerProfile: {
                  select: {
                    companySize: true,
                    industry: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Latest 10 messages
        },
      },
    });

    if (!project) {
      throw new Error("Project not found or you don't have permission to access it");
    }

    // Calculate progress
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(
      (m) => m.status === "APPROVED" || m.status === "PAID"
    ).length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      ...project,
      progress,
      completedMilestones,
      totalMilestones,
    };
  } catch (error) {
    console.error("Error fetching provider project:", error);
    throw error;
  }
}

/**
 * Update project status (provider can update to COMPLETED or DISPUTED)
 */
export async function updateProjectStatus(dto) {
  try {
    // Verify project belongs to provider
    const project = await prisma.project.findFirst({
      where: {
        id: dto.projectId,
        providerId: dto.providerId,
      },
    });

    if (!project) {
      throw new Error("Project not found or you don't have permission to update it");
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: dto.projectId },
      data: { status: dto.status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestones: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: project.customerId,
        type: "project",
        content: `Project "${project.title}" status updated to ${dto.status}`,
      },
    });

    return updatedProject;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
}

/**
 * Update milestone status (provider can submit milestones)
 */
export async function updateMilestoneStatus(dto) {
  try {
    // Verify milestone belongs to provider's project
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: dto.milestoneId,
        project: {
          providerId: dto.providerId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            customerId: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or you don't have permission to update it");
    }

    // Update milestone
    const updatedMilestone = await prisma.milestone.update({
      where: { id: dto.milestoneId },
      data: {
        status: dto.status,
        deliverables: dto.deliverables,
        submittedAt: dto.status === "SUBMITTED" ? new Date() : null,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create notification for customer
    if (dto.status === "SUBMITTED") {
      await prisma.notification.create({
        data: {
          userId: milestone.project.customerId,
          type: "milestone",
          content: `Milestone "${milestone.title}" has been submitted for review`,
        },
      });
    }

    return updatedMilestone;
  } catch (error) {
    console.error("Error updating milestone status:", error);
    throw error;
  }
}

/**
 * Get project statistics for provider
 */
export async function getProviderProjectStats(providerId) {
  try {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalEarnings,
      averageRating,
    ] = await Promise.all([
      prisma.project.count({
        where: { providerId },
      }),
      prisma.project.count({
        where: { 
          providerId,
          status: "IN_PROGRESS",
        },
      }),
      prisma.project.count({
        where: { 
          providerId,
          status: "COMPLETED",
        },
      }),
      prisma.milestone.aggregate({
        where: {
          project: { providerId },
          status: "PAID",
        },
        _sum: { amount: true },
      }),
      prisma.review.aggregate({
        where: {
          project: { providerId },
        },
        _avg: { rating: true },
      }),
    ]);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalEarnings: totalEarnings._sum.amount || 0,
      averageRating: averageRating._avg.rating || 0,
    };
  } catch (error) {
    console.error("Error fetching provider project stats:", error);
    throw new Error("Failed to fetch project statistics");
  }
}
