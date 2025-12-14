import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { paymentController } from "./controller.js";
import { authenticateToken, requireAdmin } from "../../../middlewares/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Ensure uploads directory exists
const uploadDir = "uploads/payment-transfers";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads (PDF and images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `transfer-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and image files (JPG, PNG, WEBP, GIF) are allowed."), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get payment statistics
router.get("/stats", paymentController.getPaymentStats);

// Get payments ready for transfer
router.get("/ready-to-transfer", paymentController.getReadyToTransferPayments);

// Get all payments with filters
router.get("/", paymentController.getAllPayments);

// Get payment by ID
router.get("/:id", paymentController.getPaymentById);

// Confirm bank transfer (with optional file upload)
router.post("/:id/confirm-transfer", upload.single("transferProof"), paymentController.confirmBankTransfer);

export default router;

