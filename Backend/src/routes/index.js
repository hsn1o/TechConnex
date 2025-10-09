import express from "express";
import companyAuthRoutes from "../modules/auth/company/index.js";
import providerAuthRoutes from "../modules/auth/provider/index.js";
import companyProfileRouter from "../modules/company/profile/index.js";
import findProvidersRouter from "../modules/company/find-providers/index.js";
import companyProjectsRouter from "../modules/company/projects/index.js";
import companyProjectRequestsRouter from "../modules/company/project-requests/index.js";
import providerSendProposalRouter from "../modules/provider/send-proposal/index.js";
import resumeRouter from "../modules/resume/index.js";
import certificationsRouter from "../modules/certifications/index.js";
import checkEmailRouter from "./checkEmail.js";

const router = express.Router();

// Mount them
router.use("/company/auth", companyAuthRoutes);
router.use("/provider/auth", providerAuthRoutes);
router.use("/company/profile", companyProfileRouter);
router.use("/api/providers", findProvidersRouter);
router.use("/api/company/projects", companyProjectsRouter);
router.use("/api/company/project-requests", companyProjectRequestsRouter);
router.use("/api/provider/proposals", providerSendProposalRouter);
router.use("/api/resume", resumeRouter);
router.use("/api/certifications", certificationsRouter);
// Mount check-email under /api so frontend using NEXT_PUBLIC_API_BASE_URL that
// points to http://host:PORT/api will be able to call `${API_BASE}/check-email`
router.use("", checkEmailRouter);

// Simple user endpoint for CustomerLayout
router.get("/api/users/:id", async (req, res) => {
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
      return res.status(404).json({ success: false, message: "User not found" });
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
