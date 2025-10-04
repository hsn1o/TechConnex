// src/modules/company/auth/index.js
const express = require("express");
const router = express.Router();
const { register, login, becomeProviderHandler } = require("./controller");
const { authenticateToken } = require("../../../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/become-provider", authenticateToken, becomeProviderHandler);

module.exports = router;
