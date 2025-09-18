"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  Download,
  DollarSign,
  CreditCard,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const payments = [
    {
      id: 1,
      transactionId: "TXN-2024-001",
      type: "project_payment",
      amount: 15000,
      fee: 750,
      netAmount: 14250,
      status: "completed",
      customer: "TechStart Sdn Bhd",
      provider: "Ahmad Tech Solutions",
      project: "E-commerce Mobile App",
      paymentMethod: "Online Banking",
      processedDate: "2024-01-26",
      createdDate: "2024-01-25",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      transactionId: "TXN-2024-002",
      type: "withdrawal",
      amount: 8000,
      fee: 40,
      netAmount: 7960,
      status: "pending",
      provider: "Digital Craft Studio",
      bankAccount: "Maybank - ****1234",
      processedDate: null,
      createdDate: "2024-01-26",
      providerAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      transactionId: "TXN-2024-003",
      type: "refund",
      amount: 5000,
      fee: 0,
      netAmount: 5000,
      status: "processing",
      customer: "Manufacturing Corp",
      provider: "CloudTech Malaysia",
      project: "Cloud Migration Services",
      reason: "Dispute resolution - partial refund",
      processedDate: null,
      createdDate: "2024-01-24",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      transactionId: "TXN-2024-004",
      type: "project_payment",
      amount: 12000,
      fee: 600,
      netAmount: 11400,
      status: "failed",
      customer: "RetailTech Solutions",
      provider: "DataViz Solutions",
      project: "Data Analytics Dashboard",
      paymentMethod: "Credit Card",
      failureReason: "Insufficient funds",
      processedDate: null,
      createdDate: "2024-01-23",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 5,
      transactionId: "TXN-2024-005",
      type: "platform_fee",
      amount: 750,
      fee: 0,
      netAmount: 750,
      status: "completed",
      project: "E-commerce Mobile App",
      description: "Platform commission (5%)",
      processedDate: "2024-01-26",
      createdDate: "2024-01-26",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project_payment":
        return "bg-blue-100 text-blue-800"
      case "withdrawal":
        return "bg-purple-100 text-purple-800"
      case "refund":
        return "bg-orange-100 text-orange-800"
      case "platform_fee":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "project_payment":
        return "Project Payment"
      case "withdrawal":
        return "Withdrawal"
      case "refund":
        return "Refund"
      case "platform_fee":
        return "Platform Fee"
      default:
        return type
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.project?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesType = typeFilter === "all" || payment.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    totalTransactions: payments.length,
    totalVolume: payments.reduce((sum, p) => sum + p.amount, 0),
    totalFees: payments.reduce((sum, p) => sum + p.fee, 0),
    pendingPayments: payments.filter((p) => p.status === "pending").length,
    failedPayments: payments.filter((p) => p.status === "failed").length,
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">Monitor and manage all platform transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Transactions
            </Button>
            <Button>
              <TrendingUp className="w-4 h-4 mr-2" />
              Financial Reports
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-green-600">RM{(stats.totalVolume / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold text-purple-600">RM{stats.totalFees.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
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
                    placeholder="Search transactions, users, or projects..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project_payment">Project Payments</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                  <SelectItem value="platform_fee">Platform Fees</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
            <CardDescription>Monitor all platform financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.transactionId}</p>
                        {payment.project && <p className="text-sm text-gray-500">{payment.project}</p>}
                        {payment.description && <p className="text-sm text-gray-500">{payment.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(payment.type)}>{getTypeText(payment.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {payment.customer && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={payment.customerAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{payment.customer.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{payment.customer}</span>
                          </div>
                        )}
                        {payment.provider && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={payment.providerAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{payment.provider.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{payment.provider}</span>
                          </div>
                        )}
                        {payment.bankAccount && <p className="text-sm text-gray-500">{payment.bankAccount}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">RM{payment.amount.toLocaleString()}</p>
                        {payment.fee > 0 && (
                          <p className="text-sm text-gray-500">Fee: RM{payment.fee.toLocaleString()}</p>
                        )}
                        <p className="text-sm font-medium text-green-600">
                          Net: RM{payment.netAmount.toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                      {payment.failureReason && <p className="text-xs text-red-600 mt-1">{payment.failureReason}</p>}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">Created: {payment.createdDate}</p>
                        {payment.processedDate && (
                          <p className="text-sm text-gray-500">Processed: {payment.processedDate}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {payment.status === "failed" && (
                            <DropdownMenuItem>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                          {payment.status === "pending" && (
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Transaction
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
