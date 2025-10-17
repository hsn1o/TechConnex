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

// Provider search and listing (public endpoints)
router.get("/filters", getFilters);

// Apply authentication to protected routes
router.use(authenticateToken);

// Protected provider search and listing
router.get("/", findProviders);

// Saved providers for user (must come before /:id routes)
router.get("/users/:userId/saved-providers", getSavedProviders);

// Individual provider endpoints
router.get("/:id", getProvider);
router.get("/:id/full", getProviderFullDetails); // Combined endpoint for frontend
router.get("/:id/portfolio", getProviderPortfolioController);
router.get("/:id/reviews", getProviderReviews);
router.get("/:id/stats", getProviderStats);

// Save/unsave provider
router.post("/:id/save", saveProvider);
router.delete("/:id/save", unsaveProvider);

export default router;
