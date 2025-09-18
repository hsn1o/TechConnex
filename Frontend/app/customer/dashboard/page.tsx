"use client";

import { useEffect, useState } from "react";
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
import {
  Plus,
  CheckCircle,
  DollarSign,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Star,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer-layout";

// Define Project type outside the component so it can be used in useState
export type Project = {
  id: string;
  title: string;
  provider?: string;
  providerName?: string;
  status: string;
  progress?: number;
  budget?: number;
  deadline?: string;
  avatar?: string;
  createdAt?: string;
  [key: string]: any; // for any extra fields
};

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    rating: null,
  });
  // Use Project[] as the type for recentProjects
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [recommendedProviders, setRecommendedProviders] = useState<any[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    const customerId = user?.id; // fallback to example id
    // Fetch stats
    fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/"
      }/projects/customers/${customerId}/stats`
    )
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() =>
        setStats({
          activeProjects: 0,
          completedProjects: 0,
          totalSpent: 0,
          rating: null,
        })
      );
    // Fetch recent projects
    fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"
      }/projects/${customerId}`
    )
      .then((res) => res.json())
      .then((data) => {
        // Handle the new response structure with projects array
        let projects = data.projects || [];
        if (projects.length && projects[0].createdAt) {
          projects = projects.sort((a: any, b: any) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
          });
        }
        // Map the projects to match the expected structure
        const mappedProjects = projects.map((project: any) => ({
          id: project.id,
          title: project.title,
          provider: project.provider?.name,
          providerName: project.provider?.name,
          status: project.status?.toLowerCase() || "pending",
          progress: 0, // Default progress since it's not in the API response
          budget: project.budgetMax,
          deadline: project.timeline,
          avatar: "/placeholder.svg?height=40&width=40",
          createdAt: project.createdAt,
          category: project.category,
          description: project.description,
        }));
        setRecentProjects(mappedProjects.slice(0, 3));
      })
      .catch(() => setRecentProjects([]))
      .finally(() => setProjectsLoading(false));

    // Fetch recommended providers (random selection)
    fetch("http://localhost:4000/api/providers")
      .then((res) => res.json())
      .then((data) => {
        // Shuffle and pick 2 random providers
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2).map((p: any) => ({
          id: p.id,
          name: p.name,
          specialty: p.providerProfile?.skills?.[0] || "Specialty",
          rating: parseFloat(p.providerProfile?.rating || "0"),
          completedJobs: p.providerProfile?.totalProjects || 0,
          hourlyRate: p.providerProfile?.hourlyRate || 0,
          location: p.providerProfile?.location || "Unknown",
          avatar: "/placeholder.svg?height=60&width=60",
          skills: p.providerProfile?.skills || [],
        }));
        setRecommendedProviders(selected);
        setRecommendedLoading(false);
      })
      .catch(() => {
        setRecommendedProviders([]);
        setRecommendedLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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
      default:
        return status;
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
          <Link href="/customer/projects/new">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeProjects}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedProjects}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    RM{stats.totalSpent?.toLocaleString?.() ?? 0}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Avg Rating
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.rating !== null ? stats.rating : "-"}
                    </p>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Link href="/customer/projects">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectsLoading ? (
                    <div className="text-center text-gray-500 py-8">
                      Loading projects...
                    </div>
                  ) : recentProjects.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No recent projects found.
                    </div>
                  ) : (
                    recentProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={project.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {project.provider?.charAt(0) ||
                                project.title?.charAt(0) ||
                                "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {project.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {project.provider || project.providerName || "-"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(project.status)}>
                                {getStatusText(project.status)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Due:{" "}
                                {project.deadline
                                  ? new Date(
                                      project.deadline
                                    ).toLocaleDateString()
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            RM{project.budget?.toLocaleString?.() ?? "-"}
                          </p>
                          {project.status === "in_progress" && (
                            <div className="mt-2 w-24">
                              <Progress
                                value={project.progress}
                                className="h-2"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {project.progress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Providers */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Providers</CardTitle>
                <CardDescription>
                  Top-rated ICT professionals for your next project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedLoading ? (
                    <div className="text-center text-gray-500 py-8">
                      Loading providers...
                    </div>
                  ) : recommendedProviders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No recommended providers found.
                    </div>
                  ) : (
                    recommendedProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={provider.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {provider.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {provider.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {provider.specialty}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">
                                {provider.rating}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({provider.completedJobs} jobs)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {provider.location}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {provider.skills
                                .slice(0, 2)
                                .map((skill: string) => (
                                  <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              {provider.skills.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{provider.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-blue-600 mt-2">
                              RM{provider.hourlyRate}/hour
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/customer/providers">
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                  >
                    Browse All Providers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
