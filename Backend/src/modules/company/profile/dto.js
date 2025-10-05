import { z } from "zod";

// Accept partials (PUT will upsert – we allow partial updates)
export const UpsertCustomerProfileSchema = z.object({
  description: z.string().trim().max(2000).optional().nullable(),
  industry: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  website: z.string().url().max(300).optional().nullable(),
  logoUrl: z.string().url().max(500).optional().nullable(),
  socialLinks: z.record(z.any()).optional().nullable(),
  languages: z.array(z.string().trim().max(50)).optional().nullable(),

  companySize: z.string().trim().max(50).optional().nullable(),
  employeeCount: z.number().int().min(0).optional().nullable(),
  establishedYear: z.number().int().min(1800).max(2100).optional().nullable(),
  annualRevenue: z.union([z.number(), z.string()]).optional().nullable(),
  fundingStage: z.string().trim().max(50).optional().nullable(),

  preferredContractTypes: z.array(z.string().max(40)).optional().nullable(),
  averageBudgetRange: z.string().trim().max(50).optional().nullable(),
  remotePolicy: z.string().trim().max(30).optional().nullable(),
  hiringFrequency: z.string().trim().max(30).optional().nullable(),
  categoriesHiringFor: z.array(z.string().max(60)).optional().nullable(),

  mission: z.string().trim().max(2000).optional().nullable(),
  values: z.array(z.string().trim().max(100)).optional().nullable(),
  benefits: z.record(z.any()).optional().nullable(),
  mediaGallery: z.array(z.string().url().max(500)).optional().nullable()
});
