"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Send, Paperclip, Phone, Video, MoreVertical } from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"

export default function ProviderMessagesPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [newMessage, setNewMessage] = useState("")

  const conversations = [
    {
      id: 1,
      name: "TechStart Sdn Bhd",
      project: "E-commerce Platform",
      lastMessage: "The authentication module looks great! Can we add social login options?",
      timestamp: "5 min ago",
      unread: 1,
      online: true,
      avatar: "/placeholder.svg?height=40&width=40",
      contact: "John Doe",
    },
    {
      id: 2,
      name: "Digital Solutions",
      project: "Mobile App Design",
      lastMessage: "Perfect! The new wireframes address all our concerns. Please proceed with development.",
      timestamp: "2 hours ago",
      unread: 0,
      online: false,
      avatar: "/placeholder.svg?height=40&width=40",
      contact: "Sarah Chen",
    },
    {
      id: 3,
      name: "Manufacturing Corp",
      project: "Cloud Migration",
      lastMessage: "We need to discuss the timeline for the database migration phase.",
      timestamp: "1 day ago",
      unread: 2,
      online: true,
      avatar: "/placeholder.svg?height=40&width=40",
      contact: "Mike Johnson",
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "John Doe",
      content: "Hi Ahmad! Thanks for the quick turnaround on the authentication module.",
      timestamp: "2:30 PM",
      isOwn: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      sender: "You",
      content: "You're welcome! I've implemented the basic email/password authentication with email verification.",
      timestamp: "2:35 PM",
      isOwn: true,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      sender: "John Doe",
      content: "That's exactly what we needed. The code quality is excellent and the documentation is very clear.",
      timestamp: "2:40 PM",
      isOwn: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      sender: "You",
      content:
        "Thank you! I always make sure to include comprehensive documentation. Is there anything specific you'd like me to add or modify?",
      timestamp: "2:45 PM",
      isOwn: true,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 5,
      sender: "John Doe",
      content: "The authentication module looks great! Can we add social login options?",
      timestamp: "5 min ago",
      isOwn: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const selectedConversation = conversations.find((conv) => conv.id === selectedChat)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("")
    }
  }

  return (
    <ProviderLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Conversations List */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Client Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === conversation.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedChat(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate">{conversation.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-blue-600 mb-1">{conversation.project}</p>
                        <p className="text-xs text-gray-500 mb-1">Contact: {conversation.contact}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedConversation?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{selectedConversation?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedConversation?.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation?.name}</h3>
                    <p className="text-sm text-blue-600">{selectedConversation?.project}</p>
                    <p className="text-xs text-gray-500">
                      Contact: {selectedConversation?.contact} •{" "}
                      {selectedConversation?.online ? "Online" : "Last seen 2 hours ago"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    {!message.isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-end space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[40px] max-h-32 resize-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  )
}
