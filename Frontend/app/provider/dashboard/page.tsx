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
import {
  DollarSign,
  Star,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Eye,
  ThumbsUp,
  Calendar,
  Award,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ProviderLayout } from "@/components/provider-layout";
import { getProviderProjectStats, getProviderProjects, getProviderOpportunities, getProviderPerformanceMetrics } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types for fetched opportunities
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  aiStackSuggest: string[];
  status: string;
  createdAt: string;
  customer?: Customer;
}

export default function ProviderDashboard() {
  const { toast } = useToast();
  
  // Stats state
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalEarnings: 0,
    rating: "0",
    responseRate: 0,
    profileViews: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Performance state
  const [performance, setPerformance] = useState({
    totalProjects: 0,
    completionRate: 0,
    onTimeDelivery: 0,
    repeatClients: 0,
    responseRate: "0%",
  });
  const [performanceLoading, setPerformanceLoading] = useState(true);

  // Active projects state
  const [activeProjects, setActiveProjects] = useState([]);
  const [activeProjectsLoading, setActiveProjectsLoading] = useState(true);

  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>(
    []
  );
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [errorOpportunities, setErrorOpportunities] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch provider project stats
        const statsResponse = await getProviderProjectStats();
        if (statsResponse.success) {
          setStats({
            activeProjects: statsResponse.stats.activeProjects || 0,
            completedProjects: statsResponse.stats.completedProjects || 0,
            totalEarnings: statsResponse.stats.totalEarnings || 0,
            rating: statsResponse.stats.averageRating?.toString() || "0",
            responseRate: 85, // Default value since not available in API
            profileViews: 0, // Default value since not available in API
          });
        }

        // Fetch active projects
        const projectsResponse = await getProviderProjects({
          page: 1,
          limit: 5,
          status: "IN_PROGRESS"
        });
        if (projectsResponse.success) {
          setActiveProjects(projectsResponse.projects || []);
        }

        // Fetch recent opportunities
        const opportunitiesResponse = await getProviderOpportunities({
          page: 1,
          limit: 3
        });
        if (opportunitiesResponse.success) {
          // Map opportunities to the expected format
          const mappedOpportunities = (opportunitiesResponse.opportunities || []).map((opp: any) => ({
            id: opp.id,
            customerId: opp.customer?.id || "",
            title: opp.title,
            description: opp.description,
            category: opp.category,
            budgetMin: opp.budgetMin,
            budgetMax: opp.budgetMax,
            aiStackSuggest: opp.skills || [],
            status: opp.status,
            createdAt: opp.createdAt,
            customer: opp.customer
          }));
          setRecentOpportunities(mappedOpportunities);
        }

        // Fetch performance metrics
        const performanceResponse = await getProviderPerformanceMetrics();
        if (performanceResponse.success) {
          setPerformance({
            totalProjects: statsResponse.stats?.totalProjects || 0,
            completionRate: performanceResponse.metrics?.completionRate || 0,
            onTimeDelivery: performanceResponse.metrics?.onTimeDelivery || 0,
            repeatClients: performanceResponse.metrics?.repeatClients || 0,
            responseRate: "85%", // Default value (not calculated yet)
          });
        } else {
          // Fallback to defaults if API fails
          setPerformance({
            totalProjects: statsResponse.stats?.totalProjects || 0,
            completionRate: 0,
            onTimeDelivery: 0,
            repeatClients: 0,
            responseRate: "85%",
          });
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setStatsLoading(false);
        setPerformanceLoading(false);
        setActiveProjectsLoading(false);
        setLoadingOpportunities(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const recentMessages = [
    {
      id: 1,
      client: "Ahmad Rahman",
      project: "E-commerce Platform",
      message:
        "Great progress on the dashboard! Can we schedule a review call?",
      time: "10 minutes ago",
      unread: true,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      client: "Sarah Tech Solutions",
      project: "Mobile App Design",
      message:
        "The wireframes look perfect. Please proceed with the next phase.",
      time: "2 hours ago",
      unread: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    return "text-yellow-600 bg-yellow-100";
  };

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/provider/profile">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
            <Link href="/provider/opportunities">
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Browse Jobs
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
                  <p className="text-sm font-medium text-gray-600">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.activeProjects
                    )}
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                    ) : (
                      `RM${stats.totalEarnings.toLocaleString()}`
                    )}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                      ) : (
                        stats.rating
                      )}
                    </p>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Profile Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.profileViews
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Projects</CardTitle>
                  <Link href="/provider/projects">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProjectsLoading ? (
                    // Loading skeletons
                    Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-2" />
                          <div className="h-2 bg-gray-200 rounded w-24 animate-pulse" />
                        </div>
                      </div>
                    ))
                  ) : activeProjects.length > 0 ? (
                    activeProjects.map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/provider/projects/${project.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={
                                  (project.customer?.customerProfile?.profileImageUrl && 
                                   project.customer.customerProfile.profileImageUrl !== "/placeholder.svg")
                                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${project.customer.customerProfile.profileImageUrl.startsWith("/") ? "" : "/"}${project.customer.customerProfile.profileImageUrl}`
                                    : (project.customer?.customerProfile?.logoUrl && 
                                        project.customer.customerProfile.logoUrl !== "/placeholder.svg")
                                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${project.customer.customerProfile.logoUrl.startsWith("/") ? "" : "/"}${project.customer.customerProfile.logoUrl}`
                                      : "/placeholder.svg"
                                }
                              />
                              <AvatarFallback>
                                {project.customer?.name?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {project.title}
                              </h4>
                              <Link 
                                href={`/provider/companies/${project.customer?.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {project.customer?.name || "Unknown Client"}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-blue-100 text-blue-800">
                                  In Progress
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Timeline: {project.timeline || "Not specified"}
                                </span>
                              </div>
                              {project.nextMilestone && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Next: {project.nextMilestone.title}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {project.approvedPrice 
                                ? `RM${project.approvedPrice.toLocaleString()}`
                                : `RM${project.budgetMin?.toLocaleString() || "0"} - RM${project.budgetMax?.toLocaleString() || "0"}`
                              }
                            </p>
                            <div className="mt-2 w-24">
                              <Progress
                                value={project.progress || 0}
                                className="h-2"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {project.progress || 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No active projects found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Opportunities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recommended Opportunities</CardTitle>
                  <Link href="/provider/opportunities">
                    <Button variant="outline" size="sm">
                      Browse All
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  AI-matched projects based on your skills and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingOpportunities ? (
                    <div className="text-center py-6 text-gray-500">
                      Loading opportunities...
                    </div>
                  ) : errorOpportunities ? (
                    <div className="text-center py-6 text-red-500">
                      {errorOpportunities}
                    </div>
                  ) : recentOpportunities.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No opportunities found.
                    </div>
                  ) : (
                    recentOpportunities.map((opportunity: Opportunity) => (
                      <div
                        key={opportunity.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {opportunity.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              RM {opportunity.budgetMin} - RM{" "}
                              {opportunity.budgetMax}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(opportunity.aiStackSuggest || []).map((skill: string) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{opportunity.status}</span>
                            <span>
                              {new Date(
                                opportunity.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <Link href={`/provider/opportunities`}>
                            <Button size="sm">
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Projects</span>
                  <span className="font-semibold">
                    {performanceLoading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                    ) : (
                      performance.totalProjects
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold">
                    {performanceLoading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                    ) : (
                      `${performance.completionRate}%`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Repeat Clients</span>
                  <span className="font-semibold">
                    {performanceLoading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                    ) : (
                      `${performance.repeatClients}%`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    On-time Delivery
                  </span>
                  <span className="font-semibold">
                    {performanceLoading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                    ) : (
                      `${performance.onTimeDelivery}%`
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            {/* <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Messages</CardTitle>
                  <Link href="/provider/messages">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={message.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {message.client.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.client}
                          </p>
                          {message.unread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {message.project}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {message.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/provider/profile/edit">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                <Link href="/provider/portfolio">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Manage Portfolio
                  </Button>
                </Link>
                <Link href="/provider/availability">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Availability
                  </Button>
                </Link>
                <Link href="/provider/earnings">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Earnings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
