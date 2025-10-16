import express from "express";
import multer from "multer";
import fs from "fs";
import { analyzeResume } from "./controller.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads/resumes";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post("/analyze", upload.single("resume"), (req, res, next) => {
  console.log("File uploaded:", req.file);
  next();
}, analyzeResume);


export default router;
