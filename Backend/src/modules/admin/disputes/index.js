import express from "express";
import { disputeController } from "./controller.js";
import { authenticateToken, requireAdmin } from "../../../middlewares/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

router.get("/", disputeController.getAllDisputes);
router.get("/stats", disputeController.getDisputeStats);
router.get("/:id", disputeController.getDisputeById);
router.patch("/:id/resolve", disputeController.resolveDispute);
router.post("/:id/payout", disputeController.simulatePayout);
router.post("/:id/redo-milestone", disputeController.redoMilestone);

export default router;

