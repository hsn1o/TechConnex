// src/modules/company/projects/controller.js
import {
  createProject,
  getProjects,
  getProjectById,
  updateProjectStatus,
  getServiceRequestMilestones,
  updateServiceRequestMilestones,
  updateProjectDetails,
  approveIndividualMilestone,
  requestMilestoneChanges,
  payMilestone,
  getCompanyProjectStats
} from "./service.js";
import { CreateProjectDto, GetProjectsDto, UpdateProjectDto  } from "./dto.js";

// POST /api/company/projects - Create a new project
export async function createProjectController(req, res) {
  try {
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }
    
    const dto = new CreateProjectDto({
      ...req.body,
      customerId: req.user.userId, // User ID from JWT payload
    });
    dto.validate();

    const serviceRequest = await createProject(dto);

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      serviceRequest,
    });
  } catch (error) {
    console.error("Error in createProjectController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/company/projects - Get all projects for a company
export async function getProjectsController(req, res) {
  try {
    const dto = new GetProjectsDto({
      customerId: req.user.userId, // User ID from JWT payload
      ...req.query,
    });
    dto.validate();

    const result = await getProjects(dto);

    res.json({
      success: true,
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getProjectsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/company/projects/:id - Get a specific project
export async function getProjectController(req, res) {
  try {
    const projectId = req.params.id;
    const customerId = req.user.userId; // User ID from JWT payload

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await getProjectById(projectId, customerId);

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error in getProjectController:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// PUT /api/company/projects/:id/status - Update project status
export async function updateProjectStatusController(req, res) {
  try {
    const projectId = req.params.id;
    const customerId = req.user.userId; // User ID from JWT payload
    const { status } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["IN_PROGRESS", "COMPLETED", "DISPUTED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const project = await updateProjectStatus(projectId, customerId, status);

    res.json({
      success: true,
      message: "Project status updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error in updateProjectStatusController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/company/projects/:id/milestones - Get ServiceRequest milestones
export async function getServiceRequestMilestonesController(req, res) {
  try {
    const serviceRequestId = req.params.id;
    const customerId = req.user.userId;

    if (!serviceRequestId) {
      return res.status(400).json({
        success: false,
        message: "ServiceRequest ID is required",
      });
    }

    const milestones = await getServiceRequestMilestones(serviceRequestId, customerId);

    res.json({
      success: true,
      milestones,
    });
  } catch (error) {
    console.error("Error in getServiceRequestMilestonesController:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// POST /api/company/projects/:id/milestones - Update ServiceRequest milestones
export async function updateServiceRequestMilestonesController(req, res) {
  try {
    const serviceRequestId = req.params.id;
    const customerId = req.user.userId;
    const { milestones } = req.body;

    if (!serviceRequestId) {
      return res.status(400).json({
        success: false,
        message: "ServiceRequest ID is required",
      });
    }

    if (!milestones || !Array.isArray(milestones)) {
      return res.status(400).json({
        success: false,
        message: "Milestones array is required",
      });
    }

    // Validate milestone structure
    for (const milestone of milestones) {
      if (!milestone.title || !milestone.amount) {
        return res.status(400).json({
          success: false,
          message: "Each milestone must have title and amount",
        });
      }
    }

    const updatedMilestones = await updateServiceRequestMilestones(serviceRequestId, customerId, milestones);

    res.json({
      success: true,
      message: "Milestones updated successfully",
      milestones: updatedMilestones,
    });
  } catch (error) {
    console.error("Error in updateServiceRequestMilestonesController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// src/modules/company/projects/controller.js
export async function updateProjectDetailsController(req, res) {
  try {
    const projectId = req.params.id;
    const customerId = req.user.userId;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const dto = new UpdateProjectDto({ ...req.body, customerId });
    dto.validatePartial(); // allow partial updates

    const project = await updateProjectDetails(projectId, customerId, dto);

    res.json({ success: true, message: "Updated successfully", project });
  } catch (error) {
    console.error("Error in updateProjectDetailsController:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/company/projects/milestones/:id/approve - Approve individual milestone
 */
/**
 * POST /api/company/projects/milestones/:id/request-changes - Request changes for a submitted milestone
 */
export async function requestMilestoneChangesController(req, res) {
  try {
    const milestoneId = req.params.id;
    const customerId = req.user.userId;
    const { reason } = req.body;

    if (!milestoneId) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required",
      });
    }

    const dto = {
      milestoneId,
      customerId,
      reason,
    };

    const milestone = await requestMilestoneChanges(dto);

    res.json({
      success: true,
      message: "Changes requested successfully. Provider will be notified.",
      milestone,
    });
  } catch (error) {
    console.error("Error in requestMilestoneChangesController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function approveIndividualMilestoneController(req, res) {
  try {
    const milestoneId = req.params.id;
    const customerId = req.user.userId;

    if (!milestoneId) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required",
      });
    }

    const dto = {
      milestoneId,
      customerId,
    };

    const milestone = await approveIndividualMilestone(dto);

    res.json({
      success: true,
      message: "Milestone approved successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error in approveIndividualMilestoneController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/company/projects/milestones/:id/pay - Pay milestone
 */
export async function payMilestoneController(req, res) {
  try {
    const milestoneId = req.params.id;
    const customerId = req.user.userId;

    if (!milestoneId) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required",
      });
    }

    const dto = {
      milestoneId,
      customerId,
    };

    const milestone = await payMilestone(dto);

    res.json({
      success: true,
      message: "Milestone payment processed successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error in payMilestoneController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/company/projects/stats - Get project statistics
 */
export async function getCompanyProjectStatsController(req, res) {
  try {
    const customerId = req.user.userId;

    const stats = await getCompanyProjectStats(customerId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getCompanyProjectStatsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
