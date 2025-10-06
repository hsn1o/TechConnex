const express = require("express");
const router = express.Router();

// Import company auth routes
const companyAuthRoutes = require("../modules/auth/company");
const loginAuth = require("../modules/auth");

// Mount them
router.use("/company/auth", companyAuthRoutes);
router.use("/auth", loginAuth);

export default router;
