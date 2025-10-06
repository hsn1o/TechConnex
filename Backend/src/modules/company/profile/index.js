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
  getKycDocuments,
  getKycDocumentById,
  getUserWithKycData,
  getComprehensiveProfile,
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
router.get("/comprehensive", authenticateToken, getComprehensiveProfile);

// KYC document routes
router.get("/kyc-documents", authenticateToken, getKycDocuments);
router.get("/kyc-documents/:documentId", authenticateToken, getKycDocumentById);
router.get("/user-kyc-data", authenticateToken, getUserWithKycData);

// Public routes (no authentication required)
router.get("/all", getAllProfiles);
router.get("/search", searchProfiles);
router.get("/public/:id", getPublicProfile);

// Utility routes
router.post("/validate", validateProfile);

export default router;
