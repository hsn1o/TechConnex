// src/modules/company/find-providers/index.js
import express from "express";
import { authenticateToken } from "../../../middlewares/auth.js";
import {
  findProviders,
  getProvider,
  getProviderPortfolioController,
  getProviderReviews,
  getProviderStats,
  saveProvider,
  unsaveProvider,
  getSavedProviders,
  getFilters,
  getProviderFullDetails,
} from "./controller.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Provider search and listing
router.get("/", findProviders);
router.get("/filters", getFilters);

// Individual provider endpoints
router.get("/:id", getProvider);
router.get("/:id/full", getProviderFullDetails); // Combined endpoint for frontend
router.get("/:id/portfolio", getProviderPortfolioController);
router.get("/:id/reviews", getProviderReviews);
router.get("/:id/stats", getProviderStats);

// Save/unsave provider
router.post("/:id/save", saveProvider);
router.delete("/:id/save", unsaveProvider);

// Saved providers for user
router.get("/users/:userId/saved-providers", getSavedProviders);

export default router;
