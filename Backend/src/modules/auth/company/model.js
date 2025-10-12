import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function createCompanyUser(dto) {
  return prisma.user.create({
    data: {
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
      role: { set: dto.role || ["CUSTOMER"] }, // must use { set: [...] }
      kycStatus: dto.kycStatus || "pending_verification",
      isVerified: dto.isVerified ?? false,
      customerProfile: dto.customerProfile
        ? {
            create: {
              description: dto.customerProfile.description || "",
              industry: dto.customerProfile.industry || "",
              location: dto.customerProfile.location || "",
              website: dto.customerProfile.website || null,
              logoUrl: dto.customerProfile.logoUrl || null,
              socialLinks: dto.customerProfile.socialLinks || null,
              languages: dto.customerProfile.languages || [],
              companySize: dto.customerProfile.companySize || null,
              employeeCount: dto.customerProfile.employeeCount || null,
              establishedYear: dto.customerProfile.establishedYear || null,
              annualRevenue: dto.customerProfile.annualRevenue
                ? new Prisma.Decimal(dto.customerProfile.annualRevenue)
                : null,

              fundingStage: dto.customerProfile.fundingStage || null,
              preferredContractTypes:
                dto.customerProfile.preferredContractTypes || [],
              averageBudgetRange:
                dto.customerProfile.averageBudgetRange || null,
              remotePolicy: dto.customerProfile.remotePolicy || null,
              hiringFrequency: dto.customerProfile.hiringFrequency || null,
              categoriesHiringFor:
                dto.customerProfile.categoriesHiringFor || [],
              completion: dto.customerProfile.completion || null,
              rating: dto.customerProfile.rating || 0,
              reviewCount: dto.customerProfile.reviewCount || 0,
              totalSpend: dto.customerProfile.totalSpend
                ? new Prisma.Decimal(dto.customerProfile.totalSpend)
                : null,
              projectsPosted: dto.customerProfile.projectsPosted || 0,
              lastActiveAt: dto.customerProfile.lastActiveAt
                ? new Date(dto.customerProfile.lastActiveAt)
                : null,
              mission: dto.customerProfile.mission || null,
              values: dto.customerProfile.values || [],
              benefits: dto.customerProfile.benefits || null,
              mediaGallery: dto.customerProfile.mediaGallery || [],
            },
          }
        : undefined,
    },
    include: { customerProfile: true },
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

async function updateCompanyUser(userId, updateData) {
  // Separate nested customerProfile updates from user-level updates
  const { customerProfile, ...userFields } = updateData;

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...userFields,
      role: userFields.role ? { set: userFields.role } : undefined, // handle roles
      customerProfile: customerProfile
        ? {
            update: customerProfile, // dynamically update nested profile
          }
        : undefined,
    },
    include: { customerProfile: true },
  });
}



export {
  findUserById,
  createCompanyUser,
  findProviderProfile,
  createProviderProfile,
  updateUserRole,
  updateCompanyUser,
};
