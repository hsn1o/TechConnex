"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Loader2,
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";
import { ProviderLayout } from "@/components/provider-layout";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  online?: boolean;
};

type Conversation = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
  online?: boolean;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  messageType: "text" | "file" | "system" | "proposal";
  attachments: string[];
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
};

export default function CustomerMessagesPage() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const chatName = searchParams.get("name");
  const chatAvatar = searchParams.get("avatar");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get user data and token
  const getAuthData = () => {
    if (typeof window === "undefined") return { token: "", user: null };

    try {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      return { token, user };
    } catch {
      return { token: "", user: null };
    }
  };

  const { token, user } = getAuthData();
  const currentUserId = user?.id;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(API_URL!, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });
    // In your socket connection, add error handling:
    newSocket.on("message_error", (error: { error: string }) => {
      console.error("❌ Message sending failed:", error.error);
      alert(`Failed to send message: ${error.error}`);

      // Remove the optimistic message
      setMessages((prev) => prev.filter((msg) => msg.id.startsWith("temp-")));
    });

    // Also add this to handle connection errors
    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });
    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    // Handle receiving messages (both sent and received)
    newSocket.on("receive_message", (message: Message) => {
      console.log("📨 Received message via socket:", message);

      // Add message to current conversation if it matches
      if (
        selectedChat &&
        (message.senderId === selectedChat ||
          message.receiverId === selectedChat)
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === message.senderId || conv.userId === message.receiverId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount:
                  conv.userId === selectedChat ? 0 : conv.unreadCount + 1,
              }
            : conv
        )
      );
    });

    newSocket.on("message_sent", (message: Message) => {
      console.log("✅ Message sent confirmation:", message);
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id.startsWith("temp-") ? message : msg))
      );
    });

    newSocket.on(
      "message_read",
      (data: { messageId: string; readAt: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    );

    newSocket.on("error", (error: { message: string }) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, selectedChat]);

  // Fetch conversations list
  const fetchConversations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      console.log("🔄 Fetching conversations with token:", token);

      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📨 Response status:", response.status);

      const data = await response.json();
      console.log("📨 Response data:", data);

      if (data.success) {
        console.log("✅ Conversations data:", data.data);
        setConversations(data.data);
      } else {
        console.error("❌ Failed to fetch conversations:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      // Set empty array as fallback
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (otherUserId: string) => {
    if (!token || !otherUserId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/messages?otherUserId=${otherUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessages(data.data);

        // Mark conversation as read in the list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.userId === otherUserId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      } else {
        console.error("Failed to fetch messages:", data.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  // Handle URL parameters for direct chat links
  useEffect(() => {
    if (userIdParam && chatName) {
      setSelectedChat(userIdParam);

      // Check if this conversation already exists in the list
      const existingConversation = conversations.find(
        (c) => c.userId === userIdParam
      );
      if (!existingConversation) {
        // Add to conversations list temporarily
        setConversations((prev) => [
          ...prev,
          {
            userId: userIdParam,
            name: chatName,
            email: "",
            avatar: chatAvatar || "",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
            online: true,
          },
        ]);
      }

      fetchMessages(userIdParam);
    }
  }, [userIdParam, chatName, chatAvatar, conversations]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedChat(conversation.userId);
    fetchMessages(conversation.userId);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !token || !socket || !selectedChat) return;

    const formData = new FormData();
    formData.append("file", file);

    // Upload file to backend
    const res = await fetch(`${API_URL}/messages/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!data.success) {
      alert("File upload failed");
      return;
    }

    // Send file message
    const messageData = {
      senderId: currentUserId,
      receiverId: selectedChat,
      messageType: "file",
      attachments: [data.fileUrl],
    };

    socket.emit("send_message", messageData, (response: any) => {
      if (!response?.success) {
        alert("Failed to send file: " + response.error);
      }
    });
  };

  // Send message
  const handleSendMessage = async () => {
    console.log("🔄 Send message triggered");
    console.log("newMessage:", newMessage);
    console.log("selectedChat:", selectedChat);
    console.log("socket connected:", socket?.connected);

    if (!newMessage.trim() || !selectedChat || !socket) {
      console.log("❌ Cannot send - missing requirements");
      return;
    }

    const messageData = {
      senderId: currentUserId, // ✅ add this line
      receiverId: selectedChat,
      content: newMessage.trim(),
      messageType: "text" as const,
      attachments: [],
    };

    console.log("📤 Sending message data:", messageData);

    try {
      // Create optimistic message immediately
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        senderId: currentUserId!,
        receiverId: selectedChat,
        messageType: "text",
        attachments: [],
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUserId!,
          name: user?.name || "You",
          email: user?.email || "",
        },
        receiver: {
          id: selectedChat,
          name: selectedConversation?.name || "Unknown",
          email: selectedConversation?.email || "",
        },
      };

      // Add optimistic message to UI immediately
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage(""); // Clear input immediately

      // Send via socket with callback
      socket.emit("send_message", messageData, (response: any) => {
        console.log("📨 Socket callback response:", response);
        if (response?.success) {
          console.log("✅ Message sent successfully via socket");
          // The message_sent event will handle replacing the temp message
        } else {
          console.error(
            "❌ Failed to send message via socket:",
            response?.error
          );
          // Remove the optimistic message on error
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage.id)
          );
          // Optionally show error to user
          alert("Failed to send message: " + response?.error);
        }
      });
    } catch (error) {
      console.error("❌ Error in send message:", error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!token) return;

    try {
      await Promise.all(
        messageIds.map((id) =>
          fetch(`${API_URL}/messages/${id}/read`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Auto-mark messages as read when they become visible
  useEffect(() => {
    if (selectedChat && messages.length > 0 && socket) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.receiverId === currentUserId
      );

      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map((msg) => msg.id);
        markMessagesAsRead(unreadIds);

        // Emit read receipt via socket
        unreadMessages.forEach((msg) => {
          socket.emit("mark_as_read", { messageId: msg.id });
        });
      }
    }
  }, [messages, selectedChat, currentUserId, socket]);

  const selectedConversation = conversations.find(
    (c) => c.userId === selectedChat
  );

  if (!token || !user) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please log in to view messages</p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* 🧾 Conversations List */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                <Badge
                  variant={isConnected ? "default" : "secondary"}
                  className={isConnected ? "bg-green-500" : "bg-gray-500"}
                >
                  {isConnected ? "Online" : "Offline"}
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading && conversations.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat === conversation.userId
                          ? "bg-blue-50 border-r-2 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>
                              {conversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {conversation.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  conversation.lastMessageAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {conversations.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No conversations yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 💬 Chat Area */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            {/* Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                {selectedConversation ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback>
                            {selectedConversation.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.online
                            ? "Online"
                            : "Last seen recently"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button> */}
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center w-full py-4">
                    <p className="text-gray-500">
                      Select a conversation to start chatting
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  {messages.length === 0 && selectedChat && (
                    <p className="text-center text-gray-400 text-sm mt-8">
                      No messages yet. Start the conversation!
                    </p>
                  )}

                  {messages.map((message) => {
                    const isOwn = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                            isOwn ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {!isOwn && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback>
                                {message.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isOwn
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {message.messageType === "file" ? (
                              message.attachments.map((fileUrl, index) => {
                                const isImage =
                                  /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                                    fileUrl
                                  );
                                const isPDF = /\.pdf$/i.test(fileUrl);
                                const fileName = fileUrl.split("/").pop();

                                return (
                                  <div key={index} className="mt-2">
                                    {isImage ? (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <img
                                          src={fileUrl}
                                          alt="Attachment"
                                          className="rounded-lg max-w-[200px] border"
                                        />
                                      </a>
                                    ) : isPDF ? (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`block mt-1 underline ${
                                          isOwn
                                            ? "text-blue-100"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        📄 {fileName}
                                      </a>
                                    ) : (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`block mt-1 underline ${
                                          isOwn
                                            ? "text-blue-100"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        📎 {fileName}
                                      </a>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                              {isOwn && (
                                <span className="ml-2">
                                  {message.isRead ? "✓✓" : "✓"}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input */}
            {selectedChat && (
              <div className="border-t p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => {
                        console.log("Typed:", e.target.value);
                        setNewMessage(e.target.value);
                      }}
                      className="min-h-[40px] max-h-32 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !selectedChat}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProviderLayout>
  );
}
