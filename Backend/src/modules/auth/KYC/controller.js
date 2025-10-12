// src/modules/auth/KYC/controller.js
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
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getKycById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await getKycDocument(id);
    if (!document)
      return res.status(404).json({ error: "KYC document not found" });
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
