import * as messageModel from "./model.js";

export const fetchUserMessages = async (userId, otherUserId = null) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // If otherUserId is provided, get conversation between two users
  if (otherUserId) {
    return messageModel.getMessagesBetweenUsers(userId, otherUserId);
  }

  // Otherwise, get all conversations for the user
  return messageModel.getAllUserConversations(userId);
};

export const sendMessage = async (messageData, senderId) => {
  const { receiverId, content, messageType = 'text', attachments = [] } = messageData;
  
  console.log("📝 Sending message - Sender:", senderId, "Receiver:", receiverId, "Content:", content);
  
  // Validation
  if (!senderId || !receiverId) {
    throw new Error("Sender ID and Receiver ID are required");
  }
  
  if (messageType === 'text' && !content?.trim()) {
    throw new Error("Message content is required for text messages");
  }
  
  if (messageType === 'file' && (!attachments || attachments.length === 0)) {
    throw new Error("Attachments are required for file messages");
  }

  try {
    const message = await messageModel.createMessage({
      senderId,
      receiverId,
      content: content || '',
      messageType,
      attachments,
      isRead: false,
      priority: 'normal',
      isSystemMessage: false
    });
    
    console.log("✅ Message created in database:", message.id);
    return message;
  } catch (error) {
    console.error("❌ Database error creating message:", error);
    throw new Error("Failed to save message to database: " + error.message);
  }
};

export const readMessage = async (id, userId) => {
  if (!id) {
    throw new Error("Message ID is required");
  }
  
  const message = await messageModel.getMessageById(id);
  if (!message) {
    throw new Error("Message not found");
  }
  
  // Check if user is the receiver of this message
  if (message.receiverId !== userId) {
    throw new Error("Not authorized to mark this message as read");
  }
  
  return messageModel.markMessageAsRead(id);
};

export const removeMessage = async (id, userId) => {
  if (!id) {
    throw new Error("Message ID is required");
  }
  
  const message = await messageModel.getMessageById(id);
  if (!message) {
    throw new Error("Message not found");
  }
  
  // Only sender can delete their own messages
  if (message.senderId !== userId) {
    throw new Error("Not authorized to delete this message");
  }
  
  return messageModel.deleteMessage(id);
};

// Get list of users that the current user has conversations with
export const getConversationList = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  return messageModel.getUserConversations(userId);
};