import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminProjectModel = {
  async getAllProjects(filters = {}) {
    const where = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status.toUpperCase();
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
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
        Dispute: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  },

  async getProjectById(projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: {
          include: {
            customerProfile: true,
          },
        },
        provider: {
          include: {
            providerProfile: true,
          },
        },
        milestones: {
          orderBy: {
            order: "asc",
          },
        },
        Dispute: {
          include: {
            raisedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    // Find the ServiceRequest that created this Project to get the proposal
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        projectId: project.id,
      },
      select: {
        id: true,
        timeline: true, // Original company timeline
        acceptedProposalId: true,
      },
    });

    // Find the proposal that was accepted to create this project
    let proposal = null;
    if (serviceRequest?.acceptedProposalId) {
      proposal = await prisma.proposal.findFirst({
        where: {
          id: serviceRequest.acceptedProposalId,
        },
        select: {
          id: true,
          attachmentUrls: true,
          createdAt: true,
          deliveryTime: true, // Provider's proposed timeline in days
        },
      });
    }

    return {
      ...project,
      proposal: proposal, // Include proposal with attachments
      originalTimeline: serviceRequest?.timeline || null,
      providerProposedTimeline: proposal?.deliveryTime || null,
      serviceRequestId: serviceRequest?.id || null,
    };
  },

  async updateProject(projectId, updateData) {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
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

    // Auto-resolve any UNDER_REVIEW disputes if project is completed
    if (updateData.status === "COMPLETED") {
      try {
        const { disputeService } = await import("../../disputes/service.js");
        await disputeService.autoResolveDisputeOnProjectCompletion(projectId);
      } catch (error) {
        console.error("Error auto-resolving dispute:", error);
        // Don't fail the update if dispute resolution fails
      }
    }

    return project;
  },

  async getProjectStats() {
    const [total, inProgress, completed, disputed] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.project.count({ where: { status: "DISPUTED" } }),
    ]);

    const projects = await prisma.project.findMany({
      select: {
        budgetMin: true,
        budgetMax: true,
      },
    });

    const totalValue = projects.reduce((sum, p) => {
      return sum + (p.budgetMax || p.budgetMin || 0);
    }, 0);

    return {
      totalProjects: total,
      activeProjects: inProgress,
      completedProjects: completed,
      disputedProjects: disputed,
      totalValue,
    };
  },
};

export default prisma;

