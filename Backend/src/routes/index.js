const express = require("express");
const router = express.Router();

// Import company auth routes
const companyAuthRoutes = require("../modules/company/auth");

// Mount them
router.use("/company/auth", companyAuthRoutes);

module.exports = router;
