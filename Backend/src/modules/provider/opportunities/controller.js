// src/modules/provider/opportunities/controller.js
import {
  getOpportunities,
  getOpportunityById,
} from "./service.js";
import { GetOpportunitiesDto } from "./dto.js";

// GET /api/provider/opportunities - Get all opportunities for providers
export async function getOpportunitiesController(req, res) {
  try {
    const dto = new GetOpportunitiesDto({
      providerId: req.user.userId, // User ID from JWT payload
      ...req.query,
    });
    dto.validate();

    const result = await getOpportunities(dto);

    res.json({
      success: true,
      opportunities: result.opportunities,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getOpportunitiesController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/provider/opportunities/:id - Get a specific opportunity
export async function getOpportunityController(req, res) {
  try {
    const opportunityId = req.params.id;
    const providerId = req.user.userId; // User ID from JWT payload

    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        message: "Opportunity ID is required",
      });
    }

    const opportunity = await getOpportunityById(opportunityId, providerId);

    res.json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error("Error in getOpportunityController:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}
