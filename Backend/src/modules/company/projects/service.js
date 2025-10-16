// src/modules/company/projects/service.js
import { prisma } from "./model.js";
import { CreateProjectDto, GetProjectsDto } from "./dto.js";

export async function createProject(dto) {
  try {
    // First, create a service request instead of a project directly
    // Projects are created when proposals are accepted
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        timeline: dto.timeline,
        priority: dto.priority,
        skills: dto.skills,
        requirements: dto.requirements,
        deliverables: dto.deliverables,
        customerId: dto.customerId,
        status: "OPEN",
      },
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
              },
            },
          },
        },
        proposals: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    return serviceRequest;
  } catch (error) {
    console.error("Error creating service request:", error);
    throw new Error("Failed to create service request");
  }
}

export async function getProjects(dto) {
  try {
    const where = {
      customerId: dto.customerId,
    };

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.category) {
      where.category = dto.category;
    }

    const skip = (dto.page - 1) * dto.limit;

    const [serviceRequests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
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
                },
              },
            },
          },
          proposals: {
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
                    },
                  },
                },
              },
            },
          },
          project: {
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
                    },
                  },
                },
              },
              milestones: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  amount: true,
                  dueDate: true,
                },
              },
            },
          },
          _count: {
            select: {
              proposals: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: dto.limit,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / dto.limit);

    return {
      serviceRequests,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching service requests:", error);
    throw new Error("Failed to fetch service requests");
  }
}

export async function getProjectById(projectId, customerId) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: customerId,
      },
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
                website: true,
              },
            },
          },
        },
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
              },
            },
          },
        },
        milestones: {
          orderBy: {
            dueDate: "asc",
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                name: true,
                customerProfile: {
                  select: {
                    industry: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to fetch project");
  }
}

export async function updateProjectStatus(projectId, customerId, status) {
  try {
    const project = await prisma.project.update({
      where: {
        id: projectId,
        customerId: customerId,
      },
      data: {
        status: status,
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
      },
    });

    return project;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw new Error("Failed to update project status");
  }
}