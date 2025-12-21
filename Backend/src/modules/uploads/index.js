// modules/uploads/index.js
import express from "express";
import { authenticateToken } from "../../middlewares/auth.js";
import { 
  generatePresignedUploadUrl, 
  generateFileKey, 
  validateFile, 
  getPublicUrl,
  generatePresignedDownloadUrl 
} from "../../utils/r2.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /uploads/presigned-url
 * Generate a presigned URL for uploading a file to R2
 * 
 * Body:
 * {
 *   fileName: string (required)
 *   mimeType: string (required)
 *   fileSize: number (required, in bytes)
 *   prefix: string (optional, default: "uploads")
 *   visibility: "public" | "private" (optional, default: "private")
 *   category: "image" | "document" | "video" (optional, auto-detected from mimeType)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   uploadUrl: string (presigned URL for upload),
 *   key: string (R2 object key),
 *   accessUrl?: string (public URL, only if visibility is "public")
 * }
 */
router.post("/presigned-url", authenticateToken, async (req, res) => {
  try {
    const { fileName, mimeType, fileSize, prefix = "uploads", visibility = "private", category } = req.body;

    // Validate required fields
    if (!fileName || !mimeType || fileSize === undefined || fileSize === null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fileName, mimeType, and fileSize are required",
      });
    }

    // Ensure fileSize is a number
    const numericFileSize = Number(fileSize);
    if (isNaN(numericFileSize) || numericFileSize < 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fileSize: ${fileSize} (must be a positive number)`,
      });
    }

    // Validate file
    try {
      validateFile(fileName, mimeType, numericFileSize, category);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Get user ID from token
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    // Generate unique file key
    const key = generateFileKey(prefix, fileName, userId);

    // Generate presigned upload URL (expires in 5 minutes)
    const uploadUrl = await generatePresignedUploadUrl(key, mimeType, 300);

    // Prepare response
    const response = {
      success: true,
      uploadUrl,
      key,
    };

    // If public, include the public URL
    if (visibility === "public") {
      try {
        response.accessUrl = getPublicUrl(key);
      } catch (error) {
        // If public URL generation fails, still return the upload URL
        console.warn("Failed to generate public URL:", error.message);
      }
    }

    res.json(response);
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate presigned URL",
    });
  }
});

/**
 * GET /uploads/download
 * Get a presigned download URL for a private file
 * Checks permissions before generating the URL
 * 
 * Query params:
 * - key: string (required) - R2 object key
 * - expiresIn?: number (optional, default: 3600) - URL expiration in seconds
 * 
 * Response:
 * {
 *   success: true,
 *   downloadUrl: string (presigned URL for download),
 *   expiresIn: number (seconds until expiration)
 * }
 */
router.get("/download", authenticateToken, async (req, res) => {
  try {
    const { key, expiresIn = 3600 } = req.query;

    // Validate required fields
    if (!key || typeof key !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: key",
      });
    }

    // Get user ID from token
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    // Check if user is an admin - admins have access to all files
    const userRoles = req.user?.roles || req.user?.role || [];
    const isAdmin = Array.isArray(userRoles) 
      ? userRoles.includes("ADMIN") 
      : userRoles === "ADMIN";

    // Check permissions: user can download files they own OR files they have access to through shared resources
    // File keys are structured as: prefix/userId/timestamp-random-filename
    // So we check if the key contains the user's ID
    const ownsFile = key.includes(`/${userId}/`) || key.startsWith(`${userId}/`);
    
    // Admins can access any file, skip permission checks
    if (!isAdmin && !ownsFile) {
      // Check if user has access through shared resources (proposals, milestones, etc.)
      let hasAccess = false;
      
      // Check for proposal attachments: companies should access provider's proposal attachments for their service requests
      if (key.startsWith("proposals/")) {
        // Extract provider ID from key (format: proposals/providerId/timestamp-random-filename)
        const keyParts = key.split("/");
        if (keyParts.length >= 2) {
          const providerId = keyParts[1];
          
          // Find proposals with this attachment URL that belong to service requests owned by this user
          const proposal = await prisma.proposal.findFirst({
            where: {
              providerId: providerId,
              attachmentUrls: {
                has: key, // Check if the key is in the attachmentUrls array
              },
            },
            include: {
              serviceRequest: {
                select: {
                  customerId: true,
                  projectId: true,
                },
              },
            },
          });
          
          if (proposal && proposal.serviceRequest.customerId === userId) {
            hasAccess = true;
          }
        }
      }
      
      // Check for milestone attachments: both companies and providers should access milestone attachments for their projects
      if (!hasAccess && key.startsWith("milestones/")) {
        // Extract provider ID from key (format: milestones/providerId/timestamp-random-filename)
        const keyParts = key.split("/");
        if (keyParts.length >= 2) {
          const fileProviderId = keyParts[1];
          
          // Find milestones with this submission attachment URL in projects where user is either customer or provider
          const milestone = await prisma.milestone.findFirst({
            where: {
              OR: [
                {
                  project: {
                    customerId: userId,
                    providerId: fileProviderId,
                  },
                },
                {
                  project: {
                    providerId: userId,
                    customerId: fileProviderId,
                  },
                },
              ],
              submissionAttachmentUrl: key,
            },
          });
          
          if (milestone) {
            hasAccess = true;
          }
        }
      }
      
      // Check for dispute attachments: both companies and providers should access dispute attachments for their projects
      if (!hasAccess && key.startsWith("disputes/")) {
        // Extract user ID from key (format: disputes/userId/timestamp-random-filename)
        const keyParts = key.split("/");
        if (keyParts.length >= 2) {
          const fileUserId = keyParts[1];
          
          // Find disputes with this attachment URL in projects where user is either customer or provider
          const dispute = await prisma.dispute.findFirst({
            where: {
              attachments: {
                has: key, // Check if the key is in the attachments array
              },
              project: {
                OR: [
                  {
                    customerId: userId,
                  },
                  {
                    providerId: userId,
                  },
                ],
              },
            },
          });
          
          if (dispute) {
            hasAccess = true;
          }
        }
      }
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission to access this file.",
        });
      }
    }

    // Validate expiresIn
    const expiresInSeconds = parseInt(expiresIn, 10);
    if (isNaN(expiresInSeconds) || expiresInSeconds < 60 || expiresInSeconds > 86400) {
      return res.status(400).json({
        success: false,
        message: "expiresIn must be between 60 and 86400 seconds (1 minute to 24 hours)",
      });
    }

    // Generate presigned download URL
    const downloadUrl = await generatePresignedDownloadUrl(key, expiresInSeconds);

    res.json({
      success: true,
      downloadUrl,
      expiresIn: expiresInSeconds,
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate download URL",
    });
  }
});

export default router;

