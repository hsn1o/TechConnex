// src/modules/company/billing/service.js
import {
  getTotalSpent,
  getPendingPayments,
  getThisMonthSpent,
  getAverageTransaction,
  getRecentInvoices,
  getRecentTransactions,
  getAllTransactions,
  getAllInvoices,
  findUpcomingPayments,
} from "./model.js";

function getMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { firstDay, lastDay };
}

async function getBillingOverview(userId) {
  const { firstDay, lastDay } = getMonthRange();

  const [totalSpent, pending, monthly, avg, invoices, transactions] =
    await Promise.all([
      getTotalSpent(userId),
      getPendingPayments(userId),
      getThisMonthSpent(userId, firstDay, lastDay),
      getAverageTransaction(userId),
      getRecentInvoices(userId),
      getRecentTransactions(userId),
    ]);

  return {
    totalSpent: totalSpent._sum.amount || 0,
    pendingPayments: pending._sum.amount || 0,
    thisMonthSpent: monthly._sum.amount || 0,
    averageTransaction: avg._avg.amount || 0,
    recentInvoices: invoices,
    recentTransactions: transactions,
  };
}

async function getTransactionsList(userId) {
  return getAllTransactions(userId);
}

async function getInvoicesList(userId) {
  return getAllInvoices(userId);
}


export const getUpcomingPayments = async (userId) => {
  const currentDate = new Date();

  // Call the Prisma query from model
  const projects = await findUpcomingPayments(userId, currentDate);

  // Optional: transform or sort results if needed
  return projects;
};


export { getBillingOverview, getTransactionsList, getInvoicesList };
