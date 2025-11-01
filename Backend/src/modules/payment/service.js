import Stripe from "stripe";
import prisma, {
  createPaymentRecord,
  updatePaymentStripeInfo,
  finalizePaymentStatus,
  getReleasedPayments,
  markPaymentsInProgress,
} from "./model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const initiateStripePayment = async (
  projectId,
  milestoneId,
  amount,
  currency = "MYR"
) => {
  // Create DB record
  const payment = await createPaymentRecord({
    projectId,
    milestoneId,
    amount,
    currency,
  });

  // Create payment intent on Stripe
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert MYR to sen
    currency: currency.toLowerCase(),
    metadata: {
      paymentId: payment.id,
      projectId,
      milestoneId,
    },
  });

  // Update DB with Stripe intent ID
  await updatePaymentStripeInfo(payment.id, {
    intentId: intent.id,
    status: "IN_PROGRESS",
  });

  return {
    clientSecret: intent.client_secret,
    paymentId: payment.id,
  };
};

export const confirmStripePayment = async (paymentId, success) => {
  if (!success) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    });
  }

  // Fetch payment with project to get provider
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      project: {
        select: {
          providerId: true,
          customerId: true,
          title: true,
        },
      },
    },
  });

  if (!payment) throw new Error("Payment not found");

  // Mark as escrowed (simulated holding)
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "ESCROWED" },
  });

  // // Simulate payout record for the provider (optional)
  // await prisma.settings.create({
  //   data: {
  //     key: "provider_escrow_balance",
  //     value: String(payment.amount),
  //     userId: payment.project.providerId,
  //   },
  // });

  return updated;
};

export async function processWithdrawal(providerId) {
  // 1. Fetch provider profile
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
  });

  if (!provider || !provider.stripeAccountId) {
    throw new Error(
      "Provider must connect a Stripe account before withdrawal."
    );
  }

  // 2. Get all released payments
  const payments = await getReleasedPayments(providerId);
  if (!payments.length) {
    throw new Error("No available funds for withdrawal.");
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  // 3. Mark payments as in-progress
  const paymentIds = payments.map((p) => p.id);
  await markPaymentsInProgress(paymentIds);

  // 4. Create Stripe payout to provider's connected account
  const payout = await stripe.transfers.create({
    amount: Math.round(totalAmount * 100), // convert to cents
    currency: "myr",
    destination: provider.stripeAccountId,
    metadata: {
      providerId,
      paymentIds: paymentIds.join(","),
    },
  });

  // 5. Update payments with stripeTransferId
  await prisma.payment.updateMany({
    where: { id: { in: paymentIds } },
    data: { stripeTransferId: payout.id },
  });

  return {
    message: "Withdrawal in progress",
    totalAmount,
    payoutId: payout.id,
  };
}
