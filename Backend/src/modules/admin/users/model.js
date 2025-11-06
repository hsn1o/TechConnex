import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userModel = {
  async getAllUsers(filters = {}) {
    const where = {};

    // Filter by role
    if (filters.role && filters.role !== "all") {
      where.role = { has: filters.role.toUpperCase() };
    }

    // Filter by status
    if (filters.status && filters.status !== "all") {
      where.status = filters.status.toUpperCase();
    }

    // Search by name or email
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        providerProfile: {
          select: {
            id: true,
            bio: true,
            location: true,
            hourlyRate: true,
            rating: true,
            totalReviews: true,
            totalProjects: true,
            totalEarnings: true,
            viewsCount: true,
            skills: true,
            yearsExperience: true,
          },
        },
        customerProfile: {
          select: {
            id: true,
            description: true,
            location: true,
            industry: true,
            companySize: true,
            rating: true,
            reviewCount: true,
            totalSpend: true,
            projectsPosted: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: {
          include: {
            certifications: {
              orderBy: { issuedDate: "desc" },
            },
            portfolios: {
              orderBy: { date: "desc" },
            },
            performance: true,
          },
        },
        customerProfile: true,
        KycDocument: {
          orderBy: { uploadedAt: "desc" },
        },
        projectsAsCustomer: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        projectsAsProvider: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return user;
  },

  async updateUserStatus(userId, status) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        providerProfile: {
          select: {
            id: true,
            bio: true,
            location: true,
            rating: true,
            totalProjects: true,
            totalEarnings: true,
          },
        },
        customerProfile: {
          select: {
            id: true,
            description: true,
            location: true,
            totalSpend: true,
            projectsPosted: true,
          },
        },
      },
    });

    return user;
  },

  async updateUser(userId, updateData) {
    // Separate user fields from profile fields
    const { providerProfile, customerProfile, ...userFields } = updateData;
    
    // Update user fields
    const userUpdateData = {};
    const allowedUserFields = ["name", "email", "phone", "isVerified", "status", "kycStatus"];
    Object.keys(userFields).forEach((key) => {
      if (allowedUserFields.includes(key)) {
        userUpdateData[key] = userFields[key];
      }
    });

    // Update user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
      });

      // Update provider profile if provided
      if (providerProfile) {
        await tx.providerProfile.upsert({
          where: { userId },
          update: providerProfile,
          create: {
            userId,
            ...providerProfile,
          },
        });
      }

      // Update customer profile if provided
      if (customerProfile) {
        await tx.customerProfile.upsert({
          where: { userId },
          update: customerProfile,
          create: {
            userId,
            ...customerProfile,
          },
        });
      }

      // Return updated user with profiles
      return await tx.user.findUnique({
        where: { id: userId },
        include: {
          providerProfile: {
            include: {
              certifications: {
                orderBy: { issuedDate: "desc" },
              },
              portfolios: {
                orderBy: { date: "desc" },
              },
              performance: true,
            },
          },
          customerProfile: true,
        },
      });
    });

    return user;
  },

  async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      providers,
      customers,
      admins,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { role: { has: "PROVIDER" } } }),
      prisma.user.count({ where: { role: { has: "CUSTOMER" } } }),
      prisma.user.count({ where: { role: { has: "ADMIN" } } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      providers,
      customers,
      admins,
    };
  },
};

export default prisma;

