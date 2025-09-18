// routes/kycRoutes.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ===== Prisma enums (mirror schema) =====
const KycDocType = {
  PROVIDER_ID: "PROVIDER_ID",
  COMPANY_REG: "COMPANY_REG",
  COMPANY_DIRECTOR_ID: "COMPANY_DIRECTOR_ID",
  OTHER: "OTHER",
};
const KycDocStatus = {
  uploaded: "uploaded",
  verified: "verified",
  rejected: "rejected",
};
const KycStatus = {
  active: "active",
  inactive: "inactive",
  suspended: "suspended",
  pending_verification: "pending_verification",
};

// ===== Multer storage (uploads/kyc/<userId>/filename) =====
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const userId = (req.body.userId || "").trim();
      const baseDir = path.join("uploads", "kyc", userId || "unknown");
      fs.mkdirSync(baseDir, { recursive: true });
      cb(null, baseDir);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const rawType = (req.body.docType || req.body.subtype || "").toString().trim(); // PASSPORT/IC etc (for filename only)
    const safe = `${rawType ? rawType + "-" : ""}${Date.now()}${ext || ""}`;
    cb(null, safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ===== Helpers =====
const isUUID = (v) => /^[0-9a-fA-F-]{36}$/.test(v || "");
const norm = (p) => (p || "").replace(/\\/g, "/");

// ===== Routes =====

// Provider: Passport/IC -> type = PROVIDER_ID
router.post("/upload/provider", upload.single("document"), async (req, res) => {
  const { userId } = req.body;

  if (!userId || !isUUID(userId)) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "KYC document is required" });
  }

  try {
    const fileUrl = norm(req.file.path);
    const filename = req.file.filename;
    const mimeType = req.file.mimetype || null;

    const doc = await prisma.kycDocument.create({
      data: {
        userId,
        type: KycDocType.PROVIDER_ID,
        fileUrl,
        filename,
        mimeType,
        status: KycDocStatus.uploaded, // explicit to be clear
      },
    });

    // User overall status -> pending_verification (best-effort)
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: KycStatus.pending_verification },
      });
    } catch {}

    return res.status(201).json({ message: "KYC uploaded (provider)", document: doc });
  } catch (err) {
    console.error("❌ Provider KYC upload failed:", err);
    return res.status(500).json({ error: "Failed to upload KYC" });
  }
});

// Company registration -> type = COMPANY_REG
router.post("/upload/company", upload.single("document"), async (req, res) => {
  const { userId } = req.body;

  if (!userId || !isUUID(userId)) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Company registration file required" });
  }

  try {
    const fileUrl = norm(req.file.path);
    const filename = req.file.filename;
    const mimeType = req.file.mimetype || null;

    const doc = await prisma.kycDocument.create({
      data: {
        userId,
        type: KycDocType.COMPANY_REG,
        fileUrl,
        filename,
        mimeType,
        status: KycDocStatus.uploaded,
      },
    });

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: KycStatus.pending_verification },
      });
    } catch {}

    return res.status(201).json({ message: "KYC uploaded (company)", document: doc });
  } catch (err) {
    console.error("❌ Company KYC upload failed:", err);
    return res.status(500).json({ error: "Failed to upload KYC" });
  }
});

// Optional: company director ID -> type = COMPANY_DIRECTOR_ID
router.post("/upload/company-director", upload.single("document"), async (req, res) => {
  const { userId } = req.body;

  if (!userId || !isUUID(userId)) {
    return res.status(400).json({ error: "Invalid or missing userId" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Director ID file required" });
  }

  try {
    const fileUrl = norm(req.file.path);
    const filename = req.file.filename;
    const mimeType = req.file.mimetype || null;

    const doc = await prisma.kycDocument.create({
      data: {
        userId,
        type: KycDocType.COMPANY_DIRECTOR_ID,
        fileUrl,
        filename,
        mimeType,
        status: KycDocStatus.uploaded,
      },
    });

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: KycStatus.pending_verification },
      });
    } catch {}

    return res.status(201).json({ message: "KYC uploaded (company director)", document: doc });
  } catch (err) {
    console.error("❌ Company director KYC upload failed:", err);
    return res.status(500).json({ error: "Failed to upload KYC" });
  }
});

// List user's docs (latest first by uploadedAt)
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isUUID(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }
  try {
    const docs = await prisma.kycDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });
    return res.json({ documents: docs });
  } catch (error) {
    console.error("❌ Failed to fetch KYC documents:", error);
    return res.status(500).json({ error: "Failed to fetch KYC documents" });
  }
});

// Admin: list pending (uploaded) docs
router.get("/pending", async (_req, res) => {
  try {
    const docs = await prisma.kycDocument.findMany({
      where: { status: KycDocStatus.uploaded },
      orderBy: { uploadedAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true, kycStatus: true },
        },
      },
    });
    return res.json({ documents: docs });
  } catch (error) {
    console.error("❌ Failed to fetch pending KYC:", error);
    return res.status(500).json({ error: "Failed to fetch pending KYC" });
  }
});

// Admin: set status verified/rejected, add notes, record reviewer and reviewedAt
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes, reviewedBy } = req.body; // reviewedBy = admin userId (optional)

  if (!isUUID(id)) {
    return res.status(400).json({ error: "Invalid KYC document ID format" });
  }
  const newStatus = (status || "").toLowerCase().trim();
  if (!["verified", "rejected"].includes(newStatus)) {
    return res.status(400).json({ error: "Status must be 'verified' or 'rejected'" });
  }

  try {
    const updated = await prisma.kycDocument.update({
      where: { id },
      data: {
        status: newStatus,
        reviewNotes: reviewNotes || null,
        reviewedBy: reviewedBy && isUUID(reviewedBy) ? reviewedBy : null,
        reviewedAt: new Date(),
      },
      include: { user: { select: { id: true } } },
    });

    // Reflect on the user
    try {
      await prisma.user.update({
        where: { id: updated.userId },
        data: {
          kycStatus: newStatus === "verified" ? KycStatus.active : KycStatus.pending_verification,
          isVerified: newStatus === "verified",
        },
      });
    } catch {}

    return res.json({ message: "KYC status updated", document: updated });
  } catch (error) {
    console.error("❌ Failed to update KYC status:", error);
    return res.status(500).json({ error: "Failed to update KYC status" });
  }
});

module.exports = router;
