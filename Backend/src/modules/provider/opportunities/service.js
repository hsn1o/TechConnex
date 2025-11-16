// src/modules/provider/opportunities/service.js
import { prisma } from "./model.js";
import { GetOpportunitiesDto } from "./dto.js";

export async function getOpportunities(dto) {
  try {
    const skip = (dto.page - 1) * dto.limit;

    // Build where clause for ServiceRequests
    const where = {
      status: "OPEN", // Only show OPEN ServiceRequests
      NOT: {
        customerId: dto.providerId, // Exclude requests by the same provider
      },
    };

    // Apply filters
    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.skills && dto.skills.length > 0) {
      where.skills = {
        hasSome: dto.skills, // At least one skill matches
      };
    }

    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search, mode: 'insensitive' } },
        { description: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    // Get ServiceRequests with proposal count and check if current provider has proposed
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
                  location: true,
                  website: true,
                  logoUrl: true,
                  profileImageUrl: true, // 🆕 Profile image
                  totalSpend: true,
                  projectsPosted: true, // 🆕 Projects posted count
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
      prisma.serviceRequest.count({ where }),
    ]);

    // Check which ServiceRequests the current provider has already proposed to
    const serviceRequestIds = serviceRequests.map(sr => sr.id);
    const existingProposals = await prisma.proposal.findMany({
      where: {
        providerId: dto.providerId,
        serviceRequestId: {
          in: serviceRequestIds,
        },
      },
      select: {
        serviceRequestId: true,
      },
    });

    const proposedServiceRequestIds = new Set(existingProposals.map(p => p.serviceRequestId));

    // Calculate projectsPosted dynamically for each company
    const customerIds = [...new Set(serviceRequests.map(sr => sr.customerId))];
    const projectsPostedCounts = customerIds.length > 0 ? await prisma.serviceRequest.groupBy({
      by: ['customerId'],
      where: {
        customerId: { in: customerIds },
      },
      _count: {
        id: true,
      },
    }) : [];

    const projectsPostedMap = new Map();
    projectsPostedCounts.forEach(item => {
      projectsPostedMap.set(item.customerId, item._count.id);
    });

    // Add hasProposed flag, filter out already proposed requests, and update projectsPosted
    const opportunities = serviceRequests
      .filter(sr => !proposedServiceRequestIds.has(sr.id))
      .map(sr => {
        const projectsPosted = projectsPostedMap.get(sr.customerId) || 0;
        return {
          ...sr,
          hasProposed: false,
          customer: sr.customer ? {
            ...sr.customer,
            customerProfile: sr.customer.customerProfile ? {
              ...sr.customer.customerProfile,
              projectsPosted: projectsPosted,
            } : null,
          } : null,
        };
      });

    const totalPages = Math.ceil(total / dto.limit);

    return {
      opportunities,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total: opportunities.length,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    throw new Error("Failed to fetch opportunities");
  }
}

export async function getOpportunityById(opportunityId, providerId) {
  try {
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id: opportunityId,
        status: "OPEN",
        NOT: {
          customerId: providerId, // Exclude requests by the same provider
        },
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
                location: true,
                website: true,
                description: true,
                logoUrl: true,
                profileImageUrl: true, // 🆕 Profile image
                totalSpend: true,
                projectsPosted: true, // 🆕 Projects posted count
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

    if (!serviceRequest) {
      throw new Error("Opportunity not found");
    }

    // Check if provider has already proposed
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        providerId: providerId,
        serviceRequestId: opportunityId,
      },
    });

    // Calculate projectsPosted dynamically
    const projectsPostedCount = await prisma.serviceRequest.count({
      where: {
        customerId: serviceRequest.customerId,
      },
    });

    // Update customerProfile with calculated projectsPosted
    const updatedServiceRequest = {
      ...serviceRequest,
      hasProposed: !!existingProposal,
      customer: serviceRequest.customer ? {
        ...serviceRequest.customer,
        customerProfile: serviceRequest.customer.customerProfile ? {
          ...serviceRequest.customer.customerProfile,
          projectsPosted: projectsPostedCount,
        } : null,
      } : null,
    };

    return updatedServiceRequest;
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    throw new Error("Failed to fetch opportunity");
  }
}
