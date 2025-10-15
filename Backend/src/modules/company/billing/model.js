// src/modules/company/billing/model.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getTotalSpent(userId) {
  return prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "RELEASED", project: { customerId: userId } },
  });
}

async function getPendingPayments(userId) {
  return prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "ESCROWED", project: { customerId: userId } },
  });
}

async function getThisMonthSpent(userId, firstDay, lastDay) {
  return prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      project: { customerId: userId },
      createdAt: { gte: firstDay, lte: lastDay },
    },
  });
}

async function getAverageTransaction(userId) {
  return prisma.payment.aggregate({
    _avg: { amount: true },
    where: { status: "RELEASED", project: { customerId: userId } },
  });
}

async function getRecentInvoices(userId, limit = 5) {
  return prisma.invoice.findMany({
    where: { customerId: userId },
    orderBy: { issueDate: "desc" },
    take: limit,
    include: { provider: true, project: true },
  });
}

async function getRecentTransactions(userId, limit = 5) {
  return prisma.payment.findMany({
    where: { project: { customerId: userId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      project: { select: { title: true, category: true } },
      milestone: { select: { title: true } },
      Invoice: { select: { invoiceNumber: true } },
    },
  });
}

async function getAllTransactions(userId) {
  return prisma.payment.findMany({
    where: { project: { customerId: userId } },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { title: true, category: true } },
      milestone: { select: { title: true } },
      Invoice: { select: { invoiceNumber: true } },
    },
  });
}

async function getAllInvoices(userId) {
  return prisma.invoice.findMany({
    where: { customerId: userId },
    orderBy: { issueDate: "desc" },
    include: { provider: true, project: true },
  });
}

export const findUpcomingPayments = async (userId, currentDate) => {
  if (!userId) throw new Error("User ID is missing");

  return prisma.project.findMany({
    where: {
      OR: [
        { customerId: userId },
        { providerId: userId },
      ],
      milestones: {
        some: {
          payments: {
            some: {
              status: "ESCROWED", // ✅ correct enum value
              // you can add "dueDate" filter if you have it
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      milestones: {
        where: {
          payments: {
            some: {
              status: "ESCROWED",
            },
          },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          payments: {
            where: {
              status: "ESCROWED",
            },
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
};

export {
  getTotalSpent,
  getPendingPayments,
  getThisMonthSpent,
  getAverageTransaction,
  getRecentInvoices,
  getRecentTransactions,
  getAllTransactions,
  getAllInvoices,
};
