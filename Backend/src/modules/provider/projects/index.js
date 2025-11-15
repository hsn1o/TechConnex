// src/modules/provider/projects/index.js
import express from "express";
import {
  getProjectsController,
  getProjectController,
  updateProjectStatusController,
  updateMilestoneStatusController,
  getProjectStatsController,
  getPerformanceMetricsController,
} from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";
import { uploadMilestoneAttachment } from "../../../middlewares/uploadMilestoneAttachment.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.get("/", getProjectsController);
router.get("/stats", getProjectStatsController);
router.get("/performance", getPerformanceMetricsController);
router.get("/:id", getProjectController);
router.put("/:id/status", updateProjectStatusController);

// Milestone management routes
router.put("/milestones/:id/status", uploadMilestoneAttachment, updateMilestoneStatusController);

export default router;
