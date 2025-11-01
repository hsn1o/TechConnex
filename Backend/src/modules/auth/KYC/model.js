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

// ✅ Get all KYC Documents with user + related profile
export const getAllKycDocuments = async () => {
  return await prisma.kycDocument.findMany({
    include: {
      user: {
        include: {
          providerProfile: true,
          customerProfile: true,
        },
      },
    },
  });
};

// ✅ Get KYC Document by ID
export const getKycDocuments = async () => {
  return await prisma.kycDocument.findMany({
    include: { user: true },
  });
};

export const getKycDocumentById = async (id) => {
  return await prisma.kycDocument.findUnique({
    where: { id },
    include: { user: true },
  });
};

export const getKycDocumentByUserId = async (userId) => {
  return await prisma.kycDocument.findFirst({
    where: { userId },
    include: { user: true },
    orderBy: { uploadedAt: "desc" }, // ✅ ensures we get the newest one
  });
};


export const updateKycDocumentStatus = async (id, data) => {
  
  return await prisma.kycDocument.update({
    where: { id },
    data,
  });
};

export const updateAllKycDocumentsForUser = async (userId, data) => {
  return await prisma.kycDocument.updateMany({
    where: { userId },
    data,
  });
};

// Get reviewer names for given IDs
export const getReviewersByIds = async (ids = []) => {
  if (!ids.length) return [];
  return await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
};