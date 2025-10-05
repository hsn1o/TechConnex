import express from "express";
import companyAuthRoutes from "../modules/company/auth/index.js";
import companyProfileRoutes from "../modules/company/profile/index.js";

const router = express.Router();

// Mount them
router.use("/company/auth", companyAuthRoutes);
router.use("/company/profile", companyProfileRoutes);

// Healthcheck
router.get("/health", (req, res) => res.json({ ok: true }));

export default router;
