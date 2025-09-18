"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
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
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Briefcase,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

export default function AdminProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const projects = [
    {
      id: 1,
      title: "E-commerce Mobile App",
      customer: "TechStart Sdn Bhd",
      provider: "Ahmad Tech Solutions",
      category: "Mobile Development",
      status: "in_progress",
      progress: 65,
      budget: 15000,
      spent: 9750,
      startDate: "2024-01-01",
      deadline: "2024-02-15",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      milestones: 4,
      completedMilestones: 2,
      disputes: 0,
    },
    {
      id: 2,
      title: "Company Website Redesign",
      customer: "Legal Firm KL",
      provider: "Digital Craft Studio",
      category: "Web Development",
      status: "completed",
      progress: 100,
      budget: 8000,
      spent: 8000,
      startDate: "2023-12-01",
      deadline: "2024-01-20",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      milestones: 3,
      completedMilestones: 3,
      disputes: 0,
    },
    {
      id: 3,
      title: "Cloud Migration Services",
      customer: "Manufacturing Corp",
      provider: "CloudTech Malaysia",
      category: "Cloud Services",
      status: "disputed",
      progress: 40,
      budget: 22000,
      spent: 8800,
      startDate: "2024-01-15",
      deadline: "2024-03-01",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      milestones: 5,
      completedMilestones: 2,
      disputes: 1,
    },
    {
      id: 4,
      title: "Data Analytics Dashboard",
      customer: "RetailTech Solutions",
      provider: "DataViz Solutions",
      category: "Data Analytics",
      status: "pending",
      progress: 0,
      budget: 12000,
      spent: 0,
      startDate: "2024-02-01",
      deadline: "2024-02-28",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      milestones: 4,
      completedMilestones: 0,
      disputes: 0,
    },
    {
      id: 5,
      title: "IoT Smart Home System",
      customer: "PropTech Solutions",
      provider: "IoT Innovations",
      category: "IoT Solutions",
      status: "on_hold",
      progress: 25,
      budget: 35000,
      spent: 8750,
      startDate: "2024-01-10",
      deadline: "2024-04-15",
      customerAvatar: "/placeholder.svg?height=32&width=32",
      providerAvatar: "/placeholder.svg?height=32&width=32",
      milestones: 6,
      completedMilestones: 1,
      disputes: 0,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "disputed":
        return "bg-red-100 text-red-800"
      case "on_hold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "pending":
        return "Pending"
      case "disputed":
        return "Disputed"
      case "on_hold":
        return "On Hold"
      default:
        return status
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesCategory =
      categoryFilter === "all" || project.category.toLowerCase().includes(categoryFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesCategory
  })

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    disputedProjects: projects.filter((p) => p.status === "disputed").length,
    totalValue: projects.reduce((sum, p) => sum + p.budget, 0),
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Monitor and manage all platform projects</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Briefcase className="w-4 h-4 mr-2" />
              Project Analytics
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disputed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.disputedProjects}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">RM{(stats.totalValue / 1000).toFixed(0)}K</p>
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
                    placeholder="Search projects, customers, or providers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="cloud">Cloud Services</SelectItem>
                  <SelectItem value="iot">IoT Solutions</SelectItem>
                  <SelectItem value="data">Data Analytics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({filteredProjects.length})</CardTitle>
            <CardDescription>Monitor project progress and resolve issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-gray-500">{project.category}</p>
                        {project.disputes > 0 && (
                          <Badge className="bg-red-100 text-red-800 mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {project.disputes} dispute(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={project.customerAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{project.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.customer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={project.providerAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{project.provider.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.provider}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{project.progress}%</span>
                          <span>
                            {project.completedMilestones}/{project.milestones}
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">RM{project.budget.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">RM{project.spent.toLocaleString()} spent</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">Started: {project.startDate}</p>
                        <p className="text-sm text-gray-500">Due: {project.deadline}</p>
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
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {project.disputes > 0 && (
                            <DropdownMenuItem className="text-red-600">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Resolve Dispute
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
