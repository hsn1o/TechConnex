// src/modules/company/find-providers/service.js
import {
  findProviders,
  getProviderById,
  getProviderReviews,
  saveProvider,
  unsaveProvider,
  getSavedProviders,
  getProviderStats,
} from "./model.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Find providers with filtering
export async function searchProviders(filters) {
  try {
    const result = await findProviders(filters);
    
    // Transform data for frontend
    const transformedProviders = result.providers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.providerProfile?.profileImageUrl || "/placeholder.svg",
      title: user.providerProfile?.bio ? user.providerProfile.bio.split(" ").slice(0, 3).join(" ") : "ICT Professional",
      company: user.providerProfile?.website || "Freelancer",
      rating: parseFloat(user.providerProfile?.rating || 0),
      reviewCount: user.providerProfile?.totalReviews || 0,
      completedJobs: user.completedProjects || 0, // Use calculated completed projects
      hourlyRate: user.providerProfile?.hourlyRate || 0,
      location: user.providerProfile?.location || "Malaysia",
      bio: user.providerProfile?.bio || "Experienced ICT professional",
      availability: user.providerProfile?.availability || "Available",
      responseTime: `${user.providerProfile?.responseTime || 24} hours`,
      skills: user.providerProfile?.skills || [],
      specialties: user.providerProfile?.skills?.slice(0, 3) || [],
      languages: user.providerProfile?.languages || ["English"],
      verified: user.providerProfile?.isVerified || false,
      topRated: user.providerProfile?.isFeatured || false,
      saved: user.isSaved || false, // Use saved status from backend
    }));

    return {
      providers: transformedProviders,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error("Error searching providers:", error);
    throw new Error("Failed to search providers");
  }
}

// Get provider details
export async function getProviderDetails(providerId, userId = null) {
  try {
    const provider = await getProviderById(providerId, userId);
    
    // Transform for frontend
    const transformedProvider = {
      id: provider.id,
      name: provider.name,
      email: provider.email,
      avatar: provider.providerProfile?.profileImageUrl || "/placeholder.svg",
      title: provider.providerProfile?.bio ? provider.providerProfile.bio.split(" ").slice(0, 3).join(" ") : "ICT Professional",
      company: provider.providerProfile?.website || "Freelancer",
      rating: parseFloat(provider.providerProfile?.rating || 0),
      reviewCount: provider.providerProfile?.totalReviews || 0,
      completedJobs: provider.completedProjects || 0, // Use calculated completed projects
      hourlyRate: provider.providerProfile?.hourlyRate || 0,
      location: provider.providerProfile?.location || "Malaysia",
      bio: provider.providerProfile?.bio || "Experienced ICT professional",
      availability: provider.providerProfile?.availability || "Available",
      responseTime: `${provider.providerProfile?.responseTime || 24} hours`,
      skills: provider.providerProfile?.skills || [],
      specialties: provider.providerProfile?.skills?.slice(0, 3) || [],
      languages: provider.providerProfile?.languages || ["English"],
      verified: provider.providerProfile?.isVerified || false,
      topRated: provider.providerProfile?.isFeatured || false,
      saved: provider.isSaved || false,
    };

    return transformedProvider;
  } catch (error) {
    console.error("Error getting provider details:", error);
    throw new Error("Failed to get provider details");
  }
}

// Get provider portfolio
export async function getProviderPortfolio(providerId) {
  try {
    const provider = await getProviderById(providerId);
    
    // Transform portfolio items
    const portfolio = (provider.providerProfile?.portfolios || []).map((item) => ({
      id: item.id,
      title: item.title,
      cover: item.imageUrl || "/placeholder.svg",
      url: item.externalUrl || "#",
      tags: item.techStack || [],
    }));

    return portfolio;
  } catch (error) {
    console.error("Error getting provider portfolio:", error);
    throw new Error("Failed to get provider portfolio");
  }
}

// Get provider reviews
export async function getProviderReviewsList(providerId, page = 1, limit = 10) {
  try {
    const result = await getProviderReviews(providerId, page, limit);
    
    // Transform reviews for frontend
    const transformedReviews = result.reviews.map((review) => ({
      id: review.id,
      author: review.company || review.reviewer.name,
      rating: review.rating,
      date: review.createdAt.toISOString().split("T")[0],
      text: review.content,
      reviewer: {
        name: review.reviewer.name,
        company: review.company,
        role: review.role,
      },
    }));

    return {
      reviews: transformedReviews,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error("Error getting provider reviews:", error);
    throw new Error("Failed to get provider reviews");
  }
}

// Save provider
export async function saveProviderService(userId, providerId) {
  try {
    await saveProvider(userId, providerId);
    return { success: true, message: "Provider saved successfully" };
  } catch (error) {
    if (error.message === "Provider already saved") {
      throw new Error("Provider already saved");
    }
    console.error("Error saving provider:", error);
    throw new Error("Failed to save provider");
  }
}

// Unsave provider
export async function unsaveProviderService(userId, providerId) {
  try {
    await unsaveProvider(userId, providerId);
    return { success: true, message: "Provider removed from saved list" };
  } catch (error) {
    console.error("Error unsaving provider:", error);
    throw new Error("Failed to remove provider from saved list");
  }
}

// Get saved providers
export async function getSavedProvidersService(userId, page = 1, limit = 20) {
  try {
    const result = await getSavedProviders(userId, page, limit);
    
    // Calculate completed projects for saved providers
    const savedProviderIds = result.providers.map(p => p.id);
    const completedProjectsCounts = await prisma.project.groupBy({
      by: ['providerId'],
      where: {
        providerId: {
          in: savedProviderIds,
        },
        status: 'COMPLETED',
      },
      _count: {
        id: true,
      },
    });

    // Create a map of providerId -> completedProjects count
    const completedProjectsMap = new Map(
      completedProjectsCounts.map(item => [item.providerId, item._count.id])
    );

    // Transform for frontend
    const transformedProviders = result.providers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.providerProfile?.profileImageUrl || "/placeholder.svg",
      title: user.providerProfile?.bio ? user.providerProfile.bio.split(" ").slice(0, 3).join(" ") : "ICT Professional",
      company: user.providerProfile?.website || "Freelancer",
      rating: parseFloat(user.providerProfile?.rating || 0),
      reviewCount: user.providerProfile?.totalReviews || 0,
      completedJobs: completedProjectsMap.get(user.id) || 0, // Use calculated completed projects
      hourlyRate: user.providerProfile?.hourlyRate || 0,
      location: user.providerProfile?.location || "Malaysia",
      bio: user.providerProfile?.bio || "Experienced ICT professional",
      availability: user.providerProfile?.availability || "Available",
      responseTime: `${user.providerProfile?.responseTime || 24} hours`,
      skills: user.providerProfile?.skills || [],
      specialties: user.providerProfile?.skills?.slice(0, 3) || [],
      languages: user.providerProfile?.languages || ["English"],
      verified: user.providerProfile?.isVerified || false,
      topRated: user.providerProfile?.isFeatured || false,
      savedAt: user.savedAt,
    }));

    return {
      providers: transformedProviders,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error("Error getting saved providers:", error);
    throw new Error("Failed to get saved providers");
  }
}

// Get provider statistics
export async function getProviderStatistics(providerId) {
  try {
    const stats = await getProviderStats(providerId);
    return stats;
  } catch (error) {
    console.error("Error getting provider statistics:", error);
    throw new Error("Failed to get provider statistics");
  }
}

// Get filter options (categories, locations, etc.)
export async function getFilterOptions() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    // Get unique skills for categories
    const skillsResult = await prisma.providerProfile.findMany({
      select: {
        skills: true,
      },
    });
    
    const allSkills = skillsResult.flatMap(profile => profile.skills || []);
    const uniqueSkills = [...new Set(allSkills)];
    
    // Get unique locations
    const locationsResult = await prisma.providerProfile.findMany({
      select: {
        location: true,
      },
      where: {
        location: {
          not: null,
        },
      },
    });
    
    const uniqueLocations = [...new Set(locationsResult.map(p => p.location).filter(Boolean))];
    
    return {
      categories: [
        { value: "all", label: "All Categories" },
        ...uniqueSkills.slice(0, 10).map(skill => ({
          value: skill.toLowerCase(),
          label: skill,
        })),
      ],
      locations: [
        { value: "all", label: "All Locations" },
        ...uniqueLocations.slice(0, 10).map(location => ({
          value: location.toLowerCase(),
          label: location,
        })),
      ],
      ratings: [
        { value: "all", label: "All Ratings" },
        { value: "4.5+", label: "4.5+ Stars" },
        { value: "4.0+", label: "4.0+ Stars" },
        { value: "3.5+", label: "3.5+ Stars" },
      ],
    };
  } catch (error) {
    console.error("Error getting filter options:", error);
    // Return default options if database query fails
    return {
      categories: [
        { value: "all", label: "All Categories" },
        { value: "web", label: "Web Development" },
        { value: "mobile", label: "Mobile Development" },
        { value: "cloud", label: "Cloud Services" },
        { value: "data", label: "Data Analytics" },
        { value: "ui", label: "UI/UX Design" },
      ],
      locations: [
        { value: "all", label: "All Locations" },
        { value: "kuala lumpur", label: "Kuala Lumpur" },
        { value: "selangor", label: "Selangor" },
        { value: "penang", label: "Penang" },
        { value: "johor", label: "Johor" },
      ],
      ratings: [
        { value: "all", label: "All Ratings" },
        { value: "4.5+", label: "4.5+ Stars" },
        { value: "4.0+", label: "4.0+ Stars" },
      ],
    };
  }
}
