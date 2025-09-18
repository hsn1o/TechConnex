"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  FileText,
  Star,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"

export default function AdminDashboard() {
  // Mock data
  const stats = {
    totalUsers: 1247,
    activeProjects: 89,
    totalRevenue: 2450000,
    platformGrowth: 23.5,
    pendingVerifications: 12,
    disputesCases: 3,
  }

  const recentActivity = [
    {
      id: 1,
      type: "user_registration",
      user: "Ahmad Rahman",
      action: "New provider registration",
      time: "5 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "project_completion",
      user: "TechStart Sdn Bhd",
      action: "Project completed - E-commerce Platform",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 3,
      type: "dispute",
      user: "Sarah Digital Solutions",
      action: "Dispute raised for Mobile App project",
      time: "2 hours ago",
      status: "urgent",
    },
    {
      id: 4,
      type: "payment",
      user: "CloudTech Malaysia",
      action: "Payment released - RM 18,000",
      time: "3 hours ago",
      status: "completed",
    },
  ]

  const pendingVerifications = [
    {
      id: 1,
      name: "Ahmad Rahman",
      type: "Provider",
      submitted: "2024-01-15",
      documents: ["MyKad", "Portfolio", "Certificates"],
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "TechInnovate Sdn Bhd",
      type: "Customer",
      submitted: "2024-01-14",
      documents: ["SSM Certificate", "Company Profile"],
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const topProviders = [
    {
      id: 1,
      name: "Sarah Lim",
      rating: 4.9,
      completedJobs: 45,
      earnings: 125000,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Digital Craft Studio",
      rating: 4.8,
      completedJobs: 78,
      earnings: 245000,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <Users className="w-4 h-4" />
      case "project_completion":
        return <CheckCircle className="w-4 h-4" />
      case "dispute":
        return <AlertTriangle className="w-4 h-4" />
      case "payment":
        return <DollarSign className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "urgent":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Platform overview and management tools</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/reports">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">RM{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">+{stats.platformGrowth}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-yellow-900">Pending Verifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-yellow-800">{stats.pendingVerifications} users awaiting verification</p>
                <Link href="/admin/verifications">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent"
                  >
                    Review
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-900">Active Disputes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-red-800">{stats.disputesCases} disputes require attention</p>
                <Link href="/admin/disputes">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                  >
                    Resolve
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.status)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Badge className={getActivityColor(activity.status)}>{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Verifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Verifications</CardTitle>
                  <Link href="/admin/verifications">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVerifications.map((verification) => (
                    <div key={verification.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={verification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{verification.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{verification.name}</p>
                        <p className="text-sm text-gray-600">{verification.type}</p>
                        <p className="text-xs text-gray-500">Submitted: {verification.submitted}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button size="sm" className="text-xs">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Providers</CardTitle>
                <CardDescription>Highest performing service providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={provider.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{provider.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm">{provider.rating}</span>
                          <span className="text-xs text-gray-500">({provider.completedJobs} jobs)</span>
                        </div>
                        <p className="text-xs text-gray-600">RM{provider.earnings.toLocaleString()} earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/projects">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Monitor Projects
                  </Button>
                </Link>
                <Link href="/admin/payments">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payment Management
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
