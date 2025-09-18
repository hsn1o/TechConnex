"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")

  const disputes = [
    {
      id: 1,
      title: "Payment not released after project completion",
      projectTitle: "E-commerce Mobile App",
      customer: "TechStart Sdn Bhd",
      provider: "Ahmad Tech Solutions",
      status: "open",
      priority: "high",
      amount: 15000,
      createdDate: "2024-01-25",
      lastUpdate: "2024-01-26",
      description:
        "Project was completed and delivered on time, but payment has not been released for over 2 weeks despite multiple follow-ups.",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      evidence: [
        { type: "screenshot", name: "Project Delivery Confirmation", url: "#" },
        { type: "email", name: "Client Approval Email", url: "#" },
        { type: "document", name: "Project Completion Report", url: "#" },
      ],
      messages: [
        {
          id: 1,
          sender: "provider",
          name: "Ahmad Tech Solutions",
          message:
            "I have completed all project requirements and received approval from the client. Payment should be released.",
          timestamp: "2024-01-25 10:30 AM",
        },
        {
          id: 2,
          sender: "customer",
          name: "TechStart Sdn Bhd",
          message: "There are some minor issues that need to be addressed before we can release payment.",
          timestamp: "2024-01-25 2:15 PM",
        },
      ],
    },
    {
      id: 2,
      title: "Scope creep without additional compensation",
      projectTitle: "Company Website Redesign",
      customer: "Legal Firm KL",
      provider: "Digital Craft Studio",
      status: "in_review",
      priority: "medium",
      amount: 8000,
      createdDate: "2024-01-22",
      lastUpdate: "2024-01-24",
      description:
        "Client is requesting additional features beyond the original scope without agreeing to additional payment.",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      evidence: [
        { type: "document", name: "Original Project Scope", url: "#" },
        { type: "email", name: "Additional Requirements Email", url: "#" },
      ],
      messages: [
        {
          id: 1,
          sender: "provider",
          name: "Digital Craft Studio",
          message:
            "The client is requesting features that were not in the original scope. This requires additional payment.",
          timestamp: "2024-01-22 9:00 AM",
        },
      ],
    },
    {
      id: 3,
      title: "Quality of work not meeting standards",
      projectTitle: "Cloud Migration Services",
      customer: "Manufacturing Corp",
      provider: "CloudTech Malaysia",
      status: "resolved",
      priority: "high",
      amount: 22000,
      createdDate: "2024-01-15",
      lastUpdate: "2024-01-20",
      resolution: "Partial refund of RM 5,000 provided. Provider agreed to fix issues at no additional cost.",
      description: "The cloud migration was not completed properly, causing system downtime and data access issues.",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      evidence: [
        { type: "report", name: "System Downtime Report", url: "#" },
        { type: "screenshot", name: "Error Screenshots", url: "#" },
      ],
      messages: [
        {
          id: 1,
          sender: "customer",
          name: "Manufacturing Corp",
          message: "The migration caused significant downtime and we're experiencing data access issues.",
          timestamp: "2024-01-15 11:00 AM",
        },
        {
          id: 2,
          sender: "admin",
          name: "TechConnect Admin",
          message: "After review, we've determined that a partial refund and remediation work is appropriate.",
          timestamp: "2024-01-20 3:30 PM",
        },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter
    const matchesPriority = priorityFilter === "all" || dispute.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    totalDisputes: disputes.length,
    openDisputes: disputes.filter((d) => d.status === "open").length,
    inReviewDisputes: disputes.filter((d) => d.status === "in_review").length,
    resolvedDisputes: disputes.filter((d) => d.status === "resolved").length,
    totalAmount: disputes.reduce((sum, d) => sum + d.amount, 0),
  }

  const handleResolve = (id: number) => {
    console.log("Resolving dispute:", id, "Notes:", resolutionNotes)
    setSelectedDispute(null)
    setResolutionNotes("")
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
            <p className="text-gray-600">Resolve conflicts between customers and providers</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Dispute Guidelines
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDisputes}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-red-600">{stats.openDisputes}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inReviewDisputes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedDisputes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">RM{(stats.totalAmount / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search disputes, customers, or providers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Disputes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes ({filteredDisputes.length})</CardTitle>
            <CardDescription>Review and resolve platform disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{dispute.title}</p>
                        <p className="text-sm text-gray-500">{dispute.projectTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={dispute.customerAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{dispute.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{dispute.customer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={dispute.providerAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{dispute.provider.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{dispute.provider}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1).replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(dispute.priority)}>
                        {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">RM{dispute.amount.toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{dispute.createdDate}</p>
                        <p className="text-xs text-gray-500">Updated: {dispute.lastUpdate}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedDispute(dispute)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Dispute Review - {dispute.title}</DialogTitle>
                            <DialogDescription>Review dispute details and provide resolution</DialogDescription>
                          </DialogHeader>

                          {selectedDispute && (
                            <div className="space-y-6">
                              {/* Dispute Overview */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Dispute Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <p className="font-medium">{selectedDispute.title}</p>
                                      <p className="text-sm text-gray-500">Project: {selectedDispute.projectTitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge className={getStatusColor(selectedDispute.status)}>
                                        {selectedDispute.status.charAt(0).toUpperCase() +
                                          selectedDispute.status.slice(1).replace("_", " ")}
                                      </Badge>
                                      <Badge className={getPriorityColor(selectedDispute.priority)}>
                                        {selectedDispute.priority.charAt(0).toUpperCase() +
                                          selectedDispute.priority.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <p>
                                        <span className="font-medium">Amount:</span> RM
                                        {selectedDispute.amount.toLocaleString()}
                                      </p>
                                      <p>
                                        <span className="font-medium">Created:</span> {selectedDispute.createdDate}
                                      </p>
                                      <p>
                                        <span className="font-medium">Last Update:</span> {selectedDispute.lastUpdate}
                                      </p>
                                    </div>
                                    <div className="mt-3">
                                      <p className="font-medium mb-2">Description:</p>
                                      <p className="text-sm text-gray-700">{selectedDispute.description}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Participants</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                                      <Avatar>
                                        <AvatarImage src={selectedDispute.customerAvatar || "/placeholder.svg"} />
                                        <AvatarFallback>{selectedDispute.customer.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{selectedDispute.customer}</p>
                                        <p className="text-sm text-gray-500">Customer</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                                      <Avatar>
                                        <AvatarImage src={selectedDispute.providerAvatar || "/placeholder.svg"} />
                                        <AvatarFallback>{selectedDispute.provider.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{selectedDispute.provider}</p>
                                        <p className="text-sm text-gray-500">Provider</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Evidence */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Evidence & Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {selectedDispute.evidence.map((item, index) => (
                                      <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileText className="w-4 h-4 text-blue-600" />
                                          <span className="font-medium">{item.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">Type: {item.type}</p>
                                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                                          <Eye className="w-4 h-4 mr-2" />
                                          View
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Messages */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Communication History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {selectedDispute.messages.map((message) => (
                                      <div key={message.id} className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge variant="outline">
                                            {message.sender === "admin"
                                              ? "Admin"
                                              : message.sender === "customer"
                                                ? "Customer"
                                                : "Provider"}
                                          </Badge>
                                          <span className="font-medium">{message.name}</span>
                                          <span className="text-sm text-gray-500">{message.timestamp}</span>
                                        </div>
                                        <p className="text-sm">{message.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Resolution */}
                              {selectedDispute.status === "resolved" && selectedDispute.resolution && (
                                <Card className="border-green-200 bg-green-50">
                                  <CardHeader>
                                    <CardTitle className="text-lg text-green-800">Resolution</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-green-700">{selectedDispute.resolution}</p>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Resolution Form */}
                              {selectedDispute.status !== "resolved" && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Resolution Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Textarea
                                      placeholder="Enter your resolution decision and reasoning..."
                                      value={resolutionNotes}
                                      onChange={(e) => setResolutionNotes(e.target.value)}
                                      className="min-h-[120px]"
                                    />
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}

                          <DialogFooter>
                            {selectedDispute?.status !== "resolved" && (
                              <div className="flex gap-3">
                                <Button variant="outline">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Request More Info
                                </Button>
                                <Button
                                  onClick={() => handleResolve(selectedDispute.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Resolve Dispute
                                </Button>
                              </div>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
