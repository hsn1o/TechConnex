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

    // Add hasProposed flag and filter out already proposed requests
    const opportunities = serviceRequests
      .filter(sr => !proposedServiceRequestIds.has(sr.id))
      .map(sr => ({
        ...sr,
        hasProposed: false,
      }));

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

    return {
      ...serviceRequest,
      hasProposed: !!existingProposal,
    };
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    throw new Error("Failed to fetch opportunity");
  }
}
