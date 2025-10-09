// src/modules/company/projects/controller.js
import {
  createProject,
  getProjects,
  getProjectById,
  updateProjectStatus,
} from "./service.js";
import { CreateProjectDto, GetProjectsDto } from "./dto.js";

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
      serviceRequests: result.serviceRequests,
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

    const validStatuses = ["IN_PROGRESS", "COMPLETED", "DISPUTED"];
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