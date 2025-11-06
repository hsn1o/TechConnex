import express from "express";
import { disputeController } from "./controller.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { uploadDisputeAttachment } from "../../middlewares/uploadDisputeAttachment.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Error handling middleware for multer errors (must be after multer middleware)
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("Multer error:", err);
    return res.status(400).json({
      success: false,
      error: err.message || "File upload error",
    });
  }
  next();
};

router.post("/", uploadDisputeAttachment, handleMulterError, disputeController.createDispute);
router.get("/project/:projectId", disputeController.getDisputeByProject); // Get single dispute for project
router.get("/project/:projectId/all", disputeController.getDisputesByProject); // Get all disputes (for admin)
router.patch("/:id", uploadDisputeAttachment, handleMulterError, disputeController.updateDispute); // Update dispute

export default router;

