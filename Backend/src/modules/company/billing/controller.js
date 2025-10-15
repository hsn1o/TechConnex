// src/modules/company/billing/controller.js
import {
  getBillingOverview,
  getTransactionsList,
  getInvoicesList,
  getUpcomingPayments,
} from "./service.js";

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

export { getOverview, getTransactions, getInvoices };
