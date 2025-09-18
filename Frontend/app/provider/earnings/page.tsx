"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Calendar, Download, Eye, CreditCard, Wallet, PieChart, BarChart3 } from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"

export default function ProviderEarningsPage() {
  const [timeFilter, setTimeFilter] = useState("this-month")

  const earningsData = {
    totalEarnings: 85000,
    thisMonth: 12500,
    pendingPayments: 4200,
    availableBalance: 8300,
    monthlyGrowth: 15.2,
    averageProjectValue: 3542,
  }

  const recentPayments = [
    {
      id: 1,
      project: "E-commerce Platform Development",
      client: "TechStart Sdn Bhd",
      amount: 4500,
      status: "completed",
      date: "2024-01-25",
      milestone: "Final Delivery",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      project: "Mobile App UI/UX Design",
      client: "Digital Solutions",
      amount: 2000,
      status: "pending",
      date: "2024-01-23",
      milestone: "Design Phase 2",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      project: "Cloud Infrastructure Setup",
      client: "Manufacturing Corp",
      amount: 6000,
      status: "completed",
      date: "2024-01-20",
      milestone: "Infrastructure Deployment",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      project: "Website Redesign",
      client: "Legal Firm KL",
      amount: 1800,
      status: "processing",
      date: "2024-01-18",
      milestone: "Frontend Development",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const monthlyEarnings = [
    { month: "Aug 2023", amount: 6800, projects: 3 },
    { month: "Sep 2023", amount: 8200, projects: 4 },
    { month: "Oct 2023", amount: 7500, projects: 3 },
    { month: "Nov 2023", amount: 9200, projects: 5 },
    { month: "Dec 2023", amount: 11000, projects: 4 },
    { month: "Jan 2024", amount: 12500, projects: 6 },
  ]

  const topClients = [
    {
      name: "TechStart Sdn Bhd",
      totalPaid: 18500,
      projects: 3,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Manufacturing Corp",
      totalPaid: 15200,
      projects: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Digital Solutions",
      totalPaid: 12800,
      projects: 4,
      avatar: "/placeholder.svg?height=40&width=40",
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Paid"
      case "pending":
        return "Pending"
      case "processing":
        return "Processing"
      default:
        return status
    }
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600">Track your income and payment history</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">RM{earningsData.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">RM{earningsData.thisMonth.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+{earningsData.monthlyGrowth}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    RM{earningsData.pendingPayments.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    RM{earningsData.availableBalance.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Monthly Earnings Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Monthly Earnings Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyEarnings.map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="font-medium">{month.month}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{month.projects} projects</span>
                            <span className="font-semibold">RM{month.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>Your latest payment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPayments.slice(0, 4).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={payment.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{payment.client.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payment.project}</p>
                              <p className="text-sm text-gray-600">{payment.client}</p>
                              <p className="text-xs text-gray-500">{payment.milestone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">RM{payment.amount.toLocaleString()}</p>
                            <Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{payment.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Project Value</span>
                      <span className="font-semibold">RM{earningsData.averageProjectValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Projects This Month</span>
                      <span className="font-semibold">6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Repeat Clients</span>
                      <span className="font-semibold">67%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Clients */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Clients</CardTitle>
                    <CardDescription>Clients with highest total payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topClients.map((client, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{client.name}</p>
                            <p className="text-sm text-gray-500">{client.projects} projects</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">RM{client.totalPaid.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Withdraw Balance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div>
                        <p className="text-3xl font-bold text-green-600">
                          RM{earningsData.availableBalance.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Ready to withdraw</p>
                      </div>
                      <Button className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Withdraw Funds
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Complete history of all your payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={payment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{payment.client.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{payment.project}</p>
                          <p className="text-sm text-gray-600">{payment.client}</p>
                          <p className="text-xs text-gray-500">
                            {payment.milestone} • {payment.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold">RM{payment.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status)}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Earnings by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">Web Development</span>
                      </div>
                      <span className="font-semibold">RM45,200 (53%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">Mobile Development</span>
                      </div>
                      <span className="font-semibold">RM25,800 (30%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-sm">Cloud Services</span>
                      </div>
                      <span className="font-semibold">RM14,000 (17%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Project Completion Rate</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">On-time Delivery</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Client Satisfaction</span>
                      <span className="font-semibold">4.9/5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="font-semibold">2.3 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdraw */}
          <TabsContent value="withdraw">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Funds</CardTitle>
                  <CardDescription>Transfer your earnings to your bank account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">Available Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                          RM{earningsData.availableBalance.toLocaleString()}
                        </p>
                      </div>
                      <Wallet className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bank Account</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maybank">Maybank - ****1234</SelectItem>
                          <SelectItem value="cimb">CIMB Bank - ****5678</SelectItem>
                          <SelectItem value="public">Public Bank - ****9012</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Withdrawal Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">RM</span>
                        <input
                          type="number"
                          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          max={earningsData.availableBalance}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum: RM{earningsData.availableBalance.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Withdrawal Information</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Processing time: 1-3 business days</li>
                        <li>• No withdrawal fees for amounts above RM100</li>
                        <li>• Minimum withdrawal amount: RM50</li>
                      </ul>
                    </div>

                    <Button className="w-full" size="lg">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Request Withdrawal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProviderLayout>
  )
}
