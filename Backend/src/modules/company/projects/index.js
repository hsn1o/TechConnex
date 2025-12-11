// src/modules/company/projects/index.js
import express from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectController,
  updateProjectStatusController,
  getServiceRequestMilestonesController,
  updateServiceRequestMilestonesController,
  updateProjectDetailsController,
  approveIndividualMilestoneController,
  requestMilestoneChangesController,
  payMilestoneController,
  getCompanyProjectStatsController,
  exportProjectsController,
  analyzeProjectDocumentController,
} from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads/project-documents";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for document uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow PDF, Word, Excel, and TXT files
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, Word, Excel, and TXT files are allowed."));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.post("/analyze-document", upload.single("document"), analyzeProjectDocumentController);
router.post("/", createProjectController);
router.get("/", getProjectsController);
router.get("/stats", getCompanyProjectStatsController);
router.get("/export", exportProjectsController);
router.get("/:id", getProjectController);
router.put("/:id/status", updateProjectStatusController);
router.put("/:id", updateProjectDetailsController); // NEW

// ServiceRequest milestone management routes
router.get("/:id/milestones", getServiceRequestMilestonesController);
router.post("/:id/milestones", updateServiceRequestMilestonesController);

// Individual milestone approval route
router.post("/milestones/:id/approve", approveIndividualMilestoneController);

// Individual milestone request changes route
router.post("/milestones/:id/request-changes", requestMilestoneChangesController);

// Individual milestone payment route
router.post("/milestones/:id/pay", payMilestoneController);

export default router;