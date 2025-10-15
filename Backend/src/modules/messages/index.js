// message/index.js
import express from "express";
import { createNewMessage, deleteMessage, getConversations, getMessages, markAsRead } from "./controller.js";

import { authenticateToken } from "../../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/messages";

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ✅ File upload route
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
  
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
  });
});

router.get("/", getMessages); // GET /api/messages?otherUserId=... or just /api/messages for all
router.get("/conversations", getConversations); // GET /api/messages/conversations
router.post("/", createNewMessage); // POST /api/messages
router.put("/:id/read", markAsRead); // PUT /api/messages/:id/read
router.delete("/:id", deleteMessage); // DELETE /api/messages/:id
export default router;
