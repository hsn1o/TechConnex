import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotificationsByUser = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};