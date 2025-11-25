// src/modules/company/find-providers/controller.js
import {
  searchProviders,
  getProviderDetails,
  getProviderPortfolio,
  getProviderCompletedProjects,
  getProviderReviewsList,
  saveProviderService,
  unsaveProviderService,
  getSavedProvidersService,
  getProviderStatistics,
  getFilterOptions,
} from "./service.js";
import { FindProvidersDto, SaveProviderDto, ProviderDetailDto } from "./dto.js";

// GET /api/providers - Search and filter providers
export async function findProviders(req, res) {
  try {
    const dto = new FindProvidersDto(req.query);
    dto.validate();

    const result = await searchProviders(dto);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in findProviders:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/providers/:id - Get provider details
export async function getProvider(req, res) {
  try {
    const dto = new ProviderDetailDto({
      providerId: req.params.id,
      userId: req.query.userId,
    });
    dto.validate();

    // Fetch provider details, portfolio, and reviews in parallel
    const [provider, portfolioData, reviewsData] = await Promise.all([
      getProviderDetails(dto.providerId, dto.userId),
      getProviderPortfolio(dto.providerId).catch(() => []),
      getProviderReviewsList(dto.providerId, 1, 10).catch(() => ({ reviews: [], pagination: {} })),
    ]);
    
    res.json({
      success: true,
      provider,
      portfolio: portfolioData,
      reviews: reviewsData.reviews || [],
    });
  } catch (error) {
    console.error("Error in getProvider:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/providers/:id/portfolio - Get provider portfolio
export async function getProviderPortfolioController(req, res) {
  try {
    const providerId = req.params.id;
    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    const portfolio = await getProviderPortfolio(providerId);
    
    res.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error("Error in getProviderPortfolio:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/providers/:id/reviews - Get provider reviews
export async function getProviderReviews(req, res) {
  try {
    const providerId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    const result = await getProviderReviewsList(providerId, page, limit);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in getProviderReviews:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/providers/:id/stats - Get provider statistics
export async function getProviderStats(req, res) {
  try {
    const providerId = req.params.id;
    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    const stats = await getProviderStatistics(providerId);
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getProviderStats:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// POST /api/providers/:id/save - Save provider
export async function saveProvider(req, res) {
  try {
    const dto = new SaveProviderDto({
      userId: req.query.userId,
      providerId: req.params.id,
    });
    dto.validate();

    const result = await saveProviderService(dto.userId, dto.providerId);
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in saveProvider:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// DELETE /api/providers/:id/save - Unsave provider
export async function unsaveProvider(req, res) {
  try {
    const dto = new SaveProviderDto({
      userId: req.query.userId,
      providerId: req.params.id,
    });
    dto.validate();

    const result = await unsaveProviderService(dto.userId, dto.providerId);
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in unsaveProvider:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/users/:userId/saved-providers - Get saved providers
export async function getSavedProviders(req, res) {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await getSavedProvidersService(userId, page, limit);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in getSavedProviders:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/providers/filters - Get filter options
export async function getFilters(req, res) {
  try {
    const options = await getFilterOptions();
    
    res.json({
      success: true,
      ...options,
    });
  } catch (error) {
    console.error("Error in getFilters:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/providers/:id/completed-projects - Get completed projects for provider
export async function getProviderCompletedProjectsController(req, res) {
  try {
    const providerId = req.params.id;
    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
      });
    }

    const completedProjects = await getProviderCompletedProjects(providerId);
    
    res.json({
      success: true,
      data: completedProjects,
    });
  } catch (error) {
    console.error("Error in getProviderCompletedProjects:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// Combined endpoint for provider details with portfolio and reviews
export async function getProviderFullDetails(req, res) {
  try {
    const dto = new ProviderDetailDto({
      providerId: req.params.id,
      userId: req.query.userId,
    });
    dto.validate();

    // Get all data in parallel
    const [provider, portfolio, reviewsResult] = await Promise.all([
      getProviderDetails(dto.providerId, dto.userId),
      getProviderPortfolio(dto.providerId),
      getProviderReviewsList(dto.providerId, 1, 5), // Get first 5 reviews
    ]);
    
    res.json({
      success: true,
      provider,
      portfolio,
      reviews: reviewsResult.reviews,
    });
  } catch (error) {
    console.error("Error in getProviderFullDetails:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}
