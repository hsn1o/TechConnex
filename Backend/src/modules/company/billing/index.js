// src/modules/company/billing/routes.js
import express from "express";
import { authenticateToken } from "../../../middlewares/auth.js";
import { getOverview, getTransactions, getInvoices, fetchUpcomingPayments } from "./controller.js";

const router = express.Router();

// Overview (totals, recent, stats)
router.get("/overview", authenticateToken, getOverview);

// Transactions list
router.get("/transactions", authenticateToken, getTransactions);

// Invoices list
router.get("/invoices", authenticateToken, getInvoices);

router.get("/upcoming", authenticateToken, fetchUpcomingPayments);

export default router;
