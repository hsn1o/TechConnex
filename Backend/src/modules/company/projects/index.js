// src/modules/company/projects/index.js
import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectController,
  updateProjectStatusController,
  getServiceRequestMilestonesController,
  updateServiceRequestMilestonesController,
  updateProjectDetailsController,
  approveIndividualMilestoneController,
  payMilestoneController,
} from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.post("/", createProjectController);
router.get("/", getProjectsController);
router.get("/:id", getProjectController);
router.put("/:id/status", updateProjectStatusController);
router.put("/:id", updateProjectDetailsController); // NEW

// ServiceRequest milestone management routes
router.get("/:id/milestones", getServiceRequestMilestonesController);
router.post("/:id/milestones", updateServiceRequestMilestonesController);

// Individual milestone approval route
router.post("/milestones/:id/approve", approveIndividualMilestoneController);

// Individual milestone payment route
router.post("/milestones/:id/pay", payMilestoneController);

export default router;