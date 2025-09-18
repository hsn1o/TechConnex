// routes/serviceRequestRoutes.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const upload = multer({ dest: "uploads/proposals/" });

// POST /api/service-requests
router.post("/", async (req, res) => {
  const {
    customerId,
    title,
    description,
    category,
    budgetMin,
    budgetMax,
    timeline,
    skills = [],
    priority,
    ndaSigned = false,
    requirements,
    deliverables,
  } = req.body;

  // Validate required fields
  if (
    !customerId ||
    !title ||
    !description ||
    !category ||
    !budgetMin ||
    !budgetMax
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        customer: { connect: { id: customerId } },
        title,
        description,
        category,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        timeline,
        priority,
        aiStackSuggest: skills,
        status: "OPEN",
        requirements,
        deliverables,
      },
    });

    res.status(201).json({ serviceRequest });
  } catch (error) {
    console.error("❌ Failed to create service request:", error);
    res.status(500).json({ error: "Failed to create service request" });
  }
});

router.post(
  "/:requestId/proposals",
  upload.single("attachment"),
  async (req, res) => {
    const { requestId } = req.params;
    const { providerId, bidAmount, deliveryTime, coverLetter } = req.body;

    try {
      const fileUrl = req.file ? req.file.path : null;

      // Create proposal
      const newProposal = await prisma.proposal.create({
        data: {
          providerId,
          requestId,
          bidAmount: parseFloat(bidAmount),
          deliveryTime: parseInt(deliveryTime),
          coverLetter,
          attachmentUrl: fileUrl,
        },
      });

      return res
        .status(201)
        .json({ message: "Proposal submitted", proposal: newProposal });
    } catch (err) {
      console.error("Proposal submission failed:", err);
      return res.status(500).json({ error: "Failed to submit proposal" });
    }
  }
);

// ✅ GET proposals related to a specific ServiceRequest
router.get("/:requestId/proposals", async (req, res) => {
  const { requestId } = req.params;

  // Basic UUID validation
  const isValidUUID = /^[0-9a-fA-F-]{36}$/.test(requestId);
  if (!isValidUUID) {
    return res.status(400).json({ error: "Invalid request ID format" });
  }

  try {
    const proposals = await prisma.proposal.findMany({
      where: {
        requestId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            providerProfile: {
              select: {
                location: true,
                rating: true,
                totalReviews: true,
              },
            },
          },
        },
      },
    });

    return res.json({ proposals });
  } catch (error) {
    console.error("❌ Failed to fetch proposals:", error);
    return res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

router.get("/:customerId", async (req, res) => {
  const { customerId } = req.params;

  // Validate UUID format
  const isValidUUID = /^[0-9a-fA-F-]{36}$/.test(customerId);
  if (!isValidUUID) {
    return res.status(400).json({ error: "Invalid customer ID format" });
  }

  try {
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        proposals: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.json({ serviceRequests });
  } catch (error) {
    console.error("❌ Failed to fetch service requests:", error);
    return res.status(500).json({ error: "Failed to fetch service requests" });
  }
});

router.delete("/dservice-request/:id", async (req, res) => {
  const { id } = req.params;

  console.log("[DEBUG] ServiceRequest ID to delete:", id); // Debug print

  const isValidUUID = /^[0-9a-fA-F-]{36}$/.test(id);
  if (!isValidUUID) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    // Step 0: Unlink project if exists
    await prisma.project.updateMany({
      where: { serviceRequestId: id },
      data: { serviceRequestId: null },
    });

    // Step 1: Delete all proposals
    await prisma.proposal.deleteMany({
      where: { requestId: id },
    });

    // Step 2: Delete the service request
    const deletedRequest = await prisma.serviceRequest.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Service request, project, and proposals deleted",
      deletedRequest,
    });
  } catch (error) {
    console.error("❌ Failed to delete service request:", error);
    res.status(500).json({ error: "Failed to delete service request" });
  }
});

module.exports = router;
