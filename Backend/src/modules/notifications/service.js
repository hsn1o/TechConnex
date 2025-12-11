import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotificationsByUser = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markNotificationAsRead = async (notificationId, userId) => {
  // Verify the notification belongs to the user before updating
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found or access denied");
  }

  // Update the notification to mark it as read
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const createNotification = async (data) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      type: data.type || "system",
      content: data.content,
      metadata: data.metadata || null,
    },
  });
};