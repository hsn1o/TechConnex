import express from "express";
import { register,  becomeCustomerHandler } from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/become-customer", authenticateToken, becomeCustomerHandler);

export default router;
