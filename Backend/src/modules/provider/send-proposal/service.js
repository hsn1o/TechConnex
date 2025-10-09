// src/modules/provider/send-proposal/service.js
import { prisma } from "./model.js";
import { SendProposalDto, GetProposalsDto } from "./dto.js";

export async function sendProposal(dto) {
  try {
    // Check if provider already sent a proposal for this request
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        providerId: dto.providerId,
        requestId: dto.requestId,
      },
    });

    if (existingProposal) {
      throw new Error("You have already sent a proposal for this request");
    }

    // Check if the service request exists and is open
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: dto.requestId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!serviceRequest) {
      throw new Error("Service request not found");
    }

    if (serviceRequest.status !== "OPEN") {
      throw new Error("This service request is no longer accepting proposals");
    }

    // Check if bid amount is within the budget range
    if (dto.bidAmount < serviceRequest.budgetMin || dto.bidAmount > serviceRequest.budgetMax) {
      throw new Error("Bid amount must be within the specified budget range");
    }

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
        providerId: dto.providerId,
        requestId: dto.requestId,
        bidAmount: dto.bidAmount,
        deliveryTime: dto.deliveryTime,
        coverLetter: dto.coverLetter,
        attachmentUrl: dto.attachmentUrl,
        proposedMilestones: dto.milestones.length > 0 ? dto.milestones : null,
        // Note: Actual milestones are not created during proposal creation
        // They will be created when the proposal is accepted and a project is formed
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
                totalProjects: true,
                location: true,
                bio: true,
                skills: true,
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
            customer: {
              select: {
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
          },
        },
        milestones: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    });

    return proposal;
  } catch (error) {
    console.error("Error sending proposal:", error);
    throw new Error(error.message || "Failed to send proposal");
  }
}

export async function getProposals(dto) {
  try {
    const where = {
      providerId: dto.providerId,
    };

    const skip = (dto.page - 1) * dto.limit;

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: {
          serviceRequest: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              budgetMin: true,
              budgetMax: true,
              timeline: true,
              status: true,
              customer: {
                select: {
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
    console.error("Error fetching proposals:", error);
    throw new Error("Failed to fetch proposals");
  }
}

export async function getProposalById(proposalId, providerId) {
  try {
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: proposalId,
        providerId: providerId,
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
                totalProjects: true,
                location: true,
                bio: true,
                skills: true,
                certifications: true,
                portfolios: true,
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
            customer: {
              select: {
                name: true,
                email: true,
                customerProfile: {
                  select: {
                    companySize: true,
                    industry: true,
                    website: true,
                    description: true,
                  },
                },
              },
            },
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
      throw new Error("Proposal not found");
    }

    return proposal;
  } catch (error) {
    console.error("Error fetching proposal:", error);
    throw new Error("Failed to fetch proposal");
  }
}

export async function updateProposal(proposalId, providerId, updateData) {
  try {
    const proposal = await prisma.proposal.update({
      where: {
        id: proposalId,
        providerId: providerId,
      },
      data: {
        bidAmount: updateData.bidAmount,
        deliveryTime: updateData.deliveryTime,
        coverLetter: updateData.coverLetter,
        attachmentUrl: updateData.attachmentUrl,
      },
      include: {
        provider: {
          select: {
            name: true,
            email: true,
          },
        },
        serviceRequest: {
          select: {
            title: true,
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return proposal;
  } catch (error) {
    console.error("Error updating proposal:", error);
    throw new Error("Failed to update proposal");
  }
}

export async function deleteProposal(proposalId, providerId) {
  try {
    await prisma.proposal.delete({
      where: {
        id: proposalId,
        providerId: providerId,
      },
    });

    return { message: "Proposal deleted successfully" };
  } catch (error) {
    console.error("Error deleting proposal:", error);
    throw new Error("Failed to delete proposal");
  }
}