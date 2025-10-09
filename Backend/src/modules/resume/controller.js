import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/resumes";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

async function uploadResume(req, res) {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if resume already exists for this user
    const existingResume = await prisma.resume.findUnique({ where: { userId } });
    
    const fileUrl = `/uploads/resumes/${file.filename}`;
    
    if (existingResume) {
      // Update existing resume
      const updatedResume = await prisma.resume.update({
        where: { userId },
        data: {
          fileUrl,
          description: `Resume uploaded on ${new Date().toISOString()}`,
          uploadedAt: new Date(),
        },
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "Resume updated successfully",
        resume: updatedResume 
      });
    } else {
      // Create new resume
      const newResume = await prisma.resume.create({
        data: {
          userId,
          fileUrl,
          description: `Resume uploaded on ${new Date().toISOString()}`,
          uploadedAt: new Date(),
        },
      });
      
      return res.status(201).json({ 
        success: true, 
        message: "Resume uploaded successfully",
        resume: newResume 
      });
    }
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export { uploadResume, upload };
