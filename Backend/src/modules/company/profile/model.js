import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class CompanyProfileModel {
  // Get company profile by user ID
  static async getProfileByUserId(userId) {
    try {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              kycStatus: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
      });

      return profile;
    } catch (error) {
      throw new Error(`Failed to get company profile: ${error.message}`);
    }
  }

  // Create new company profile
  static async createProfile(userId, profileData) {
    try {
      const profile = await prisma.customerProfile.create({
        data: {
          userId,
          ...profileData,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              kycStatus: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
      });

      return profile;
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("Company profile already exists for this user");
      }
      throw new Error(`Failed to create company profile: ${error.message}`);
    }
  }

  // Update company profile
  static async updateProfile(userId, updateData) {
    try {
      const profile = await prisma.customerProfile.update({
        where: { userId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              kycStatus: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
      });

      return profile;
    } catch (error) {
      if (error.code === "P2025") {
        throw new Error("Company profile not found");
      }
      throw new Error(`Failed to update company profile: ${error.message}`);
    }
  }

  // Check if profile exists
  static async profileExists(userId) {
    try {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      return !!profile;
    } catch (error) {
      throw new Error(`Failed to check profile existence: ${error.message}`);
    }
  }

  // Get profile completion percentage
  static async getProfileCompletion(userId) {
    try {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
        select: {
          description: true,
          industry: true,
          location: true,
          website: true,
          logoUrl: true,
          companySize: true,
          employeeCount: true,
          establishedYear: true,
          annualRevenue: true,
          fundingStage: true,
          preferredContractTypes: true,
          averageBudgetRange: true,
          remotePolicy: true,
          hiringFrequency: true,
          categoriesHiringFor: true,
          mission: true,
          values: true,
          benefits: true,
          mediaGallery: true,
        },
      });

      if (!profile) {
        return 0;
      }

      // Define required fields for completion calculation
      const requiredFields = [
        'description',
        'industry',
        'location',
        'companySize',
        'preferredContractTypes',
        'averageBudgetRange',
        'remotePolicy',
        'hiringFrequency',
        'categoriesHiringFor',
      ];

      const optionalFields = [
        'website',
        'logoUrl',
        'employeeCount',
        'establishedYear',
        'annualRevenue',
        'fundingStage',
        'mission',
        'values',
        'benefits',
        'mediaGallery',
      ];

      let completedRequired = 0;
      let completedOptional = 0;

      // Check required fields
      requiredFields.forEach(field => {
        if (profile[field] && profile[field] !== null && profile[field] !== '') {
          if (Array.isArray(profile[field])) {
            if (profile[field].length > 0) completedRequired++;
          } else {
            completedRequired++;
          }
        }
      });

      // Check optional fields
      optionalFields.forEach(field => {
        if (profile[field] && profile[field] !== null && profile[field] !== '') {
          if (Array.isArray(profile[field])) {
            if (profile[field].length > 0) completedOptional++;
          } else {
            completedOptional++;
          }
        }
      });

      // Calculate completion percentage
      // Required fields are worth 70%, optional fields are worth 30%
      const requiredScore = (completedRequired / requiredFields.length) * 70;
      const optionalScore = (completedOptional / optionalFields.length) * 30;
      const totalScore = Math.round(requiredScore + optionalScore);

      return Math.min(totalScore, 100);
    } catch (error) {
      throw new Error(`Failed to calculate profile completion: ${error.message}`);
    }
  }

  // Update profile completion percentage
  static async updateProfileCompletion(userId) {
    try {
      const completion = await this.getProfileCompletion(userId);
      
      await prisma.customerProfile.update({
        where: { userId },
        data: { completion },
      });

      return completion;
    } catch (error) {
      throw new Error(`Failed to update profile completion: ${error.message}`);
    }
  }

  // Get all company profiles (for admin or public listing)
  static async getAllProfiles(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.industry) {
        where.industry = { contains: filters.industry, mode: 'insensitive' };
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      if (filters.companySize) {
        where.companySize = filters.companySize;
      }

      if (filters.hiringFrequency) {
        where.hiringFrequency = filters.hiringFrequency;
      }

      const profiles = await prisma.customerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              kycStatus: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.skip || 0,
      });

      return profiles;
    } catch (error) {
      throw new Error(`Failed to get company profiles: ${error.message}`);
    }
  }

  // Search company profiles
  static async searchProfiles(searchTerm, filters = {}) {
    try {
      const where = {
        OR: [
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { industry: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
          { mission: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };

      // Apply additional filters
      if (filters.industry) {
        where.industry = { contains: filters.industry, mode: 'insensitive' };
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      if (filters.companySize) {
        where.companySize = filters.companySize;
      }

      const profiles = await prisma.customerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              kycStatus: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.skip || 0,
      });

      return profiles;
    } catch (error) {
      throw new Error(`Failed to search company profiles: ${error.message}`);
    }
  }
}

export default CompanyProfileModel;
