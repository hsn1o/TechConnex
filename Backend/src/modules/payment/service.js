// services/payment.service.js
import Stripe from "stripe";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Platform fee configuration
const PLATFORM_FEE_PERCENTAGE = 0.1; // 10%

/**
 * Calculate platform fee and provider amount
 */
function calculateFees(amount) {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
  const providerAmount = Math.round((amount - platformFee) * 100) / 100;

  return {
    platformFee,
    providerAmount,
    totalAmount: amount,
  };
}

/**
 * Step 1: Create Payment Intent (Client pays)
 * Funds go to Platform's Stripe account
 */
export async function initiateClientPayment({
  projectId,
  milestoneId,
  amount,
  currency = "MYR",
  customerId,
}) {
  // Validate milestone and project
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: {
          customer: true,
          provider: true,
        },
      },
    },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  if (milestone.status !== "LOCKED") {
    throw new Error("Milestone must be LOCKED before payment");
  }

  // Calculate fees
  const fees = calculateFees(amount);

  // Create payment record in DB
  const payment = await prisma.payment.create({
    data: {
      projectId,
      milestoneId,
      amount: fees.totalAmount,
      platformFeeAmount: fees.platformFee,
      providerAmount: fees.providerAmount,
      currency,
      status: "PENDING",
      method: "STRIPE",
      metadata: {
        customerEmail: milestone.project.customer.email,
        providerEmail: milestone.project.provider.email,
        milestoneTitle: milestone.title,
      },
    },
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(fees.totalAmount * 100), // Convert to sen
    currency: currency.toLowerCase(),
    metadata: {
      paymentId: payment.id,
      projectId,
      milestoneId,
      customerId,
      platformFee: fees.platformFee.toString(),
    },
    description: `Payment for ${milestone.title}`,
    // Specify payment methods
    payment_method_types: ["card", "fpx", "grabpay"],
    // Capture automatically (funds go to your account)
    capture_method: "automatic",
  });

  // Update payment with Stripe details
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      status: "IN_PROGRESS",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: payment.id,
    amount: fees.totalAmount,
    platformFee: fees.platformFee,
    providerAmount: fees.providerAmount,
  };
}

/**
 * Step 2: Confirm Payment Success (via Webhook)
 * Move status to ESCROWED
 */
export async function confirmPaymentSuccess(paymentIntentId) {
  try {
    // Find payment by Stripe intent ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        milestone: true,
        project: {
          include: {
            customer: true,
            provider: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }
    // Check if payment is already escrowed (prevent duplicate processing)
    if (payment.status === "ESCROWED") {
      console.log(`Payment ${payment.id} is already escrowed, skipping...`);
      return payment;
    }
    // Retrieve charge ID from Stripe with expanded charges
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["charges.data"],
      }
    );

    // Safely get charge ID - fallback to latest_charge if charges array is empty
    const chargeId =
      paymentIntent.charges?.data?.[0]?.id || paymentIntent.latest_charge;

    console.log("Payment Intent Details:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      chargeId,
      hasCharges: !!paymentIntent.charges?.data?.length,
    });

    // Update payment to ESCROWED
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "ESCROWED",
        stripeChargeId: chargeId || null,
        escrowedAt: new Date(),
        metadata: {
          ...payment.metadata,
          escrowedAt: new Date().toISOString(),
          paymentIntentStatus: paymentIntent.status,
        },
      },
    });

    // Update milestone to IN_PROGRESS
    await prisma.milestone.update({
      where: { id: payment.milestoneId },
      data: {
        status: "IN_PROGRESS",
        isPaid: true,
        paidAt: new Date(),
      },
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: payment.project.providerId,
        type: "PAYMENT_ESCROWED",
        title: "Payment Received",
        content: `Client has paid for milestone: ${payment.milestone.title}. You can now start working!`,
        metadata: {
          paymentId: payment.id,
          projectId: payment.projectId,
          milestoneId: payment.milestoneId,
        },
      },
    });
    console.log(`Payment ${payment.id} successfully moved to ESCROWED status`);
    return updatedPayment;
  } catch (error) {
    console.error("Error in confirmPaymentSuccess:", error);
    throw error;
  }
}

/**
 * Step 3: Release Payment (After Milestone Approved)
 * Mark as ready for manual bank transfer
 */
export async function releasePaymentToProvider(milestoneId, approvedBy) {
  // Validate milestone is approved
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: {
          provider: {
            include: {
              providerProfile: true,
            },
          },
        },
      },
      payments: {
        where: {
          status: "ESCROWED",
        },
      },
    },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  if (milestone.status !== "APPROVED") {
    throw new Error("Milestone must be APPROVED before releasing payment");
  }

  if (!milestone.payments.length) {
    throw new Error("No escrowed payment found for this milestone");
  }

  const payment = milestone.payments[0];

  // Verify provider has bank details
  const providerProfile = milestone.project.provider.providerProfile;
  if (!providerProfile?.bankAccountNumber || !providerProfile?.bankName) {
    throw new Error("Provider must add bank details before receiving payment");
  }

  // Update payment status to RELEASED
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "RELEASED",
      releasedAt: new Date(),
      bankTransferStatus: "PENDING",
      metadata: {
        ...payment.metadata,
        approvedBy,
        approvedAt: new Date().toISOString(),
        bankDetails: {
          bankName: providerProfile.bankName,
          accountNumber: providerProfile.bankAccountNumber,
          accountName: providerProfile.bankAccountName,
        },
      },
    },
  });

  // Create notification for admin to process bank transfer
  await prisma.notification.create({
    data: {
      userId: approvedBy, // Admin user
      type: "PAYMENT_RELEASE_PENDING",
      title: "Manual Payout Required",
      content: `Payment of MYR ${payment.providerAmount} needs to be transferred to ${providerProfile.bankAccountName}`,
      metadata: {
        paymentId: payment.id,
        providerAmount: payment.providerAmount,
        bankDetails: {
          bankName: providerProfile.bankName,
          accountNumber: providerProfile.bankAccountNumber,
          accountName: providerProfile.bankAccountName,
        },
      },
    },
  });

  // Notify provider
  await prisma.notification.create({
    data: {
      userId: milestone.project.providerId,
      type: "PAYMENT_RELEASED",
      title: "Payment Released!",
      content: `Your payment of MYR ${payment.providerAmount} is being processed. You'll receive it within 1-3 business days.`,
      metadata: {
        paymentId: payment.id,
        amount: payment.providerAmount,
      },
    },
  });

  return updatedPayment;
}

/**
 * Step 4: Confirm Bank Transfer Completed (Admin action)
 */
export async function confirmBankTransfer(
  paymentId,
  adminId,
  transferReference
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      project: {
        include: {
          provider: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "RELEASED") {
    throw new Error("Payment must be in RELEASED status");
  }

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "TRANSFERRED",
      bankTransferStatus: "COMPLETED",
      bankTransferDate: new Date(),
      bankTransferRef: transferReference,
      metadata: {
        ...payment.metadata,
        transferCompletedBy: adminId,
        transferCompletedAt: new Date().toISOString(),
      },
    },
  });

  // Update milestone
  await prisma.milestone.update({
    where: { id: payment.milestoneId },
    data: {
      status: "PAID",
    },
  });

  // Notify provider
  await prisma.notification.create({
    data: {
      userId: payment.project.providerId,
      type: "PAYMENT_TRANSFERRED",
      title: "Payment Received!",
      content: `MYR ${payment.providerAmount} has been transferred to your bank account. Reference: ${transferReference}`,
      metadata: {
        paymentId: payment.id,
        amount: payment.providerAmount,
        reference: transferReference,
      },
    },
  });

  return updatedPayment;
}

/**
 * Refund Payment (For disputes or cancellations)
 */
export async function refundPayment(paymentId, reason, refundedBy) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      project: {
        include: {
          customer: true,
        },
      },
      milestone: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "ESCROWED") {
    throw new Error("Can only refund escrowed payments");
  }

  if (!payment.stripeChargeId) {
    throw new Error("No Stripe charge found for this payment");
  }

  // Create refund in Stripe
  const refund = await stripe.refunds.create({
    charge: payment.stripeChargeId,
    amount: Math.round(payment.amount * 100), // Full refund in sen
    reason: "requested_by_customer",
    metadata: {
      paymentId: payment.id,
      refundReason: reason,
      refundedBy,
    },
  });

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "REFUNDED",
      stripeRefundId: refund.id,
      metadata: {
        ...payment.metadata,
        refundReason: reason,
        refundedBy,
        refundedAt: new Date().toISOString(),
      },
    },
  });

  // Update milestone
  await prisma.milestone.update({
    where: { id: payment.milestoneId },
    data: {
      status: "CANCELLED",
      isPaid: false,
    },
  });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: payment.project.customerId,
      type: "PAYMENT_REFUNDED",
      title: "Payment Refunded",
      content: `Your payment of MYR ${payment.amount} has been refunded. Reason: ${reason}`,
      metadata: {
        paymentId: payment.id,
        amount: payment.amount,
        refundId: refund.id,
      },
    },
  });

  return {
    payment: updatedPayment,
    refund,
  };
}

/**
 * Get pending payouts (Admin dashboard)
 */
export async function getPendingPayouts() {
  return await prisma.payment.findMany({
    where: {
      status: "RELEASED",
      bankTransferStatus: "PENDING",
    },
    include: {
      project: {
        include: {
          provider: {
            include: {
              providerProfile: true,
            },
          },
        },
      },
      milestone: true,
    },
    orderBy: {
      releasedAt: "asc",
    },
  });
}

/**
 * Get provider earnings summary
 */
export async function getProviderEarnings(providerId) {
  const earnings = await prisma.payment.groupBy({
    by: ["status"],
    where: {
      project: {
        providerId,
      },
    },
    _sum: {
      providerAmount: true,
    },
  });

  return {
    escrowed:
      earnings.find((e) => e.status === "ESCROWED")?._sum.providerAmount || 0,
    released:
      earnings.find((e) => e.status === "RELEASED")?._sum.providerAmount || 0,
    transferred:
      earnings.find((e) => e.status === "TRANSFERRED")?._sum.providerAmount ||
      0,
    total: earnings.reduce((sum, e) => sum + (e._sum.providerAmount || 0), 0),
  };
}

export default {
  initiateClientPayment,
  confirmPaymentSuccess,
  releasePaymentToProvider,
  confirmBankTransfer,
  refundPayment,
  getPendingPayouts,
  getProviderEarnings,
};
