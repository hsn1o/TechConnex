"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Eye, MessageSquare, Calendar, DollarSign, Clock } from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"

export default function ProviderProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const projects = [
    {
      id: 1,
      title: "E-commerce Platform Development",
      client: "TechStart Sdn Bhd",
      status: "in_progress",
      progress: 75,
      budget: 18000,
      earned: 13500,
      startDate: "2024-01-01",
      deadline: "2024-02-20",
      description: "Building a comprehensive e-commerce platform with payment integration and admin dashboard.",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "Web Development",
      milestones: 4,
      completedMilestones: 3,
      nextMilestone: "Payment Integration Testing",
      clientRating: 4.8,
      lastUpdate: "2 hours ago",
    },
    {
      id: 2,
      title: "Mobile App UI/UX Design",
      client: "Digital Solutions",
      status: "in_progress",
      progress: 45,
      budget: 8000,
      earned: 3600,
      startDate: "2024-01-15",
      deadline: "2024-02-15",
      description: "Complete UI/UX design for a fitness tracking mobile application.",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "UI/UX Design",
      milestones: 3,
      completedMilestones: 1,
      nextMilestone: "High-fidelity Mockups",
      clientRating: 4.9,
      lastUpdate: "1 day ago",
    },
    {
      id: 3,
      title: "Cloud Infrastructure Setup",
      client: "Manufacturing Corp",
      status: "completed",
      progress: 100,
      budget: 25000,
      earned: 25000,
      startDate: "2023-11-01",
      deadline: "2023-12-31",
      description: "Complete AWS cloud infrastructure setup with auto-scaling and monitoring.",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "Cloud Services",
      milestones: 5,
      completedMilestones: 5,
      nextMilestone: null,
      clientRating: 5.0,
      lastUpdate: "Completed",
    },
    {
      id: 4,
      title: "Data Analytics Dashboard",
      client: "RetailTech Solutions",
      status: "pending",
      progress: 0,
      budget: 12000,
      earned: 0,
      startDate: "2024-02-01",
      deadline: "2024-03-15",
      description: "Business intelligence dashboard with real-time analytics and reporting features.",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "Data Analytics",
      milestones: 4,
      completedMilestones: 0,
      nextMilestone: "Requirements Analysis",
      clientRating: 0,
      lastUpdate: "Waiting to start",
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
      case "on_hold":
        return "On Hold"
      default:
        return status
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    totalEarnings: projects.reduce((sum, p) => sum + p.earned, 0),
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Manage and track all your active and completed projects</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">RM{stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
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
                    placeholder="Search projects..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid gap-6">
              {filteredProjects
                .filter((p) => p.status === "in_progress" || p.status === "pending")
                .map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                          </div>
                          <CardDescription className="text-base">{project.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={project.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{project.client.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{project.client}</p>
                            <p className="text-sm text-gray-500">{project.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            RM{project.earned.toLocaleString()} / RM{project.budget.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {project.status === "in_progress" && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress: {project.progress}%</span>
                            <span>
                              {project.completedMilestones}/{project.milestones} milestones
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                          {project.nextMilestone && (
                            <p className="text-sm text-blue-600 mt-2">Next: {project.nextMilestone}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                          <span>Last update: {project.lastUpdate}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-6">
              {filteredProjects
                .filter((p) => p.status === "completed")
                .map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                          </div>
                          <CardDescription className="text-base">{project.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={project.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{project.client.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{project.client}</p>
                            <p className="text-sm text-gray-500">{project.category}</p>
                            {project.clientRating > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm font-medium">{project.clientRating}</span>
                                <span className="text-sm text-gray-500">client rating</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">RM{project.earned.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            Completed: {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Duration: {project.startDate} - {project.deadline}
                          </span>
                          <span>{project.milestones} milestones completed</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                        </div>
                        <CardDescription className="text-base">{project.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={project.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{project.client.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{project.client}</p>
                          <p className="text-sm text-gray-500">{project.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          RM{project.earned.toLocaleString()} / RM{project.budget.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Due: {new Date(project.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {project.status === "in_progress" && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress: {project.progress}%</span>
                          <span>
                            {project.completedMilestones}/{project.milestones} milestones
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        {project.nextMilestone && (
                          <p className="text-sm text-blue-600 mt-2">Next: {project.nextMilestone}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                        <span>Last update: {project.lastUpdate}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProviderLayout>
  )
}
