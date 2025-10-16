import express from "express";
import ProviderProfileController from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.get("/", ProviderProfileController.getProfile);
router.post("/", ProviderProfileController.createProfile);
router.put("/", ProviderProfileController.updateProfile);
router.patch("/", ProviderProfileController.upsertProfile);
router.get("/stats", ProviderProfileController.getProfileStats);
router.get("/completion", ProviderProfileController.getProfileCompletion);

export default router;