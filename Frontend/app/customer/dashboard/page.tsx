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
import {
  getCompanyProjects,
  getProjectRequestStats,
  getCompanyProjectStats,
  searchProviders,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
  const { toast } = useToast();
  const router = useRouter();
  const handleContact = (provider: any) => {
    router.push(
      `/customer/messages?userId=${provider.id}&name=${encodeURIComponent(
        provider.name
      )}&avatar=${encodeURIComponent(provider.avatar || "")}`
    );
  };
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    rating: 0,
  });
  // Use Project[] as the type for recentProjects
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [recommendedProviders, setRecommendedProviders] = useState<any[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);

        // Fetch project stats (inspired by provider dashboard)
        const statsResponse = await getCompanyProjectStats();
        if (statsResponse.success && statsResponse.stats) {
          setStats({
            activeProjects: statsResponse.stats.activeProjects || 0,
            completedProjects: statsResponse.stats.completedProjects || 0,
            totalSpent: statsResponse.stats.totalSpent || 0,
            rating: statsResponse.stats.averageRating || 0, // Average rating from reviews received
          });
        } else {
          // Set default stats if API call fails or returns no data
          setStats({
            activeProjects: 0,
            completedProjects: 0,
            totalSpent: 0,
            rating: 0,
          });
        }

        // Fetch recent projects
        const projectsResponse = await getCompanyProjects({
          page: 1,
          limit: 3,
        });
        if (projectsResponse.success && projectsResponse.items) {
          // Map projects to expected structure
          const mappedProjects = projectsResponse.items.map((project: any) => ({
            id: project.id,
            title: project.title,
            provider: project.provider?.name,
            providerName: project.provider?.name,
            status: project.status?.toLowerCase() || "pending",
            progress: project.progress || 0,
            budget: project.budgetMax,
            deadline: project.timeline,
            avatar: project.provider?.providerProfile?.profileImageUrl
              ? `${
                  process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "http://localhost:4000"
                }${
                  project.provider.providerProfile.profileImageUrl.startsWith(
                    "/"
                  )
                    ? ""
                    : "/"
                }${project.provider.providerProfile.profileImageUrl}`
              : "/placeholder.svg?height=40&width=40",
            createdAt: project.createdAt,
            category: project.category,
            description: project.description,
            type: project.type, // ServiceRequest or Project
          }));
          setRecentProjects(mappedProjects);
        } else {
          // Set empty projects if API call fails or returns no data
          setRecentProjects([]);
        }

        // Fetch recommended providers (top-rated providers) - make this optional
        try {
          const providersResponse = await searchProviders({
            limit: 2,
          });
          if (providersResponse.success && providersResponse.providers) {
            // Map providers to expected structure
            const mappedProviders = providersResponse.providers.map(
              (provider: any) => ({
                id: provider.id,
                name: provider.name,
                specialty:
                  provider.specialties?.[0] ||
                  provider.skills?.[0] ||
                  "ICT Professional",
                rating: provider.rating || 0,
                completedJobs: provider.completedJobs || 0,
                hourlyRate: provider.hourlyRate || 0,
                location: provider.location || "Malaysia",
                avatar:
                  provider.avatar && provider.avatar !== "/placeholder.svg"
                    ? `${
                        process.env.NEXT_PUBLIC_API_BASE_URL ||
                        "http://localhost:4000"
                      }${provider.avatar.startsWith("/") ? "" : "/"}${
                        provider.avatar
                      }`
                    : "/placeholder.svg?height=60&width=60",
                skills: provider.skills || [],
                verified: provider.verified || false,
                topRated: provider.topRated || false,
              })
            );
            setRecommendedProviders(mappedProviders);
          } else {
            // Set empty providers if API call fails or returns no data
            setRecommendedProviders([]);
          }
        } catch (providerError) {
          console.warn("Failed to fetch recommended providers:", providerError);
          // Set empty providers if API call fails - don't break the dashboard
          setRecommendedProviders([]);
        }
        setRecommendedLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data"
        );
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const getStatusColor = (status: string, type?: string) => {
    // Handle ServiceRequest statuses
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

    // Handle Project statuses
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

  const getStatusText = (status: string, type?: string) => {
    // Handle ServiceRequest statuses
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

    // Handle Project statuses
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
                      {stats.rating ? stats.rating.toFixed(1) : "0.0"}
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
                  ) : error ? (
                    <div className="text-center text-red-500 py-8">{error}</div>
                  ) : recentProjects.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No recent projects found.
                    </div>
                  ) : (
                    recentProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/customer/projects/${project.id}`}
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
                                {project.provider ||
                                  project.providerName ||
                                  "-"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={getStatusColor(
                                    project.status,
                                    project.type
                                  )}
                                >
                                  {getStatusText(project.status, project.type)}
                                </Badge>
                                {project.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {project.type}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  Timeline:{" "}
                                  {project.deadline || "Not specified"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {project.budget
                                ? formatCurrency(project.budget)
                                : "-"}
                            </p>
                            {project.status === "IN_PROGRESS" && (
                              <div className="mt-2 w-24">
                                <Progress
                                  value={project.progress || 0}
                                  className="h-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {project.progress || 0}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
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
                      <Link
                        key={provider.id}
                        href={`/customer/providers/${provider.id}`}
                      >
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{provider.skills.length - 2}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-blue-600 mt-2">
                                RM{provider.hourlyRate}/hour
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.preventDefault(); // prevents Link from triggering navigation
                              handleContact(provider);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                      </Link>
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
