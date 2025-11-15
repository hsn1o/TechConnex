// src/modules/provider/projects/controller.js
import {
  getProviderProjects,
  getProviderProjectById,
  updateProjectStatus,
  updateMilestoneStatus,
  getProviderProjectStats,
  getProviderPerformanceMetrics,
} from "./service.js";
import { GetProviderProjectsDto, UpdateProjectStatusDto, UpdateMilestoneStatusDto } from "./dto.js";

// GET /api/provider/projects - Get all projects for a provider
export async function getProjectsController(req, res) {
  try {
    const dto = new GetProviderProjectsDto({
      ...req.query,
      providerId: req.user.userId, // User ID from JWT payload
    });
    dto.validate();

    const result = await getProviderProjects(dto);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in getProjectsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/provider/projects/:id - Get a single project
export async function getProjectController(req, res) {
  try {
    const projectId = req.params.id;
    const providerId = req.user.userId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await getProviderProjectById(projectId, providerId);

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error in getProjectController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// PUT /api/provider/projects/:id/status - Update project status
export async function updateProjectStatusController(req, res) {
  try {
    const projectId = req.params.id;
    const providerId = req.user.userId;
    const { status } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const dto = new UpdateProjectStatusDto({
      projectId,
      providerId,
      status,
    });
    dto.validate();

    const project = await updateProjectStatus(dto);

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

// PUT /api/provider/projects/milestones/:id/status - Update milestone status
export async function updateMilestoneStatusController(req, res) {
  try {
    const milestoneId = req.params.id;
    const providerId = req.user.userId;
    let { status, deliverables, submissionNote } = req.body;
    
    // Parse deliverables if it's a string (from FormData)
    if (typeof deliverables === 'string') {
      try {
        deliverables = JSON.parse(deliverables);
      } catch (e) {
        // If parsing fails, treat as plain string or object
        deliverables = deliverables;
      }
    }

    // Handle file upload - if file was uploaded, use its path
    let submissionAttachmentUrl = null;
    if (req.file) {
      // Convert backslash to forward slash for URLs
      submissionAttachmentUrl = req.file.path.replace(/\\/g, "/");
    }

    if (!milestoneId) {
      return res.status(400).json({
        success: false,
        message: "Milestone ID is required",
      });
    }

    const dto = new UpdateMilestoneStatusDto({
      milestoneId,
      providerId,
      status,
      deliverables,
      submissionNote,
      submissionAttachmentUrl,
    });
    dto.validate();

    const milestone = await updateMilestoneStatus(dto);

    res.json({
      success: true,
      message: "Milestone status updated successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error in updateMilestoneStatusController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/provider/projects/stats - Get project statistics
export async function getProjectStatsController(req, res) {
  try {
    const providerId = req.user.userId;

    const stats = await getProviderProjectStats(providerId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in getProjectStatsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// GET /api/provider/projects/performance - Get performance metrics
export async function getPerformanceMetricsController(req, res) {
  try {
    const providerId = req.user.userId;

    const metrics = await getProviderPerformanceMetrics(providerId);

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Error in getPerformanceMetricsController:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
