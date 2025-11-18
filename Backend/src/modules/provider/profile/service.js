
import ProviderProfileModel from "./model.js";
import { ProviderProfileDto, ProviderProfileResponseDto } from "./dto.js";

class ProviderProfileService {
  // Get provider profile by user ID
  static async getProfile(userId) {
    try {
      const profile = await ProviderProfileModel.getProfileByUserId(userId);
      
      if (!profile) {
        throw new Error("Provider profile not found");
      }

      // Calculate completion percentage
      const completion = await ProviderProfileModel.getProfileCompletion(userId);
      
      // Format response using DTO
      const responseDto = new ProviderProfileResponseDto({
        ...profile,
        completion,
      });
      
      return responseDto.toResponse();
    } catch (error) {
      throw new Error(`Failed to get provider profile: ${error.message}`);
    }
  }

  // Create new provider profile
  static async createProfile(userId, profileData) {
    try {
      // Validate input data
      const dto = new ProviderProfileDto(profileData);
      dto.validate();

      // Check if profile already exists
      const exists = await ProviderProfileModel.profileExists(userId);
      if (exists) {
        throw new Error("Provider profile already exists for this user");
      }

      // Create profile
      const profile = await ProviderProfileModel.createProfile(userId, dto.toUpdateData());

      // Update completion percentage
      const completion = await ProviderProfileModel.updateProfileCompletion(userId);

      return {
        ...profile,
        completion,
      };
    } catch (error) {
      throw new Error(`Failed to create provider profile: ${error.message}`);
    }
  }

  // Update provider profile
  static async updateProfile(userId, profileData) {
    try {
      // Check if profile exists
      const exists = await ProviderProfileModel.profileExists(userId);
      if (!exists) {
        throw new Error("Provider profile not found");
      }

      // If only profileImageUrl is provided, update directly without full validation
      if (Object.keys(profileData).length === 1 && profileData.profileImageUrl) {
        const profile = await ProviderProfileModel.updateProfile(userId, {
          profileImageUrl: profileData.profileImageUrl,
        });
        return {
          ...profile,
          completion: await ProviderProfileModel.getProfileCompletion(userId),
        };
      }

      // Validate input data for full updates
      const dto = new ProviderProfileDto(profileData);
      dto.validate();

      // Update profile
      const profile = await ProviderProfileModel.updateProfile(userId, dto.toUpdateData());

      // Update completion percentage
      const completion = await ProviderProfileModel.updateProfileCompletion(userId);

      return {
        ...profile,
        completion,
      };
    } catch (error) {
      throw new Error(`Failed to update provider profile: ${error.message}`);
    }
  }

  // Upsert provider profile (create or update)
  static async upsertProfile(userId, profileData) {
    try {
      // Extract portfolioUrls if present (not stored in ProviderProfile directly)
      const { portfolioUrls, ...restProfileData } = profileData;
      
      // Validate input data (partial validation for upsert)
      const dto = new ProviderProfileDto(restProfileData);
      dto.validatePartial();

      // Upsert profile (portfolioUrls is handled separately via portfolios relation if needed)
      const profile = await ProviderProfileModel.upsertProfile(userId, dto.toUpdateData());

      // Update completion percentage
      const completion = await ProviderProfileModel.updateProfileCompletion(userId);

      return {
        ...profile,
        completion,
      };
    } catch (error) {
      throw new Error(`Failed to upsert provider profile: ${error.message}`);
    }
  }

  // Get profile statistics
  static async getProfileStats(userId) {
    try {
      const stats = await ProviderProfileModel.getProfileStats(userId);
      return stats;
    } catch (error) {
      throw new Error(`Failed to get provider profile stats: ${error.message}`);
    }
  }

  // Get profile completion with suggestions
  static async getProfileCompletion(userId) {
    try {
      const completionData = await ProviderProfileModel.getProfileCompletion(userId);
      return completionData;
    } catch (error) {
      throw new Error(`Failed to get provider profile completion: ${error.message}`);
    }
  }

  // Get completed projects for portfolio
  static async getCompletedProjects(userId) {
    try {
      // Import PrismaClient and create instance
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      
      const projects = await prisma.project.findMany({
        where: {
          providerId: userId,
          status: "COMPLETED",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              customerProfile: {
                select: {
                  companySize: true,
                  industry: true,
                  logoUrl: true,
                  profileImageUrl: true,
                },
              },
            },
          },
          milestones: {
            select: {
              id: true,
              title: true,
              amount: true,
              status: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 50, // Limit to 50 most recent completed projects
      });

      // Transform projects for portfolio display (public-safe data)
      const portfolioProjects = projects.map((project) => {
        // Calculate approved price (sum of milestone amounts)
        const approvedPrice = project.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
        
        // Get skills from project (public data)
        const technologies = Array.isArray(project.skills) ? project.skills : [];
        
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          category: project.category,
          technologies: technologies.slice(0, 8), // Limit to 8 technologies for display
          client: project.customer?.name || "Client",
          clientId: project.customer?.id || null,
          completedDate: project.updatedAt ? new Date(project.updatedAt).toISOString().split('T')[0] : null,
          approvedPrice,
          image: null, // Projects don't have images, but we can use placeholder or category icon
        };
      });

      await prisma.$disconnect();
      return portfolioProjects;
    } catch (error) {
      throw new Error(`Failed to get completed projects: ${error.message}`);
    }
  }

}


export default ProviderProfileService;