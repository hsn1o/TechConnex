// src/modules/company/projects/index.js
import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectController,
  updateProjectStatusController,
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

export default router;