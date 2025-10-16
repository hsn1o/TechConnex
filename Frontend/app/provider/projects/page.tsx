"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Eye, MessageSquare, Calendar, DollarSign, Clock, Loader2 } from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"
import { getProviderProjects, getProviderProjectStats } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ProviderProjectsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEarnings: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [projectsResponse, statsResponse] = await Promise.all([
          getProviderProjects({
            page: 1,
            limit: 100,
            search: searchQuery,
            status: statusFilter === "all" ? undefined : statusFilter.toUpperCase()
          }),
          getProviderProjectStats()
        ])

        if (projectsResponse.success) {
          setProjects(projectsResponse.projects || [])
        }

        if (statsResponse.success) {
          setStats(statsResponse.stats)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, statusFilter, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "DISPUTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed"
      case "IN_PROGRESS":
        return "In Progress"
      case "DISPUTED":
        return "Disputed"
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Since we're filtering on the server side, we can use projects directly
  const filteredProjects = projects

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
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</p>
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
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DISPUTED">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading projects...</h3>
              <p className="text-gray-600">Please wait while we fetch your projects.</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading projects</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Projects</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="grid gap-6">
                {filteredProjects
                  .filter((p) => p.status === "IN_PROGRESS" || p.status === "DISPUTED")
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
                            <AvatarImage src={project.customer?.customerProfile?.logoUrl || "/placeholder.svg"} />
                            <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{project.customer?.name || "Unknown Client"}</p>
                            <p className="text-sm text-gray-500">{project.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>

                      {project.status === "IN_PROGRESS" && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress: {project.progress || 0}%</span>
                            <span>
                              {project.completedMilestones || 0}/{project.totalMilestones || 0} milestones
                            </span>
                          </div>
                          <Progress value={project.progress || 0} className="h-2" />
                          {project.milestones && project.milestones.length > 0 && (
                            <p className="text-sm text-blue-600 mt-2">
                              Next: {project.milestones.find((m: any) => m.status === "PENDING")?.title || "No pending milestones"}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Started: {formatDate(project.createdAt)}</span>
                          <span>Timeline: {project.timeline || "Not specified"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Link href={`/provider/projects/${project.id}`}>
                            <Button size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
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
                .filter((p) => p.status === "COMPLETED")
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
                          <AvatarImage src={project.customer?.customerProfile?.logoUrl || "/placeholder.svg"} />
                          <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{project.customer?.name || "Unknown Client"}</p>
                          <p className="text-sm text-gray-500">{project.category}</p>
                        </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Completed: {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Timeline: {project.timeline || "Not specified"}
                          </span>
                          <span>{project.completedMilestones || 0} milestones completed</span>
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
                          <AvatarImage src={project.customer?.customerProfile?.logoUrl || "/placeholder.svg"} />
                          <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{project.customer?.name || "Unknown Client"}</p>
                          <p className="text-sm text-gray-500">{project.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                        </p>
                        <p className="text-sm text-gray-500">Created: {formatDate(project.createdAt)}</p>
                      </div>
                    </div>

                    {project.status === "IN_PROGRESS" && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress: {project.progress || 0}%</span>
                          <span>
                            {project.completedMilestones || 0}/{project.totalMilestones || 0} milestones
                          </span>
                        </div>
                        <Progress value={project.progress || 0} className="h-2" />
                        {project.milestones && project.milestones.length > 0 && (
                          <p className="text-sm text-blue-600 mt-2">
                            Next: {project.milestones.find((m: any) => m.status === "PENDING")?.title || "No pending milestones"}
                          </p>
                        )}
                      </div>
                    )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Started: {formatDate(project.createdAt)}</span>
                          <span>Timeline: {project.timeline || "Not specified"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Link href={`/provider/projects/${project.id}`}>
                            <Button size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid gap-6">
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "You don't have any projects yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map((project) => (
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
                            <AvatarImage src={project.customer?.customerProfile?.logoUrl || "/placeholder.svg"} />
                            <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{project.customer?.name || "Unknown Client"}</p>
                            <p className="text-sm text-gray-500">{project.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>

                      {project.status === "IN_PROGRESS" && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress: {project.progress || 0}%</span>
                            <span>
                              {project.completedMilestones || 0}/{project.totalMilestones || 0} milestones
                            </span>
                          </div>
                          <Progress value={project.progress || 0} className="h-2" />
                          {project.milestones && project.milestones.length > 0 && (
                            <p className="text-sm text-blue-600 mt-2">
                              Next: {project.milestones.find((m: any) => m.status === "PENDING")?.title || "No pending milestones"}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Started: {formatDate(project.createdAt)}</span>
                          <span>Timeline: {project.timeline || "Not specified"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Link href={`/provider/projects/${project.id}`}>
                            <Button size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </ProviderLayout>
  )
}
