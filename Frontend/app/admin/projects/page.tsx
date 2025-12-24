"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  MoreHorizontal,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"
import { getAdminProjects, getAdminProjectStats } from "@/lib/api"
import Link from "next/link"

export default function AdminProjectsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([])
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAdminProjects({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      })
      if (response.success) {
        setProjects((response.data || []) as Array<Record<string, unknown>>)
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, toast])

  const loadStats = async () => {
    try {
      const response = await getAdminProjectStats()
      if (response.success) {
        setStats(response.data as Record<string, unknown>)
      }
    } catch (error: unknown) {
      console.error("Failed to load stats:", error)
    }
  }

  useEffect(() => {
    loadProjects()
    loadStats()
  }, [loadProjects])


  const getStatusText = (status: string, type?: string) => {
    // ServiceRequests are always "OPEN" (unmatched opportunities)
    if (type === "serviceRequest") {
      return "Open Opportunity"
    }
    
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "Completed"
      case "IN_PROGRESS":
        return "In Progress"
      case "DISPUTED":
        return "Disputed"
      case "OPEN":
        return "Open Opportunity"
      default:
        return status?.replace("_", " ") || status
    }
  }

  const getStatusColor = (status: string, type?: string) => {
    // ServiceRequests (unmatched opportunities)
    if (type === "serviceRequest") {
      return "bg-yellow-100 text-yellow-800"
    }
    
    switch (status?.toUpperCase()) {
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

  const calculateProgress = (project: Record<string, unknown>) => {
    // ServiceRequests don't have progress yet
    if (project.type === "serviceRequest") return 0
    
    const milestones = Array.isArray(project.milestones) ? project.milestones : []
    if (milestones.length === 0) return 0
    const completed = milestones.filter(
      (m: Record<string, unknown>) => m.status === "APPROVED" || m.status === "PAID"
    ).length
    return Math.round((completed / milestones.length) * 100)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) && project.type !== "serviceRequest")
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "OPEN" && project.type === "serviceRequest") ||
      (statusFilter !== "OPEN" && project.status === statusFilter && project.type === "project")
    const matchesCategory =
      categoryFilter === "all" || project.category?.toLowerCase().includes(categoryFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Monitor and manage all platform projects</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProjects || 0}</p>
                    {stats.openOpportunities > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.openOpportunities} open opportunities
                      </p>
                    )}
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
                    <p className="text-2xl font-bold text-blue-600">{stats.activeProjects || 0}</p>
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
                    <p className="text-2xl font-bold text-green-600">{stats.completedProjects || 0}</p>
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
                    <p className="text-2xl font-bold text-red-600">{stats.disputedProjects || 0}</p>
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
                    <p className="text-2xl font-bold text-purple-600">
                      RM{((stats.totalValue || 0) / 1000).toFixed(0)}K
                    </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadProjects()
                      }
                    }}
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
                  <SelectItem value="OPEN">Open Opportunities</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DISPUTED">Disputed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadProjects}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
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
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => {
                      const isServiceRequest = project.type === "serviceRequest"
                      const progress = calculateProgress(project)
                      const disputesCount = project.Dispute?.length || 0
                      const milestonesArray = Array.isArray(project.milestones) ? project.milestones : []
                      const completedMilestones =
                        milestonesArray.filter((m: Record<string, unknown>) => m.status === "APPROVED" || m.status === "PAID")
                          .length || 0
                      const totalMilestones = milestonesArray.length || 0
                      const proposalsCount = project.proposalsCount || project.proposals?.length || 0

                      return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{project.title}</p>
                          {isServiceRequest && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Opportunity
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{project.category}</p>
                              {disputesCount > 0 && !isServiceRequest && (
                          <Badge className="bg-red-100 text-red-800 mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                                  {disputesCount} dispute(s)
                          </Badge>
                        )}
                        {isServiceRequest && proposalsCount > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 mt-1">
                            {proposalsCount} {proposalsCount === 1 ? "proposal" : "proposals"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                                  <AvatarFallback>
                                    {project.customer?.name?.charAt(0) || "C"}
                                  </AvatarFallback>
                          </Avatar>
                                <span className="text-sm">{project.customer?.name || "N/A"}</span>
                        </div>
                        {!isServiceRequest && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                                    <AvatarFallback>
                                      {project.provider?.name?.charAt(0) || "P"}
                                    </AvatarFallback>
                            </Avatar>
                                  <span className="text-sm">{project.provider?.name || "N/A"}</span>
                          </div>
                        )}
                        {isServiceRequest && (
                          <div className="text-xs text-gray-500 italic">
                            Awaiting provider match
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                            <Badge className={getStatusColor(project.status, project.type)}>
                              {getStatusText(project.status, project.type)}
                            </Badge>
                    </TableCell>
                    <TableCell>
                      {isServiceRequest ? (
                        <div className="text-sm text-gray-500">
                          N/A
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                                  <span>{progress}%</span>
                            <span>
                                    {completedMilestones}/{totalMilestones}
                            </span>
                          </div>
                                <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                              <p className="font-medium">
                                RM{project.budgetMin?.toLocaleString() || 0} - RM
                                {project.budgetMax?.toLocaleString() || 0}
                              </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                              <p className="text-sm">
                                {project.timeline || "—"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </p>
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
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/projects/${project.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                                  </Link>
                          </DropdownMenuItem>
                                {disputesCount > 0 && !isServiceRequest && (
                                  <>
                          <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/disputes`}>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                                        View Disputes ({disputesCount})
                                      </Link>
                            </DropdownMenuItem>
                                  </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                      )
                    })
                  )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

