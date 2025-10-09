import express from "express";
import { register, login, becomeProviderHandler } from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/become-provider", authenticateToken, becomeProviderHandler);

export default router;
