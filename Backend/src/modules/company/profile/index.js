import express from "express";
import {
  getProfile,
  createProfile,
  updateProfile,
  upsertProfile,
  getProfileCompletion,
  getAllProfiles,
  searchProfiles,
  getProfileStats,
  getPublicProfile,
  validateProfile,
} from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", authenticateToken, getProfile);
router.post("/", authenticateToken, createProfile);
router.put("/", authenticateToken, updateProfile);
router.patch("/", authenticateToken, upsertProfile);
router.get("/completion", authenticateToken, getProfileCompletion);
router.get("/stats", authenticateToken, getProfileStats);

// Public routes (no authentication required)
router.get("/all", getAllProfiles);
router.get("/search", searchProfiles);
router.get("/public/:id", getPublicProfile);

// Utility routes
router.post("/validate", validateProfile);

export default router;
