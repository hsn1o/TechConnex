// src/modules/company/billing/controller.js
import { createAnalyticsPDF } from "../../../utils/billingReportPdf.js";
import { generateReceiptPDF } from "../../../utils/receiptPdf.js";
import {
  getBillingOverview,
  getTransactionsList,
  getInvoicesList,
  getUpcomingPayments,
  getPaymentDetailsService,
} from "./service.js";
import fs from "fs";

async function getOverview(req, res) {
  try {
    const userId = req.user.userId;

    const data = await getBillingOverview(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getTransactions(req, res) {
  try {
    const userId = req.user.userId;
    const transactions = await getTransactionsList(userId);
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getInvoices(req, res) {
  try {
    const userId = req.user.userId;
    const invoices = await getInvoicesList(userId);
    res.json({ success: true, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function fetchUpcomingPayments(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }

    const data = await getUpcomingPayments(userId);

    if (!data.length) {
      return res
        .status(200)
        .json({ message: "No upcoming payments found", data: [] });
    }

    res.status(200).json({
      message: "Upcoming payments retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching upcoming payments:", error);
    res.status(500).json({ error: "Failed to fetch upcoming payments" });
  }
}

export const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const details = await getPaymentDetailsService(paymentId);

    return res.status(200).json({
      success: true,
      message: "Payment details retrieved",
      data: details,
    });
  } catch (err) {
    // add status if not provided
    if (!err.status) err.status = 500;
    next(err);
  }
};

export const downloadReceipt = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // Get full payment data (the JSON you showed)
    const payment = await getPaymentDetailsService(paymentId);

    // Generate PDF file
    const filePath = await generateReceiptPDF(payment);

    return res.download(filePath);
  } catch (err) {
    if (!err.status) err.status = 500;
    next(err);
  }
};

export const exportAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Fetch all analytics data
    const [overview, transactions, invoices, upcoming] = await Promise.all([
      getBillingOverview(userId),
      getTransactionsList(userId),
      getInvoicesList(userId),
      getUpcomingPayments(userId),
    ]);

    // Create and save PDF file
    const filePath = await createAnalyticsPDF({
      overview,
      transactions,
      invoices,
      upcoming,
      generatedFor: userId,
      generatedAt: new Date(),
    });

    // Download
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({
        success: false,
        message: "File was not created.",
      });
    }

    return res.download(filePath, (err) => {
      if (err) {
        console.error("Download report failed:", err);
        res
          .status(500)
          .json({ success: false, message: "Failed to download report" });
      }
    });
  } catch (err) {
    console.error("Export report failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export report",
      error: err.message,
    });
  }
};

export { getOverview, getTransactions, getInvoices };
