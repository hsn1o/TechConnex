// service.js
import {
  getProviderEarningsSummary,
  getRecentPayments,
  getMonthlyEarnings,
  getTopClients,
} from "./model.js";

export const getProviderBillingData = async (providerId) => {
  const [summary, recent, monthly, topClients] = await Promise.all([
    getProviderEarningsSummary(providerId),
    getRecentPayments(providerId),
    getMonthlyEarnings(providerId),
    getTopClients(providerId),
  ]);

  // Example derived stats
  const monthlyGrowth = 12.5;
  const averageProjectValue =
    recent.length > 0
      ? recent.reduce((sum, p) => sum + p.amount, 0) / recent.length
      : 0;

  return {
    earningsData: {
      totalEarnings: summary.totalEarnings,
      pendingPayments: summary.pendingPayments,
      availableBalance: summary.availableBalance,
      thisMonth: monthly.length > 0 ? monthly[monthly.length - 1].amount : 0,
      monthlyGrowth,
      averageProjectValue,
      stripeAccountId: summary?.profile?.stripeAccountId || null, // ✅ add Stripe ID
    },
    recentPayments: recent.map((p) => ({
      id: p.id,
      project: p.project.title,
      client: p.project.customer.name,
      amount: p.amount,
      status: p.status.toLowerCase(),
      date: p.createdAt.toISOString().split("T")[0],
      milestone: p.milestone?.title || "N/A",
    })),
    monthlyEarnings: monthly,
    topClients,
  };
};
