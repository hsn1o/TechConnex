import express from "express";
import {
  createPaymentIntentController,
  finalizePaymentController,
  withdrawFunds,
} from "./controller.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/create-intent", createPaymentIntentController);
router.post("/finalize", finalizePaymentController);
router.post("/withdraw", authenticateToken, withdrawFunds);

export default router;
