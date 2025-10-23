import express from "express";
import auth from "../modules/auth/index.js";
import companyAuthRoutes from "../modules/auth/company/index.js";
import providerAuthRoutes from "../modules/auth/provider/index.js";
import companyProfileRouter from "../modules/company/profile/index.js";
import findProvidersRouter from "../modules/company/find-providers/index.js";
import companyProjectsRouter from "../modules/company/projects/index.js";
import companyProjectRequestsRouter from "../modules/company/project-requests/index.js";
import companyMilestonesRouter from "../modules/company/milestones/index.js";
import providerSendProposalRouter from "../modules/provider/send-proposal/index.js";
import providerOpportunitiesRouter from "../modules/provider/opportunities/index.js";
import providerMilestonesRouter from "../modules/provider/milestones/index.js";
import providerProjectsRouter from "../modules/provider/projects/index.js";
import resumeRouter from "../modules/resume/index.js";
import certificationsRouter from "../modules/certifications/index.js";
import klcRoutes from "../modules/auth/KYC/index.js";
import providerProfileRouter from "../modules/provider/profile/index.js";
import messagesRouter from "../modules/messages/index.js";
// import providerCertificateRouter from "../modules/certifications/index.js";

const router = express.Router();

// Mount them
router.use("/auth", auth);
router.use("/kyc", klcRoutes);
router.use("/auth/company", companyAuthRoutes);
router.use("/auth/provider", providerAuthRoutes);
router.use("/company/profile", companyProfileRouter);
router.use("/providers", findProvidersRouter);
router.use("/company/projects", companyProjectsRouter);
router.use("/company/project-requests", companyProjectRequestsRouter);
router.use("/company/milestones", companyMilestonesRouter);
router.use("/provider/proposals", providerSendProposalRouter);
router.use("/provider/opportunities", providerOpportunitiesRouter);
router.use("/provider/milestones", providerMilestonesRouter);
router.use("/provider/projects", providerProjectsRouter);
// router.use("/provider/certificate", providerCertificateRouter);
router.use("/resume", resumeRouter);
router.use("/certifications", certificationsRouter);
router.use("/provider/profile", providerProfileRouter);
router.use("/messages", messagesRouter);
router.use("/uploads", express.static("uploads"));
// Mount check-email under /api so frontend using NEXT_PUBLIC_API_BASE_URL that
// points to http://host:PORT/api will be able to call `${API_BASE}/check-email`
// Simple user endpoint for CustomerLayout
router.get("/users/:id", async (req, res) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        customerProfile: true,
        providerProfile: true,
        resume: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Return user data in the format expected by CustomerLayout
    res.json({
      success: true,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      customerProfile: user.customerProfile,
      providerProfile: user.providerProfile,
      resume: user.resume,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Healthcheck
router.get("/health", (req, res) => res.json({ ok: true }));

export default router;
