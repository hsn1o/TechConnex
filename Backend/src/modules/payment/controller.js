import { initiateStripePayment, confirmStripePayment, processWithdrawal } from "./service.js";

export const createPaymentIntentController = async (req, res) => {
  try {
    const { projectId, milestoneId, amount, currency } = req.body;

    const result = await initiateStripePayment(projectId, milestoneId, amount, currency);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const finalizePaymentController = async (req, res) => {
  try {
    const { paymentId, success } = req.body;
    const updated = await confirmStripePayment(paymentId, success);
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export async function withdrawFunds(req, res) {
  try {
    const providerId = req.user.id; // assuming auth middleware sets req.user
    const result = await processWithdrawal(providerId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}