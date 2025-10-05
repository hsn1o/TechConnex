// Data access layer – only Prisma queries. No HTTP or validation here.
import { prisma } from "../../../utils/index.js";

export const findCustomerProfileByUserId = async (userId) => {
  return prisma.customerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true, email: true, name: true, phone: true,
          kycStatus: true, isVerified: true, createdAt: true
        }
      }
    }
  });
};

export const upsertCustomerProfile = async (userId, data) => {
  // Convert plain JS numbers/strings for Decimal
  const toDecimal = (v) =>
    v === null || v === undefined || v === "" ? null : v;

  return prisma.customerProfile.upsert({
    where: { userId },
    update: {
      description: data.description ?? undefined,
      industry: data.industry ?? undefined,
      location: data.location ?? undefined,
      website: data.website ?? undefined,
      logoUrl: data.logoUrl ?? undefined,
      socialLinks: data.socialLinks ?? undefined,
      languages: data.languages ?? undefined,

      companySize: data.companySize ?? undefined,
      employeeCount: data.employeeCount ?? undefined,
      establishedYear: data.establishedYear ?? undefined,
      annualRevenue: toDecimal(data.annualRevenue),
      fundingStage: data.fundingStage ?? undefined,

      preferredContractTypes: data.preferredContractTypes ?? undefined,
      averageBudgetRange: data.averageBudgetRange ?? undefined,
      remotePolicy: data.remotePolicy ?? undefined,
      hiringFrequency: data.hiringFrequency ?? undefined,
      categoriesHiringFor: data.categoriesHiringFor ?? undefined,

      mission: data.mission ?? undefined,
      values: data.values ?? undefined,
      benefits: data.benefits ?? undefined,
      mediaGallery: data.mediaGallery ?? undefined
    },
    create: {
      userId,
      description: data.description ?? null,
      industry: data.industry ?? null,
      location: data.location ?? null,
      website: data.website ?? null,
      logoUrl: data.logoUrl ?? null,
      socialLinks: data.socialLinks ?? null,
      languages: data.languages ?? [],

      companySize: data.companySize ?? null,
      employeeCount: data.employeeCount ?? null,
      establishedYear: data.establishedYear ?? null,
      annualRevenue: toDecimal(data.annualRevenue),
      fundingStage: data.fundingStage ?? null,

      preferredContractTypes: data.preferredContractTypes ?? [],
      averageBudgetRange: data.averageBudgetRange ?? null,
      remotePolicy: data.remotePolicy ?? null,
      hiringFrequency: data.hiringFrequency ?? null,
      categoriesHiringFor: data.categoriesHiringFor ?? [],

      mission: data.mission ?? null,
      values: data.values ?? [],
      benefits: data.benefits ?? null,
      mediaGallery: data.mediaGallery ?? []
    },
    include: {
      user: {
        select: {
          id: true, email: true, name: true, phone: true,
          kycStatus: true, isVerified: true, createdAt: true
        }
      }
    }
  });
};
