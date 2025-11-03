"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Eye,
  MessageSquare,
  Calendar,
  Edit,
  Trash2,
  Archive,
  Star,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer-layout";
import { useRouter } from "next/navigation";
import { getCompanyProjects, updateCompanyProject } from "@/lib/api";

export default function CustomerProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCompanyProjects({
          page: 1,
          limit: 100, // Get all projects for now
        });

        if (response.success) {
          setProjects(response.items || []);
        } else {
          setError("Failed to fetch projects");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string, type: string) => {
    // ServiceRequest statuses
    if (type === "ServiceRequest") {
      switch (status) {
        case "OPEN":
          return "bg-blue-100 text-blue-800";
        case "CLOSED":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }

    // Project statuses
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "DISPUTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string, type: string) => {
    // ServiceRequest statuses
    if (type === "ServiceRequest") {
      switch (status) {
        case "OPEN":
          return "Open";
        case "CLOSED":
          return "Closed";
        default:
          return status;
      }
    }

    // Project statuses
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "IN_PROGRESS":
        return "In Progress";
      case "DISPUTED":
        return "Disputed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    switch (normalizedPriority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.provider?.name &&
        project.provider.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Map status filter to actual statuses
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        matchesStatus = project.status === "OPEN";
      } else if (statusFilter === "in_progress") {
        matchesStatus = project.status === "IN_PROGRESS";
      } else if (statusFilter === "completed") {
        matchesStatus = project.status === "COMPLETED";
      } else if (statusFilter === "cancelled") {
        matchesStatus = project.status === "CANCELLED";
      } else {
        matchesStatus = project.status === statusFilter;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "budget-high":
        return b.budgetMax - a.budgetMax;
      case "budget-low":
        return a.budgetMin - b.budgetMin;
      case "deadline":
        // For projects with timeline, sort by timeline length
        if (a.timeline && b.timeline) {
          return a.timeline.localeCompare(b.timeline);
        }
        return 0;
      case "progress":
        // For projects, use the progress field (already calculated by backend)
        const aProgress = a.type === "Project" ? a.progress || 0 : 0;
        const bProgress = b.type === "Project" ? b.progress || 0 : 0;
        return bProgress - aProgress;
      default:
        return 0;
    }
  });

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    try {
      // Prepare a minimal, safe payload: only send fields the user just edited.
      const payload: any = {
        title: editingProject.title,
        description: editingProject.description,
        category: editingProject.category,
        priority:
          editingProject.priority?.toLowerCase?.() || editingProject.priority,
      };

      // If you show separate min/max in your dialog later, include them here:
      if (
        Number.isFinite(editingProject.budgetMin) &&
        Number.isFinite(editingProject.budgetMax)
      ) {
        payload.budgetMin = Number(editingProject.budgetMin);
        payload.budgetMax = Number(editingProject.budgetMax);
      }

      if (editingProject.timeline) payload.timeline = editingProject.timeline;

      // If you add Requirements/Deliverables fields in the dialog later, send arrays:
      // payload.requirements = toLines(editingRequirementsText);
      // payload.deliverables = toLines(editingDeliverablesText);

      const { project: updated } = await updateCompanyProject(
        editingProject.id,
        payload
      );

      // Update local list
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...updated } : p))
      );

      toast({
        title: "Project Updated",
        description: "Changes saved successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        description:
          err instanceof Error ? err.message : "Could not update project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = (projectId: number) => {
    toast({
      title: "Project Deleted",
      description: "Project has been deleted successfully",
    });
  };

  const handleArchiveProject = (projectId: number) => {
    toast({
      title: "Project Archived",
      description: "Project has been archived successfully",
    });
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    pending: projects.filter((p) => p.status === "OPEN").length,
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading projects...</span>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error loading projects
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">
              Manage and track all your ICT projects
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/customer/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.active}
                  </p>
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
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
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
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
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
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="budget-high">
                    Budget: High to Low
                  </SelectItem>
                  <SelectItem value="budget-low">
                    Budget: Low to High
                  </SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end mt-4">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Tabs
          value={viewMode}
          onValueChange={setViewMode}
          className="space-y-6"
        >
          <TabsContent value="grid">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {project.description}
                          </CardDescription>
                        </div>
                      </div>
                      ...
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={project.provider?.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {project.provider?.name
                            ? project.provider.name.charAt(0)
                            : project.type.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {project.provider?.name || "No Provider Assigned"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.category}
                        </p>
                      </div>
                    </div>

                    {project.type === "Project" &&
                      project.status === "IN_PROGRESS" && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress: {project.progress || 0}%</span>
                            <span>
                              {project.completedMilestones || 0}/
                              {project.totalMilestones || 0} milestones
                            </span>
                          </div>
                          <Progress
                            value={project.progress || 0}
                            className="h-2"
                          />
                        </div>
                      )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Budget</p>
                        <p className="font-semibold">
                          RM{project.budgetMin.toLocaleString()} - RM
                          {project.budgetMax.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Timeline</p>
                        <p className="font-semibold">
                          {project.timeline || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created:{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      {project.type === "Project" && (
                        <span>
                          {project.completedMilestones || 0}/
                          {project.totalMilestones || 0} milestones
                        </span>
                      )}
                    </div>

                    {project.type === "Project" &&
                      project.status === "COMPLETED" && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Status:</span>
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                      )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          router.push(`/customer/projects/${project.id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/customer/messages?project=${project.id}`
                          )
                        }
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {sortedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <Avatar>
                            <AvatarImage
                              src={
                                project.provider?.avatar || "/placeholder.svg"
                              }
                            />
                            <AvatarFallback>
                              {project.provider?.name
                                ? project.provider.name.charAt(0)
                                : project.type.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {project.title}
                              </h3>
                              <Badge
                                className={getStatusColor(
                                  project.status,
                                  project.type
                                )}
                              >
                                {getStatusText(project.status, project.type)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {project.type}
                              </Badge>
                              <Badge
                                className={getPriorityColor(project.priority)}
                                variant="outline"
                              >
                                {project.priority}
                              </Badge>
                              {(project.priority === "High" ||
                                project.priority === "high") && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {project.provider?.name || "No Provider"}
                              </span>
                              <span>•</span>
                              <span>{project.category}</span>
                              <span>•</span>
                              <span>
                                Created:{" "}
                                {new Date(
                                  project.createdAt
                                ).toLocaleDateString()}
                              </span>
                              {project.timeline && (
                                <>
                                  <span>•</span>
                                  <span>Timeline: {project.timeline}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-semibold">
                              RM{project.budgetMin.toLocaleString()} - RM
                              {project.budgetMax.toLocaleString()}
                            </p>
                          </div>
                          {project.type === "Project" &&
                            project.status === "IN_PROGRESS" && (
                              <div className="w-24">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>
                                    Progress: {project.progress || 0}%
                                  </span>
                                  <span>
                                    {project.completedMilestones || 0}/
                                    {project.totalMilestones || 0}
                                  </span>
                                </div>
                                <Progress
                                  value={project.progress || 0}
                                  className="h-2"
                                />
                              </div>
                            )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/customer/projects/${project.id}`)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/customer/messages?project=${project.id}`
                                )
                              }
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProject(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update your project details</DialogDescription>
            </DialogHeader>
            {editingProject && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Project Title</Label>
                  <Input
                    id="edit-title"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-budget">Budget (RM)</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      value={editingProject.budget}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          budget: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-deadline">Deadline</Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={editingProject.deadline}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          deadline: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingProject.priority}
                      onValueChange={(value) =>
                        setEditingProject({
                          ...editingProject,
                          priority: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editingProject.category}
                      onValueChange={(value) =>
                        setEditingProject({
                          ...editingProject,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEB_DEVELOPMENT">
                          Web Development
                        </SelectItem>
                        <SelectItem value="MOBILE_APP_DEVELOPMENT">
                          Mobile Development
                        </SelectItem>
                        <SelectItem value="DATA_ANALYTICS">
                          Data Analytics
                        </SelectItem>
                        <SelectItem value="CLOUD_SERVICES">
                          Cloud Services
                        </SelectItem>
                        <SelectItem value="UI_UX_DESIGN">
                          UI/UX Design
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-urgent"
                    checked={editingProject.isUrgent}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        isUrgent: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="edit-urgent">Mark as urgent</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProject} className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {sortedProjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't created any projects yet."}
              </p>

              {!searchQuery && statusFilter === "all" && (
                <Link href="/customer/projects/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}
