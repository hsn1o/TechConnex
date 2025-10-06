import express from "express";
import { register, login, becomeProviderHandler } from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();
const { register, becomeProviderHandler } = require("./controller");
const { authenticateToken } = require("../../../middlewares/auth");

router.post("/register", register);
router.post("/become-provider", authenticateToken, becomeProviderHandler);

export default router;
