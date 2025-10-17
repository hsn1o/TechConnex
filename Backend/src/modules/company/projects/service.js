// src/modules/company/projects/service.js
import { prisma } from "./model.js";
import { CreateProjectDto, GetProjectsDto } from "./dto.js";

export async function createProject(dto) {
  try {
    // Create a ServiceRequest - Projects are created when proposals are accepted
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        skills: dto.skills,
        timeline: dto.timeline,
        priority: dto.priority,
        ndaSigned: dto.ndaSigned || false,
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
        milestones: {
          orderBy: {
            order: "asc",
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
    const skip = (dto.page - 1) * dto.limit;

    // Build where clauses for both ServiceRequests and Projects
    const serviceRequestWhere = {
      customerId: dto.customerId,
      status: { not: "MATCHED" }, // Only get non-matched service requests
    };

    const projectWhere = {
      customerId: dto.customerId,
    };

    // Apply filters
    if (dto.status) {
      if (dto.status === "OPEN" || dto.status === "CLOSED") {
        serviceRequestWhere.status = dto.status;
      } else if (["IN_PROGRESS", "COMPLETED", "DISPUTED"].includes(dto.status)) {
        projectWhere.status = dto.status;
      }
    }

    if (dto.category) {
      serviceRequestWhere.category = dto.category;
      projectWhere.category = dto.category;
    }

    // Fetch ServiceRequests and Projects in parallel
    const [serviceRequests, projects, serviceRequestTotal, projectTotal] = await Promise.all([
      prisma.serviceRequest.findMany({
        where: serviceRequestWhere,
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
          milestones: {
            orderBy: {
              order: "asc",
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
      prisma.project.findMany({
        where: projectWhere,
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
            orderBy: {
              order: "asc",
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: dto.limit,
      }),
      prisma.serviceRequest.count({ where: serviceRequestWhere }),
      prisma.project.count({ where: projectWhere }),
    ]);

    // Add type field and merge the results
    const serviceRequestsWithType = serviceRequests.map(item => ({
      ...item,
      type: "ServiceRequest",
    }));

    const projectsWithType = projects.map(item => ({
      ...item,
      type: "Project",
    }));

    // Combine and sort by creation date
    const combinedItems = [...serviceRequestsWithType, ...projectsWithType]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination to combined results
    const paginatedItems = combinedItems.slice(skip, skip + dto.limit);
    const total = serviceRequestTotal + projectTotal;
    const totalPages = Math.ceil(total / dto.limit);

    return {
      items: paginatedItems,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching projects and service requests:", error);
    throw new Error("Failed to fetch projects and service requests");
  }
}

export async function getProjectById(projectId, customerId) {
  try {
    // First try to find as ServiceRequest
    let serviceRequest = await prisma.serviceRequest.findFirst({
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
                    bio: true,
                    skills: true,
                  },
                },
              },
            },
            milestones: {
              orderBy: {
                order: "asc",
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
            proposals: true,
          },
        },
      },
    });

    if (serviceRequest) {
      return {
        ...serviceRequest,
        type: "ServiceRequest",
      };
    }

    // If not found as ServiceRequest, try as Project
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
            order: "asc",
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project or ServiceRequest not found");
    }

    return {
      ...project,
      type: "Project",
    };
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

// ServiceRequest milestone management functions
export async function getServiceRequestMilestones(serviceRequestId, customerId) {
  try {
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id: serviceRequestId,
        customerId: customerId,
        status: "OPEN", // Only allow milestone management for OPEN requests
      },
      include: {
        milestones: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!serviceRequest) {
      throw new Error("ServiceRequest not found or not in OPEN status");
    }

    return serviceRequest.milestones;
  } catch (error) {
    console.error("Error fetching service request milestones:", error);
    throw new Error("Failed to fetch service request milestones");
  }
}

export async function updateServiceRequestMilestones(serviceRequestId, customerId, milestones) {
  try {
    // First verify the service request exists and is in OPEN status
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id: serviceRequestId,
        customerId: customerId,
        status: "OPEN",
      },
    });

    if (!serviceRequest) {
      throw new Error("ServiceRequest not found or not in OPEN status");
    }

    // Validate milestone amounts are within budget range
    const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    if (totalAmount < serviceRequest.budgetMin || totalAmount > serviceRequest.budgetMax) {
      throw new Error("Total milestone amount must be within budget range");
    }

    // Delete existing milestones and create new ones
    await prisma.$transaction(async (tx) => {
      // Delete existing milestones
      await tx.serviceRequestMilestone.deleteMany({
        where: {
          serviceRequestId: serviceRequestId,
        },
      });

      // Create new milestones
      await tx.serviceRequestMilestone.createMany({
        data: milestones.map((milestone, index) => ({
          serviceRequestId: serviceRequestId,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
          order: index + 1,
          status: "PENDING",
          source: "COMPANY",
        })),
      });
    });

    // Return updated milestones
    return await getServiceRequestMilestones(serviceRequestId, customerId);
  } catch (error) {
    console.error("Error updating service request milestones:", error);
    throw new Error("Failed to update service request milestones");
  }
}


// src/modules/company/projects/service.js
export async function updateProjectDetails(id, customerId, dto) {
  // Try updating an OPEN ServiceRequest owned by this customer
  const sr = await prisma.serviceRequest.findFirst({
    where: { id, customerId }
  });
  if (!sr) {
    // If not a ServiceRequest, optionally update a Project the customer owns:
    const pj = await prisma.project.findFirst({
      where: { id, customerId }
    });
    if (!pj) throw new Error("Not found or not authorized");
    return prisma.project.update({
      where: { id: pj.id },
      data: filterUndefined({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        timeline: dto.timeline,
        priority: dto.priority,
        skills: dto.skills,
        ndaSigned: dto.ndaSigned,
        requirements: dto.requirements,
        deliverables: dto.deliverables,
      }),
    });
  }

  // ServiceRequest update
  return prisma.serviceRequest.update({
    where: { id: sr.id },
    data: filterUndefined({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      timeline: dto.timeline,
      priority: dto.priority,
      skills: dto.skills,
      ndaSigned: dto.ndaSigned,
      requirements: dto.requirements,
      deliverables: dto.deliverables,
    }),
  });
}

/**
 * Approve individual milestone (company can approve submitted milestones)
 */
export async function approveIndividualMilestone(dto) {
  try {
    // Verify milestone belongs to company's project
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: dto.milestoneId,
        project: {
          customerId: dto.customerId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            providerId: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or you don't have permission to approve it");
    }

    // Check if milestone is in SUBMITTED status
    if (milestone.status !== "SUBMITTED") {
      throw new Error("Milestone must be in SUBMITTED status to be approved");
    }

    // Update milestone to APPROVED status
    const updatedMilestone = await prisma.milestone.update({
      where: { id: dto.milestoneId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: dto.customerId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            provider: {
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

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: milestone.project.providerId,
        type: "milestone",
        content: `Milestone "${milestone.title}" has been approved and is ready for payment`,
      },
    });

    return updatedMilestone;
  } catch (error) {
    console.error("Error approving individual milestone:", error);
    throw error;
  }
}

/**
 * Mark milestone as paid (company can pay approved milestones)
 */
export async function payMilestone(dto) {
  try {
    // Verify milestone belongs to company's project
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: dto.milestoneId,
        project: {
          customerId: dto.customerId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            providerId: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or you don't have permission to pay it");
    }

    // Check if milestone is in APPROVED status
    if (milestone.status !== "APPROVED") {
      throw new Error("Milestone must be in APPROVED status to be paid");
    }

    // Update milestone to PAID status
    const updatedMilestone = await prisma.milestone.update({
      where: { id: dto.milestoneId },
      data: {
        status: "PAID",
        isPaid: true,
        paidAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            provider: {
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

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: milestone.project.providerId,
        type: "payment",
        content: `Payment for milestone "${milestone.title}" has been processed (RM ${milestone.amount})`,
      },
    });

    return updatedMilestone;
  } catch (error) {
    console.error("Error paying milestone:", error);
    throw error;
  }
}

function filterUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([,v]) => v !== undefined));
}
