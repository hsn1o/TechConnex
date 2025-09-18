"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Star,
  FileText,
  PieChart,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("last_30_days")
  const [reportType, setReportType] = useState("overview")

  // Mock data for reports
  const overviewStats = {
    totalRevenue: 2450000,
    revenueGrowth: 23.5,
    totalUsers: 1247,
    userGrowth: 18.2,
    totalProjects: 89,
    projectGrowth: 15.8,
    avgRating: 4.7,
    ratingChange: 0.3,
  }

  const monthlyData = [
    { month: "Jan", revenue: 180000, projects: 12, users: 45 },
    { month: "Feb", revenue: 220000, projects: 18, users: 62 },
    { month: "Mar", revenue: 195000, projects: 15, users: 38 },
    { month: "Apr", revenue: 285000, projects: 22, users: 71 },
    { month: "May", revenue: 310000, projects: 28, users: 89 },
    { month: "Jun", revenue: 275000, projects: 25, users: 67 },
  ]

  const categoryBreakdown = [
    { category: "Web Development", projects: 35, revenue: 850000, percentage: 34.7 },
    { category: "Mobile Development", projects: 28, revenue: 720000, percentage: 29.4 },
    { category: "Cloud Services", projects: 18, revenue: 540000, percentage: 22.0 },
    { category: "Data Analytics", projects: 12, revenue: 280000, percentage: 11.4 },
    { category: "IoT Solutions", projects: 8, revenue: 160000, percentage: 6.5 },
  ]

  const topProviders = [
    { name: "Ahmad Tech Solutions", projects: 12, revenue: 185000, rating: 4.9 },
    { name: "Digital Craft Studio", projects: 15, revenue: 165000, rating: 4.8 },
    { name: "CloudTech Malaysia", projects: 8, revenue: 145000, rating: 4.6 },
    { name: "DataViz Solutions", projects: 10, revenue: 125000, rating: 4.7 },
    { name: "IoT Innovations", projects: 6, revenue: 95000, rating: 4.5 },
  ]

  const topCustomers = [
    { name: "TechStart Sdn Bhd", projects: 8, spent: 125000 },
    { name: "Manufacturing Corp", projects: 6, spent: 98000 },
    { name: "Legal Firm KL", projects: 5, spent: 75000 },
    { name: "RetailTech Solutions", projects: 4, spent: 68000 },
    { name: "PropTech Solutions", projects: 3, spent: 55000 },
  ]

  const generateReport = () => {
    console.log("Generating report for:", reportType, "Date range:", dateRange)
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive platform performance insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={generateReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Platform Overview</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="user_activity">User Activity</SelectItem>
                  <SelectItem value="project_performance">Project Performance</SelectItem>
                  <SelectItem value="provider_analytics">Provider Analytics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Custom Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    RM{(overviewStats.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+{overviewStats.revenueGrowth}%</span>
                  </div>
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
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">+{overviewStats.userGrowth}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats.totalProjects}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600">+{overviewStats.projectGrowth}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats.avgRating}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-sm text-yellow-600">+{overviewStats.ratingChange}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Monthly Performance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Revenue, projects, and user growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyData.map((month, index) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{month.month} 2024</span>
                        <span className="text-sm text-gray-500">RM{(month.revenue / 1000).toFixed(0)}K</span>
                      </div>
                      <Progress value={(month.revenue / 350000) * 100} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{month.projects} projects</span>
                        <span>{month.users} new users</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Service category performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-gray-500">{category.percentage}%</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{category.projects} projects</span>
                        <span>RM{(category.revenue / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Providers</CardTitle>
              <CardDescription>Highest earning service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProviders.map((provider, index) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{provider.projects} projects</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span>{provider.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">RM{(provider.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Customers</CardTitle>
              <CardDescription>Highest value customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.projects} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">RM{(customer.spent / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report Generation</CardTitle>
            <CardDescription>Generate specific reports for different stakeholders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <FileText className="w-6 h-6" />
                <span>Financial Summary</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Users className="w-6 h-6" />
                <span>User Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Briefcase className="w-6 h-6" />
                <span>Project Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <PieChart className="w-6 h-6" />
                <span>Performance Metrics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
