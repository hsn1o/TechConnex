// controller.js
import { generateReceiptPDF } from "../../../utils/receiptPdf.js";
import { deleteBankDetailsService, getEarningsOverview, getPaymentDetailsService, getProviderBillingData, updateBankDetailsService } from "./service.js";

export const getProviderBillingController = async (req, res) => {
  try {
    const providerId = req.user?.id; // ✅ Extracted from token

    if (!providerId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No provider ID found" });
    }

    const data = await getProviderBillingData(providerId);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error("Billing Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEarningsOverviewController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const timeFilter = req.query.timeFilter || "this-month";
    const payload = await getEarningsOverview(userId, timeFilter);

    return res.json(payload);
  } catch (err) {
    console.error("getEarningsOverviewController error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};


export const updateBankDetails = async (req, res) => {
  try {
    const userId = req.user.id; // from token middleware

    const {
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankSwiftCode,
    } = req.body;

    const updated = await updateBankDetailsService(userId, {
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankSwiftCode,
    });

    res.json({
      success: true,
      message: "Bank details updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await deleteBankDetailsService(userId);

    res.json({
      success: true,
      message: "Bank details deleted successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error deleting bank details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
