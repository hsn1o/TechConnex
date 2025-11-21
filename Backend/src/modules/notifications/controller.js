import { getNotificationsByUser } from "./service.js";


export const getNotificationsByUserController = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT payload

    const notifications = await getNotificationsByUser(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};
