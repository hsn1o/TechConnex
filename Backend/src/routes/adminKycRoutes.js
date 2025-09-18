// routes/adminKycRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ===== Enums (mirror Prisma) =====
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

// ===== Helpers =====
const isUUID = (v) => /^[0-9a-fA-F-]{36}$/.test(v || "");

// Map docs to the frontend "Doc" shape
function mapDoc(doc) {
  return {
    id: doc.id,
    type: doc.type,
    fileUrl: doc.fileUrl,
    filename: doc.filename,
    mimeType: doc.mimeType || undefined,
    status: doc.status,
    uploadedAt: doc.uploadedAt?.toISOString?.() || doc.uploadedAt,
  };
}

// Map user + documents to the frontend "KycUser" shape
function mapUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    kycStatus: u.kycStatus,
    createdAt: u.createdAt?.toISOString?.() || u.createdAt,
    documents: (u.KycDocument || []).map(mapDoc),
  };
}

// GET /api/admin/kyc?status=pending|approved|rejected|all
router.get("/", async (req, res) => {
  const status = (req.query.status || "pending").toString().toLowerCase();

  try {
    let userIds = [];

    if (status === "pending") {
      // Users who have uploaded docs not yet verified/rejected (docs.status = uploaded)
      const rows = await prisma.kycDocument.groupBy({
        by: ["userId"],
        where: { status: KycDocStatus.uploaded },
      });
      userIds = rows.map((r) => r.userId);
    } else if (status === "approved") {
      // Users with overall KYC active
      const users = await prisma.user.findMany({
        where: { kycStatus: KycStatus.active },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    } else if (status === "rejected") {
      // Users with overall KYC inactive (your UI treats this as rejected)
      const users = await prisma.user.findMany({
        where: { kycStatus: KycStatus.inactive },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    } else {
      // all: anyone who has any KYC document
      const rows = await prisma.kycDocument.groupBy({ by: ["userId"] });
      userIds = rows.map((r) => r.userId);
    }

    if (userIds.length === 0) return res.json([]);

    // Load users with their documents (latest first)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      orderBy: { createdAt: "desc" },
      include: {
        KycDocument: { orderBy: { uploadedAt: "desc" } },
      },
    });

    return res.json(users.map(mapUser));
  } catch (error) {
    console.error("❌ Failed to fetch admin KYC list:", error);
    return res.status(500).json({ error: "Failed to fetch KYC list" });
  }
});

// PATCH /api/admin/kyc/:userId  { approve: boolean, notes?: string, reviewerId?: string }
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { approve, notes, reviewerId } = req.body || {};

  if (!isUUID(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const now = new Date();

    if (approve) {
      // Verify any uploaded docs, set user active
      await prisma.kycDocument.updateMany({
        where: { userId, status: KycDocStatus.uploaded },
        data: {
          status: KycDocStatus.verified,
          reviewNotes: notes || "Approved",
          reviewedBy: isUUID(reviewerId) ? reviewerId : null,
          reviewedAt: now,
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: KycStatus.active, isVerified: true },
      });
    } else {
      // Reject any uploaded docs, set user inactive (treated as 'rejected' in UI)
      await prisma.kycDocument.updateMany({
        where: { userId, status: KycDocStatus.uploaded },
        data: {
          status: KycDocStatus.rejected,
          reviewNotes: notes || "Rejected",
          reviewedBy: isUUID(reviewerId) ? reviewerId : null,
          reviewedAt: now,
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: KycStatus.inactive, isVerified: false },
      });
    }

    // Return updated user with documents
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { KycDocument: { orderBy: { uploadedAt: "desc" } } },
    });
    return res.json(mapUser(user));
  } catch (error) {
    console.error("❌ Failed to update KYC decision:", error);
    return res.status(500).json({ error: "Failed to update KYC decision" });
  }
});

// GET /api/admin/kyc/doc/:id/download
router.get("/doc/:id/download", async (req, res) => {
  const { id } = req.params;
  if (!isUUID(id)) {
    return res.status(400).json({ error: "Invalid document ID" });
  }
  try {
    const doc = await prisma.kycDocument.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.resolve(doc.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(doc.filename)}`
    );
    if (doc.mimeType) res.setHeader("Content-Type", doc.mimeType);
    return res.sendFile(filePath);
  } catch (error) {
    console.error("❌ Failed to download KYC document:", error);
    return res.status(500).json({ error: "Failed to download document" });
  }
});

module.exports = router;
