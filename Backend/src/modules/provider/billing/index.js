// index.js
import express from "express";
import { deleteBankDetails, downloadReceipt, getEarningsOverviewController, getPaymentDetails, getProviderBillingController, updateBankDetails } from "./controller.js";
import { authenticateToken } from "../../../middlewares/auth.js";

const router = express.Router();

// ✅ Protected route
router.get("/", authenticateToken, getProviderBillingController);
router.get("/overview",authenticateToken, getEarningsOverviewController);
router.put("/bank", authenticateToken, updateBankDetails);
router.delete("/bank", authenticateToken, deleteBankDetails);
router.get("/:paymentId", getPaymentDetails);
router.get("/:paymentId/receipt", downloadReceipt);

export default router;
