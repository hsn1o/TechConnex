const express = require("express");
const router = express.Router();

// Import company auth routes
const companyAuthRoutes = require("../modules/company/auth");
import companyProfileRouter from "../modules/company/profile/index.js";


// Mount them
router.use("/company/auth", companyAuthRoutes);
router.use("/company/profile", companyProfileRouter);


// Healthcheck
router.get("/health", (req, res) => res.json({ ok: true }));

module.exports = router;
