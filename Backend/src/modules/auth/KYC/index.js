import express from "express";
import multer from "multer";
import { createKyc, getAllKyc, getKycById } from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// Configure multer storage (optional: customize upload folder)
// store files locally in /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // rename file with timestamp to avoid duplicates
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// The "fileUrl" field from FormData will map to this multer field name
router.post("/", upload.single("file"), createKyc);
router.get("/", authenticateToken, getAllKyc);
router.put("/:userId", authenticateToken, getKycById);

export default router;
