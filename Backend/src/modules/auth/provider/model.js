import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// User queries
async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function createProviderUser(dto) {
  return prisma.user.create({
    data: {
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
      role: { set: dto.role || ["PROVIDER"] }, // must use { set: [...] }
      kycStatus: dto.kycStatus || "pending_verification",
      isVerified: dto.isVerified ?? false,
      providerProfile: dto.providerProfile
        ? {
            create: {
              bio: dto.providerProfile.bio || "",
              location: dto.providerProfile.location || "",
              hourlyRate: dto.providerProfile.hourlyRate
                ? new Prisma.Decimal(dto.providerProfile.hourlyRate)
                : null,
              availability: dto.providerProfile.availability || null,
              languages: dto.providerProfile.languages || [],
              website: dto.providerProfile.website || null,
              profileVideoUrl: dto.providerProfile.profileVideoUrl || null,
              
              // Performance metrics
              rating: dto.providerProfile.rating
                ? new Prisma.Decimal(dto.providerProfile.rating)
                : new Prisma.Decimal(0.00),
              totalReviews: dto.providerProfile.totalReviews || 0,
              totalProjects: dto.providerProfile.totalProjects || 0,
              totalEarnings: dto.providerProfile.totalEarnings
                ? new Prisma.Decimal(dto.providerProfile.totalEarnings)
                : new Prisma.Decimal(0.00),
              viewsCount: dto.providerProfile.viewsCount || 0,
              successRate: dto.providerProfile.successRate
                ? new Prisma.Decimal(dto.providerProfile.successRate)
                : new Prisma.Decimal(0.00),
              responseTime: dto.providerProfile.responseTime || 0,
              isFeatured: dto.providerProfile.isFeatured || false,
              isVerified: dto.providerProfile.isVerified || false,
              completion: dto.providerProfile.completion || null,

              // Skills & work preferences
              skills: dto.providerProfile.skills || [],
              yearsExperience: dto.providerProfile.yearsExperience || null,
              minimumProjectBudget: dto.providerProfile.minimumProjectBudget
                ? new Prisma.Decimal(dto.providerProfile.minimumProjectBudget)
                : null,
              maximumProjectBudget: dto.providerProfile.maximumProjectBudget
                ? new Prisma.Decimal(dto.providerProfile.maximumProjectBudget)
                : null,
              preferredProjectDuration: dto.providerProfile.preferredProjectDuration || null,
              workPreference: dto.providerProfile.workPreference || "remote",
              teamSize: dto.providerProfile.teamSize || 1,
            },
          }
        : undefined,
    },
    include: { providerProfile: true },
  });
}

// Provider profile queries
async function findProviderProfile(userId) {
  return prisma.providerProfile.findUnique({ where: { userId } });
}

async function createProviderProfile(userId, profileData) {
  return prisma.providerProfile.create({
    data: { userId, ...profileData },
  });
}

async function updateUserRole(userId, roles) {
  return prisma.user.update({
    where: { id: userId },
    data: { role: roles },
  });
}

export {
  findUserByEmail,
  findUserById,
  createProviderUser,
  findProviderProfile,
  createProviderProfile,
  updateUserRole,
};
