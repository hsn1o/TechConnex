// src/modules/auth/KYC/controller.js
import {
  getKycDocumentByUserId,
  getReviewersByIds,
  updateKycDocumentStatus,
} from "./model.js";
import {
  createKycDocument,
  listKycDocuments,
  getKycDocument,
} from "./service.js";

export const createKyc = async (req, res) => {
  try {
    const { userId, type } = req.body;
    const file = req.file;

    if (!userId || !type || !file) {
      return res
        .status(400)
        .json({ error: "userId, type, and file are required" });
    }

    const newKyc = await createKycDocument({
      userId,
      type,
      fileUrl: `/uploads/${file.filename}`, // relative URL to uploaded file
      filename: file.originalname,
      mimeType: file.mimetype,
      status: "uploaded",
    });

    res.status(201).json({
      success: true,
      data: newKyc,
    });
  } catch (error) {
    console.error("Error creating KYC:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllKyc = async (req, res) => {
  try {
    const documents = await listKycDocuments();

    // Preload all reviewers
    const reviewerIds = [
      ...new Set(documents.map((d) => d.reviewedBy).filter(Boolean)),
    ];
    const reviewers = await getReviewersByIds(reviewerIds);
    const reviewerMap = Object.fromEntries(
      reviewers.map((r) => [r.id, r.name])
    );

    const formatted = documents.map((doc) => {
      const { user } = doc;

      let profileType = null;
      let profile = null;

      if (user?.role?.includes("PROVIDER")) {
        profileType = "Provider";
        profile = user.providerProfile;
      } else if (user?.role?.includes("CUSTOMER")) {
        profileType = "Customer";
        profile = user.customerProfile;
      }

      return {
        id: doc.id,
        type: doc.type,
        status: doc.status,
        fileUrl: doc.fileUrl,
        filename: doc.filename,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        reviewedAt: doc.reviewedAt,
        reviewNotes: doc.reviewNotes,
        reviewedBy: doc.reviewedBy
          ? reviewerMap[doc.reviewedBy] || "Unknown Reviewer"
          : null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified,
          profileType,
          profile,
        },
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("🔥 Error fetching KYC list:", error);
    res.status(500).json({
      error: error.message || "Failed to load KYC documents",
    });
  }
};

export const reviewKycDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approve, notes } = req.body;

    const document = await getKycDocumentByUserId(userId);
    if (!document)
      return res.status(404).json({ error: "KYC document not found" });

    const status = approve ? "verified" : "rejected";

    const updated = await updateKycDocumentStatus(document.id, {
      status,
      reviewNotes: notes,
      reviewedAt: new Date(),
      reviewedBy: req.user.id,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
