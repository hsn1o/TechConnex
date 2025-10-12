import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Create new KYC Document
export const createKycDocumentInDB = async (data) => {
  return await prisma.kycDocument.create({
    data: {
      userId: data.userId,
      type: data.type,
      fileUrl: data.fileUrl,
      filename: data.filename,
      mimeType: data.mimeType,
      status: data.status,
    },
  });
};

// ✅ Get all KYC Documents
export const getAllKycDocuments = async () => {
  return await prisma.kycDocument.findMany({
    include: { user: true },
  });
};

// ✅ Get KYC Document by ID
export const getKycDocumentById = async (id) => {
  return await prisma.kycDocument.findUnique({
    where: { id },
    include: { user: true },
  });
};
