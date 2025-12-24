"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Star,
  FileText,
  PieChart,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import {
  getAdminReports,
  exportAdminReport,
  getAdminCategoryDetails,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("last_30_days");
  const [reportType, setReportType] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Data state
  const [overviewStats, setOverviewStats] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalUsers: 0,
    userGrowth: 0,
    totalProjects: 0,
    projectGrowth: 0,
    avgRating: 0,
    ratingChange: 0,
  });
  const [monthlyData, setMonthlyData] = useState<Array<Record<string, unknown>>>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<Record<string, unknown>>>([]);
  const [topProviders, setTopProviders] = useState<Array<Record<string, unknown>>>([]);
  const [topCustomers, setTopCustomers] = useState<Array<Record<string, unknown>>>([]);

  // Category detail modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, unknown> | null>(null);
  const [loadingCategoryDetails, setLoadingCategoryDetails] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        dateRange: dateRange === "custom" ? undefined : dateRange,
      };

      if (dateRange === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const response = await getAdminReports(params);

      if (response.success && response.data) {
        setOverviewStats((prev) => response.data.overviewStats || prev);
        setMonthlyData(response.data.monthlyData || []);
        setCategoryBreakdown(response.data.categoryBreakdown || []);

        // Ensure providers have IDs and validate data structure
        const providers = (response.data.topProviders || [])
          .filter((provider: Record<string, unknown>) => provider && provider.id) // Only include providers with valid IDs
          .map((provider: Record<string, unknown>) => ({
            id: provider.id,
            name: provider.name || "Unknown Provider",
            projects: provider.projects || 0,
            revenue: provider.revenue || 0,
            rating: provider.rating || 0,
          }));
        setTopProviders(providers);

        // Ensure customers have IDs and validate data structure
        const customers = (response.data.topCustomers || [])
          .filter((customer: Record<string, unknown>) => customer && customer.id) // Only include customers with valid IDs
          .map((customer: Record<string, unknown>) => ({
            id: customer.id,
            name: customer.name || "Unknown Customer",
            projects: customer.projects || 0,
            spent: customer.spent || 0,
          }));
        setTopCustomers(customers);
      } else {
        console.error("Reports API response error:", response);
        toast({
          title: "Warning",
          description: "Reports data may be incomplete. Please refresh.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, customStartDate, customEndDate, toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleCategoryClick = async (category: string) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
    setLoadingCategoryDetails(true);
    setCategoryDetails(null);

    try {
      const params: Record<string, unknown> = {
        category,
        dateRange: dateRange === "custom" ? undefined : dateRange,
      };

      if (dateRange === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const response = await getAdminCategoryDetails(params);
      if (response.success && response.data) {
        setCategoryDetails(response.data);
      } else {
        throw new Error("Failed to load category details");
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load category details",
        variant: "destructive",
      });
    } finally {
      setLoadingCategoryDetails(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const params: Record<string, unknown> = {
        reportType,
        dateRange: dateRange === "custom" ? undefined : dateRange,
        format: "pdf",
      };

      if (dateRange === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      // Use the API function
      const blob = await exportAdminReport(params);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${reportType}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF report exported successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const handleQuickReport = async (type: string) => {
    try {
      const params: Record<string, unknown> = {
        reportType: type,
        dateRange: dateRange === "custom" ? undefined : dateRange,
        format: "pdf",
      };

      if (dateRange === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : undefined;
      if (!token) throw new Error("Not authenticated");

      const searchParams = new URLSearchParams();
      if (params.reportType)
        searchParams.append("reportType", params.reportType);
      if (params.dateRange) searchParams.append("dateRange", params.dateRange);
      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);
      if (params.format) searchParams.append("format", params.format);

      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(
        `${API_BASE}/admin/reports/export?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to export report");
      }

      // Get PDF blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${type}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${type} report exported successfully as PDF`,
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      setDateRange("custom");
      setShowCustomDatePicker(false);
    } else {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
    }
  };

  // Calculate max revenue for progress bars
  const maxMonthlyRevenue =
    monthlyData.length > 0
      ? Math.max(...monthlyData.map((m) => m.revenue || 0))
      : 1;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive platform performance insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </Button>
          </div>
        </div>

        {/* Report Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Platform Overview</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="user_activity">User Activity</SelectItem>
                  <SelectItem value="project_performance">
                    Project Performance
                  </SelectItem>
                  <SelectItem value="provider_analytics">
                    Provider Analytics
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {dateRange === "custom" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStartDate || ""}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="date"
                    value={customEndDate || ""}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <Button onClick={handleCustomDateChange} size="sm">
                    Apply
                  </Button>
                </div>
              )}
              {dateRange !== "custom" && (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Custom Date
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        RM
                        {(overviewStats.totalRevenue / 1000000).toFixed(1)}M
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">
                          {overviewStats.revenueGrowth >= 0 ? "+" : ""}
                          {overviewStats.revenueGrowth.toFixed(1)}%
                        </span>
                      </div>
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
                      <p className="text-sm font-medium text-gray-600">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {overviewStats.totalUsers.toLocaleString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="text-sm text-blue-600">
                          {overviewStats.userGrowth >= 0 ? "+" : ""}
                          {overviewStats.userGrowth.toFixed(1)}%
                        </span>
                      </div>
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
                      <p className="text-sm font-medium text-gray-600">
                        Active Projects
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {overviewStats.totalProjects}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                        <span className="text-sm text-purple-600">
                          {overviewStats.projectGrowth >= 0 ? "+" : ""}
                          {overviewStats.projectGrowth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-600" />
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
                      <p className="text-2xl font-bold text-gray-900">
                        {overviewStats.avgRating.toFixed(1)}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="text-sm text-yellow-600">
                          {overviewStats.ratingChange >= 0 ? "+" : ""}
                          {overviewStats.ratingChange.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Monthly Performance */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                    <CardDescription>
                      Revenue, projects, and user growth over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyData.length > 0 ? (
                      <div className="space-y-6">
                        {monthlyData.map((month, index) => (
                          <div
                            key={`${month.month}-${month.year}-${index}`}
                            className="space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {month.month} {month.year}
                              </span>
                              <span className="text-sm text-gray-500">
                                RM{(month.revenue / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <Progress
                              value={
                                maxMonthlyRevenue > 0
                                  ? (month.revenue / maxMonthlyRevenue) * 100
                                  : 0
                              }
                              className="h-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{month.projects} projects</span>
                              <span>{month.users} new users</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No monthly data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                    <CardDescription>
                      Service category performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryBreakdown.length > 0 ? (
                      <div className="space-y-4">
                        {categoryBreakdown.map((category) => (
                          <div
                            key={category.category}
                            onClick={() =>
                              handleCategoryClick(category.category)
                            }
                            className="space-y-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium hover:text-blue-600 transition-colors">
                                {category.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                {category.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={category.percentage}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{category.projects} projects</span>
                              <span>
                                RM{(category.revenue / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No category data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Providers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Providers</CardTitle>
                  <CardDescription>
                    Highest earning service providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topProviders.length > 0 ? (
                    <div className="space-y-4">
                      {topProviders.map((provider, index) => (
                        <Link
                          key={provider.id || provider.name || index}
                          href={`/admin/users/${provider.id}`}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium hover:text-blue-600 transition-colors">
                                {provider.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{provider.projects} projects</span>
                                {provider.rating > 0 && (
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                    <span>{provider.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              RM{(provider.revenue / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No provider data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Spending Customers</CardTitle>
                  <CardDescription>Highest value customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {topCustomers.length > 0 ? (
                    <div className="space-y-4">
                      {topCustomers.map((customer, index) => (
                        <Link
                          key={customer.id || customer.name || index}
                          href={`/admin/users/${customer.id}`}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-600">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium hover:text-purple-600 transition-colors">
                                {customer.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {customer.projects} projects
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              RM{(customer.spent / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No customer data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Report Generation</CardTitle>
                <CardDescription>
                  Generate specific reports for different stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => handleQuickReport("financial")}
                  >
                    <FileText className="w-6 h-6" />
                    <span>Financial Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => handleQuickReport("user_activity")}
                  >
                    <Users className="w-6 h-6" />
                    <span>User Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => handleQuickReport("project_performance")}
                  >
                    <Briefcase className="w-6 h-6" />
                    <span>Project Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => handleQuickReport("provider_analytics")}
                  >
                    <PieChart className="w-6 h-6" />
                    <span>Performance Metrics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Category Detail Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedCategory} - Category Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive analytics and project information for this category
            </DialogDescription>
          </DialogHeader>

          {loadingCategoryDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading category details...</span>
            </div>
          ) : categoryDetails ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Revenue
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            RM{(categoryDetails.totalRevenue / 1000).toFixed(0)}
                            K
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Projects
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {categoryDetails.projectCount}
                          </p>
                        </div>
                        <Briefcase className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Avg Project Value
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            RM
                            {(
                              categoryDetails.averageProjectValue / 1000
                            ).toFixed(0)}
                            K
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Providers
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {categoryDetails.providers?.length || 0}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Trends */}
                {categoryDetails.monthlyTrends &&
                  categoryDetails.monthlyTrends.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Performance Trends</CardTitle>
                        <CardDescription>
                          Revenue and project count over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {categoryDetails.monthlyTrends.map(
                            (month: Record<string, unknown>, index: number) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {month.month} {month.year}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    RM{((month.revenue as number) / 1000).toFixed(0)}K
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    categoryDetails.monthlyTrends.length > 0
                                      ? (((month.revenue as number) /
                                          Math.max(
                                            ...categoryDetails.monthlyTrends.map(
                                              (m: Record<string, unknown>) => m.revenue as number
                                            )
                                          )) *
                                        100)
                                      : 0
                                  }
                                  className="h-2"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{month.projects} projects</span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      All Projects ({categoryDetails.projects?.length || 0})
                    </CardTitle>
                    <CardDescription>Projects in this category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryDetails.projects &&
                    categoryDetails.projects.length > 0 ? (
                      <div className="space-y-3">
                        {categoryDetails.projects.map((project: Record<string, unknown>) => (
                          <Link
                            key={project.id}
                            href={`/admin/projects/${project.id}`}
                            className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{project.title}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  {project.provider && (
                                    <span>
                                      Provider: {project.provider.name}
                                    </span>
                                  )}
                                  {project.customer && (
                                    <span>
                                      Customer: {project.customer.name}
                                    </span>
                                  )}
                                  <span>
                                    {new Date(
                                      project.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    project.status === "COMPLETED"
                                      ? "default"
                                      : project.status === "IN_PROGRESS"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="mb-2"
                                >
                                  {project.status}
                                </Badge>
                                <p className="font-medium">
                                  RM{(project.revenue / 1000).toFixed(0)}K
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No projects found in this category
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="providers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Providers ({categoryDetails.providers?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Service providers working in this category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryDetails.providers &&
                    categoryDetails.providers.length > 0 ? (
                      <div className="space-y-3">
                        {categoryDetails.providers.map((provider: Record<string, unknown>) => (
                          <Link
                            key={provider.id}
                            href={`/admin/users/${provider.id}`}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  {provider.rating &&
                                    Number(provider.rating) > 0 && (
                                      <div className="flex items-center">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                        <span>
                                          {Number(provider.rating).toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  {provider.location && (
                                    <span>• {provider.location}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {provider.email}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No providers found in this category
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Customers ({categoryDetails.customers?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Companies using this category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryDetails.customers &&
                    categoryDetails.customers.length > 0 ? (
                      <div className="space-y-3">
                        {categoryDetails.customers.map((customer: Record<string, unknown>) => (
                          <Link
                            key={customer.id}
                            href={`/admin/users/${customer.id}`}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  {customer.industry && (
                                    <span>{customer.industry}</span>
                                  )}
                                  {customer.companySize && (
                                    <span>• {customer.companySize}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {customer.email}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No customers found in this category
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No category details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
