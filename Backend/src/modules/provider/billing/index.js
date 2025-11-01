// index.js
import express from "express";
import { getProviderBillingController } from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// ✅ Protected route
router.get("/", authenticateToken, getProviderBillingController);

export default router;
