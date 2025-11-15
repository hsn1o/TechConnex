import express from "express";
import ProviderProfileController from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";
import { uploadProfileImage as uploadProfileImageMiddleware } from "../../../middlewares/uploadProfileImage.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.get("/", ProviderProfileController.getProfile);
router.post("/", ProviderProfileController.createProfile);
router.put("/", ProviderProfileController.updateProfile);
router.patch("/", ProviderProfileController.upsertProfile);
router.post("/upload-image", uploadProfileImageMiddleware, ProviderProfileController.uploadProfileImage);
router.get("/stats", ProviderProfileController.getProfileStats);
router.get("/completion", ProviderProfileController.getProfileCompletion);
router.get("/portfolio", ProviderProfileController.getPortfolio);

export default router;