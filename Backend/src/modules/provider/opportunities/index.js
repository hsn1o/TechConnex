// src/modules/provider/opportunities/index.js
import express from "express";
import {
  getOpportunitiesController,
  getOpportunityController,
} from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.get("/", getOpportunitiesController);
router.get("/:id", getOpportunityController);

export default router;
