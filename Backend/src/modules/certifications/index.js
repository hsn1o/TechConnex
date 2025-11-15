import express from "express";
import { authenticateToken } from "../../middlewares/auth.js";
import { 
  uploadCertifications, 
  getCertifications, 
  createCertification, 
  updateCertification, 
  deleteCertification,
  getMyCertifications 
} from "./controller.js";

const router = express.Router();

// Authenticated routes for managing own certifications (specific routes first)
router.use(authenticateToken);
router.get("/", getMyCertifications); // Get current user's certifications
router.post("/", createCertification); // Create single certification
router.put("/:id", updateCertification); // Update certification
router.delete("/:id", deleteCertification); // Delete certification
router.post("/upload", uploadCertifications); // Legacy route for bulk upload (still supported)

// Public route for viewing other providers' certifications (parameterized route last)
router.get("/:userId", getCertifications);

export default router;
