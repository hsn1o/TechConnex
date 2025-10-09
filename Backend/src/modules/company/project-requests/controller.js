// src/modules/company/project-requests/controller.js
import {
  getProjectRequests,
  getProjectRequestById,
  acceptProposal,
  rejectProposal,
  getProposalStats,
} from "./service.js";
import { GetProjectRequestsDto, AcceptProposalDto, RejectProposalDto } from "./dto.js";

// GET /api/company/project-requests - Get all project requests (proposals) for a company
export async function getProjectRequestsController(req, res) {
  try {
    const dto = new GetProjectRequestsDto({
      customerId: req.user.userId, // User ID from JWT payload
      ...req.query,
    });
    dto.validate();

    const result = await getProjectRequests(dto);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in getProjectRequestsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/company/project-requests/:id - Get a specific project request (proposal)
export async function getProjectRequestController(req, res) {
  try {
    const requestId = req.params.id;
    const customerId = req.user.userId; // User ID from JWT payload

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    const proposal = await getProjectRequestById(requestId, customerId);

    res.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("Error in getProjectRequestController:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// POST /api/company/project-requests/:id/accept - Accept a proposal
export async function acceptProposalController(req, res) {
  try {
    const dto = new AcceptProposalDto({
      proposalId: req.params.id,
      customerId: req.user.id, // Assuming user ID comes from auth middleware
    });
    dto.validate();

    const project = await acceptProposal(dto);

    res.json({
      success: true,
      message: "Proposal accepted successfully. Project created.",
      project,
    });
  } catch (error) {
    console.error("Error in acceptProposalController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// POST /api/company/project-requests/:id/reject - Reject a proposal
export async function rejectProposalController(req, res) {
  try {
    const dto = new RejectProposalDto({
      proposalId: req.params.id,
      customerId: req.user.id, // Assuming user ID comes from auth middleware
      reason: req.body.reason,
    });
    dto.validate();

    const result = await rejectProposal(dto);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in rejectProposalController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/company/project-requests/stats - Get proposal statistics
export async function getProposalStatsController(req, res) {
  try {
    const customerId = req.user.userId; // User ID from JWT payload

    const stats = await getProposalStats(customerId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getProposalStatsController:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}