import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProviderProfileModel {
  // Get provider profile by user ID
  static async getProfileByUserId(userId) {
    try {
      const profile = await prisma.providerProfile.findUnique({
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
              KycDocument: {
                select: {
                  id: true,
                  type: true,
                  fileUrl: true,
                  filename: true,
                  mimeType: true,
                  status: true,
                  reviewNotes: true,
                  reviewedBy: true,
                  uploadedAt: true,
                  reviewedAt: true,
                },
                orderBy: {
                  uploadedAt: 'desc',
                },
              },
            },
          },
          certifications: {
            orderBy: {
              issuedDate: 'desc',
            },
          },
          portfolios: {
            orderBy: {
              date: 'desc',
            },
          },
          performance: true,
        },
      });

      return profile;
    } catch (error) {
      throw new Error(`Failed to get provider profile: ${error.message}`);
    }
  }

  // Create new provider profile
  static async createProfile(userId, profileData) {
    try {
      const profile = await prisma.providerProfile.create({
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
      throw new Error(`Failed to create provider profile: ${error.message}`);
    }
  }

  // Update provider profile
  static async updateProfile(userId, profileData) {
    try {
      const profile = await prisma.providerProfile.update({
        where: { userId },
        data: profileData,
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
      throw new Error(`Failed to update provider profile: ${error.message}`);
    }
  }

  // Upsert provider profile (create or update)
  static async upsertProfile(userId, profileData) {
    try {
      const profile = await prisma.providerProfile.upsert({
        where: { userId },
        update: profileData,
        create: {
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
      throw new Error(`Failed to upsert provider profile: ${error.message}`);
    }
  }

  // Check if profile exists
  static async profileExists(userId) {
    try {
      const profile = await prisma.providerProfile.findUnique({
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
      const profile = await prisma.providerProfile.findUnique({
        where: { userId },
        select: {
          bio: true,
          location: true,
          hourlyRate: true,
          availability: true,
          languages: true,
          website: true,
          profileVideoUrl: true,
          skills: true,
          yearsExperience: true,
          minimumProjectBudget: true,
          maximumProjectBudget: true,
          preferredProjectDuration: true,
          workPreference: true,
          teamSize: true,
        },
      });

      if (!profile) {
        return 0;
      }

      // Calculate completion based on filled fields
      const fields = [
        'bio', 'location', 'hourlyRate', 'availability', 'languages', 
        'website', 'profileVideoUrl', 'skills', 'yearsExperience',
        'minimumProjectBudget', 'maximumProjectBudget', 'preferredProjectDuration',
        'workPreference', 'teamSize'
      ];

      const filledFields = fields.filter(field => {
        const value = profile[field];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== undefined && value !== '';
      });

      return Math.round((filledFields.length / fields.length) * 100);
    } catch (error) {
      throw new Error(`Failed to calculate profile completion: ${error.message}`);
    }
  }

  // Update profile completion
  static async updateProfileCompletion(userId) {
    try {
      const completion = await this.getProfileCompletion(userId);
      
      await prisma.providerProfile.update({
        where: { userId },
        data: { completion },
      });

      return completion;
    } catch (error) {
      throw new Error(`Failed to update profile completion: ${error.message}`);
    }
  }

  // Get profile statistics
  static async getProfileStats(userId) {
    try {
      const profile = await prisma.providerProfile.findUnique({
        where: { userId },
        select: {
          rating: true,
          totalReviews: true,
          totalProjects: true,
          totalEarnings: true,
          viewsCount: true,
          successRate: true,
          responseTime: true,
          completion: true,
        },
      });

      return profile || {
        rating: 0,
        totalReviews: 0,
        totalProjects: 0,
        totalEarnings: 0,
        viewsCount: 0,
        successRate: 0,
        responseTime: 0,
        completion: 0,
      };
    } catch (error) {
      throw new Error(`Failed to get profile stats: ${error.message}`);
    }
  }
}

export default ProviderProfileModel;
