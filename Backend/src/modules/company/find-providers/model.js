// src/modules/company/find-providers/model.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Find providers with filtering and pagination
export async function findProviders(filters) {
  const {
    search,
    category,
    location,
    rating,
    sortBy,
    page,
    limit,
    minRate,
    maxRate,
    skills,
    availability,
    verified,
    topRated,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    role: {
      has: "PROVIDER",
    },
    providerProfile: {
      isNot: null,
    },
  };

  // Search filter
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        providerProfile: {
          bio: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        providerProfile: {
          skills: {
            hasSome: [search],
          },
        },
      },
    ];
  }

  // Category filter (skills/specialties)
  if (category && category !== "all") {
    where.providerProfile = {
      ...where.providerProfile,
      skills: {
        hasSome: [category],
      },
    };
  }

  // Location filter
  if (location && location !== "all") {
    where.providerProfile = {
      ...where.providerProfile,
      location: {
        contains: location,
        mode: "insensitive",
      },
    };
  }

  // Rating filter
  if (rating && rating !== "all") {
    const minRating = parseFloat(rating.replace("+", ""));
    where.providerProfile = {
      ...where.providerProfile,
      rating: {
        gte: minRating,
      },
    };
  }

  // Rate range filter
  if (minRate > 0 || maxRate < 10000) {
    where.providerProfile = {
      ...where.providerProfile,
      hourlyRate: {
        gte: minRate,
        lte: maxRate,
      },
    };
  }

  // Skills filter
  if (skills && skills.length > 0) {
    where.providerProfile = {
      ...where.providerProfile,
      skills: {
        hasSome: skills,
      },
    };
  }

  // Availability filter
  if (availability && availability !== "all") {
    where.providerProfile = {
      ...where.providerProfile,
      availability: {
        contains: availability,
        mode: "insensitive",
      },
    };
  }

  // Verified filter
  if (verified) {
    where.providerProfile = {
      ...where.providerProfile,
      isVerified: true,
    };
  }

  // Top rated filter
  if (topRated) {
    where.providerProfile = {
      ...where.providerProfile,
      isFeatured: true,
    };
  }

  // Build order by
  let orderBy = {};
  switch (sortBy) {
    case "rating":
      orderBy = { providerProfile: { rating: "desc" } };
      break;
    case "price-low":
      orderBy = { providerProfile: { hourlyRate: "asc" } };
      break;
    case "price-high":
      orderBy = { providerProfile: { hourlyRate: "desc" } };
      break;
    case "experience":
      orderBy = { providerProfile: { yearsExperience: "desc" } };
      break;
    default:
      orderBy = { providerProfile: { rating: "desc" } };
  }

  // Execute query
  const [providers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        providerProfile: {
          include: {
            certifications: true,
            portfolios: true,
            performance: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    providers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Get provider by ID with full details
export async function getProviderById(providerId, userId = null) {
  const provider = await prisma.user.findUnique({
    where: {
      id: providerId,
      role: {
        has: "PROVIDER",
      },
    },
    include: {
      providerProfile: {
        include: {
          certifications: true,
          portfolios: true,
          performance: true,
        },
      },
    },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  // Check if saved by user
  let isSaved = false;
  if (userId) {
    const savedProvider = await prisma.savedProvider.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });
    isSaved = !!savedProvider;
  }

  return {
    ...provider,
    isSaved,
  };
}

// Get provider reviews
export async function getProviderReviews(providerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        recipientId: providerId,
      },
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: {
        recipientId: providerId,
      },
    }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Save/unsave provider
export async function saveProvider(userId, providerId) {
  // Check if already saved
  const existing = await prisma.savedProvider.findUnique({
    where: {
      userId_providerId: {
        userId,
        providerId,
      },
    },
  });

  if (existing) {
    throw new Error("Provider already saved");
  }

  return await prisma.savedProvider.create({
    data: {
      userId,
      providerId,
    },
  });
}

// Unsave provider
export async function unsaveProvider(userId, providerId) {
  const deleted = await prisma.savedProvider.delete({
    where: {
      userId_providerId: {
        userId,
        providerId,
      },
    },
  });

  return deleted;
}

// Get saved providers for user
export async function getSavedProviders(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [savedProviders, total] = await Promise.all([
    prisma.savedProvider.findMany({
      where: {
        userId,
      },
      include: {
        provider: {
          include: {
            providerProfile: {
              include: {
                certifications: true,
                portfolios: true,
                performance: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.savedProvider.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    providers: savedProviders.map((sp) => ({
      ...sp.provider,
      savedAt: sp.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Get provider statistics
export async function getProviderStats(providerId) {
  const [
    totalProjects,
    completedProjects,
    totalReviews,
    averageRating,
    totalEarnings,
  ] = await Promise.all([
    prisma.project.count({
      where: {
        providerId,
      },
    }),
    prisma.project.count({
      where: {
        providerId,
        status: "COMPLETED",
      },
    }),
    prisma.review.count({
      where: {
        recipientId: providerId,
      },
    }),
    prisma.review.aggregate({
      where: {
        recipientId: providerId,
      },
      _avg: {
        rating: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        project: {
          providerId,
        },
        status: "RELEASED",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalProjects,
    completedProjects,
    totalReviews,
    averageRating: averageRating._avg.rating || 0,
    totalEarnings: totalEarnings._sum.amount || 0,
    completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
  };
}
