import express from "express";
import { getNotificationsByUserController } from "./controller.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET notifications for logged-in user
router.get("/", authenticateToken, getNotificationsByUserController);

export default router;