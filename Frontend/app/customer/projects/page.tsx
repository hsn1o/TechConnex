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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer-layout";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  provider: string | null;
  status: "pending" | "in_progress" | "completed" | "on_hold";
  progress: number;
  budget: number;
  spent: number;
  deadline: string;
  startDate: string;
  avatar: string;
  category: string;
  milestones: number;
  completedMilestones: number;
  proposals?: any[]; // Added for pending projects
  timeline?: string; // Added for pending projects
  priority?: string; // Added for pending projects
  ndaSigned?: boolean; // Added for pending projects
  aiStackSuggest?: string[]; // Added for pending projects
}

export default function CustomerProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      // Get user id from localStorage
      const user =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user") || "null")
          : null;
      const userId = user?.id;
      if (!userId) {
        setError("User not found.");
        setLoading(false);
        return;
      }

      try {
        // Fetch both endpoints in parallel
        const [pendingRes, inProgressRes] = await Promise.all([
          fetch(`http://localhost:4000/api/service-requests/${userId}`),
          fetch(`http://localhost:4000/api/projects/${userId}`),
        ]);
        const pendingData = await pendingRes.json();
        const inProgressData = await inProgressRes.json();

        // Map pending projects
        const pendingProjects: Project[] = (
          pendingData.serviceRequests || []
        ).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          provider: null,
          status: "pending",
          progress: 0,
          budget: item.budgetMax,
          spent: 0,
          deadline: item.timeline || "",
          startDate: item.createdAt,
          avatar: "/placeholder.svg?height=40&width=40",
          category: item.category
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          milestones: 0,
          completedMilestones: 0,
          proposals: item.proposals || [],
          timeline: item.timeline,
          priority: item.priority,
          ndaSigned: item.ndaSigned,
          aiStackSuggest: item.aiStackSuggest,
        }));

        // Map in progress projects
        const inProgressProjects: Project[] = (
          inProgressData.projects || []
        ).map((item: any) => ({
          id: item.id,
          title: item.title || "Untitled",
          description: item.description || "",
          provider: item.provider?.name || "Unknown Provider",
          status: "in_progress",
          progress: item.progress || 0,
          budget: item.budgetMax || 0,
          spent: item.spent || 0,
          deadline: item.timeline || "",
          startDate: item.createdAt,
          avatar: "/placeholder.svg?height=40&width=40",
          category:
            item.category
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "",
          milestones: item.milestones?.length || 0,
          completedMilestones:
            item.milestones?.filter((m: any) => m.status === "COMPLETED")
              .length || 0,
        }));

        setProjects([...pendingProjects, ...inProgressProjects]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "on_hold":
        return "On Hold";
      default:
        return status;
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">{error}</div>
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
          <Link href="/customer/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
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
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Tabs */}
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {project.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.status === "pending" ? (
                      <>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {project.aiStackSuggest?.map((tech) => (
                            <Badge
                              key={tech}
                              className="bg-blue-100 text-blue-800"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Budget</p>
                            <p className="font-semibold">
                              RM{project.budget.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Timeline</p>
                            <p className="font-semibold">
                              {project.timeline || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Proposals</p>
                            <p className="font-semibold">
                              {project.proposals?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Priority</p>
                            <p className="font-semibold capitalize">
                              {project.priority || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {project.ndaSigned && (
                            <Badge className="bg-green-100 text-green-800">
                              NDA Required
                            </Badge>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={project.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {project.provider?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {project.provider || "Unknown Provider"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {project.category}
                            </p>
                          </div>
                        </div>
                        {project.status === "in_progress" && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <Progress
                              value={project.progress}
                              className="h-2"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Budget</p>
                            <p className="font-semibold">
                              RM{project.budget.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Spent</p>
                            <p className="font-semibold">
                              RM{project.spent.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due:{" "}
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                          <span>
                            {project.completedMilestones}/{project.milestones}{" "}
                            milestones
                          </span>
                        </div>
                      </>
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
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
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
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <Avatar>
                            <AvatarImage
                              src={project.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {project.provider?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {project.title}
                              </h3>
                              <Badge className={getStatusColor(project.status)}>
                                {getStatusText(project.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {project.provider || "Unknown Provider"}
                              </span>
                              <span>•</span>
                              <span>{project.category}</span>
                              <span>•</span>
                              <span>
                                Due:{" "}
                                {new Date(
                                  project.deadline
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-semibold">
                              RM{project.budget.toLocaleString()}
                            </p>
                          </div>
                          {project.status === "in_progress" && (
                            <div className="w-24">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <Progress
                                value={project.progress}
                                className="h-2"
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4" />
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
      </div>
    </CustomerLayout>
  );
}
