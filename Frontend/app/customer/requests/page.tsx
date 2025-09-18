"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Check,
  X,
  Clock,
  Star,
  MapPin,
  MessageSquare,
  Eye,
  Download,
  RefreshCw,
  FileText,
} from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { toast } from "sonner";

interface ServiceRequest {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  aiStackSuggest: string[];
  priority: string;
  status: string;
  ndaSigned: boolean;
}

interface ProviderRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  providerLocation: string;
  providerResponseTime: string;
  serviceRequestId: string;
  projectTitle: string;
  bidAmount: number;
  proposedTimeline: string;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
  skills: string[];
  portfolio: string[];
  experience: string;
  attachmentUrl?: string;
  serviceRequest: ServiceRequest;
}

export default function CustomerRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRequest, setSelectedRequest] =
    useState<ProviderRequest | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Mock data for provider requests
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      // Get userId from localStorage
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
        const res = await fetch(
          `http://localhost:4000/api/service-requests/${userId}`
        );
        const data = await res.json();
        // Flatten proposals: for each proposal in each serviceRequest, create a ProviderRequest
        const allRequests: ProviderRequest[] = [];
        (data.serviceRequests || []).forEach((sr: any) => {
          if (Array.isArray(sr.proposals) && sr.proposals.length > 0) {
            sr.proposals.forEach((proposal: any) => {
              allRequests.push({
                id: proposal.id,
                providerId: proposal.providerId,
                providerName: proposal.provider?.name || "Unknown Provider",
                providerAvatar: "/placeholder.svg?height=40&width=40",
                providerRating: 4.5, // Placeholder, update if available
                providerLocation: proposal.provider?.location || "-",
                providerResponseTime: "-", // Placeholder
                serviceRequestId: sr.id,
                projectTitle: sr.title,
                bidAmount: proposal.bidAmount,
                proposedTimeline: proposal.deliveryTime
                  ? `${proposal.deliveryTime} days`
                  : "-",
                coverLetter: proposal.coverLetter,
                status: "pending", // You can update this if you have status info
                submittedAt: proposal.createdAt,
                skills: sr.aiStackSuggest || [],
                portfolio: [], // Add if available
                experience: "-", // Add if available
                attachmentUrl: proposal.attachmentUrl,
                serviceRequest: {
                  id: sr.id,
                  customerId: sr.customerId,
                  title: sr.title,
                  description: sr.description,
                  category: sr.category,
                  budgetMin: sr.budgetMin,
                  budgetMax: sr.budgetMax,
                  timeline: sr.timeline,
                  aiStackSuggest: sr.aiStackSuggest || [],
                  priority: sr.priority,
                  status: sr.status,
                  ndaSigned: sr.ndaSigned,
                },
              });
            });
          }
        });
        setRequests(allRequests);
      } catch (err: any) {
        setError(err.message || "Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const projects = [
    { id: "proj-1", title: "E-commerce Website Development" },
    { id: "proj-2", title: "Mobile App UI/UX Design" },
    { id: "proj-3", title: "Data Analytics Dashboard" },
  ];

  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.providerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        request.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesProject =
        projectFilter === "all" || request.serviceRequestId === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime()
          );
        case "highest-bid":
          return b.bidAmount - a.bidAmount;
        case "lowest-bid":
          return a.bidAmount - b.bidAmount;
        case "rating":
          return b.providerRating - a.providerRating;
        default:
          return 0;
      }
    });

  const handleAcceptRequest = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    const userId = user?.id;
    if (!userId) {
      toast("User not found", { description: "Please log in again." });
      return;
    }
    // Build payload for accept-provider
    const payload = {
      customerId: userId,
      providerId: req.providerId,
      title: req.serviceRequest.title,
      description: req.serviceRequest.description,
      category: req.serviceRequest.category,
      budgetMin: req.bidAmount, // from provider
      budgetMax: req.bidAmount, // from provider
      timeline: req.proposedTimeline, // from provider
      skills: req.serviceRequest.aiStackSuggest,
      priority: req.serviceRequest.priority,
      status: "IN_PROGRESS",
      ndaSigned: req.serviceRequest.ndaSigned,
    };
    try {
      const res = await fetch(
        "http://localhost:4000/api/projects/accept-provider",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to create project");
      // Delete the related service request
      const deleteUrl = `http://localhost:4000/api/service-requests/dservice-request/${req.serviceRequestId}`;
      console.log("Deleting service request at:", deleteUrl);
      await fetch(deleteUrl, {
        method: "DELETE",
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "accepted" as const } : r
        )
      );
      toast("Request Accepted", {
        description:
          "The provider has been notified and a new project has been created.",
      });
    } catch (err: any) {
      toast("Failed to accept request", { description: err.message });
    }
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" as const } : req
      )
    );
    setRejectDialogOpen(false);
    setRejectReason("");
    toast("Request Rejected", {
      description: "The provider has been notified about the rejection.",
    });
  };

  const handleViewDetails = (request: ProviderRequest) => {
    setSelectedRequest(request);
    setViewDetailsOpen(true);
  };

  const handleViewAttachment = (attachmentUrl: string) => {
    if (attachmentUrl) {
      // Convert the relative path to a full URL
      const fullUrl = `http://localhost:4000/api/${attachmentUrl}`;
      window.open(fullUrl, "_blank");
    }
  };

  const handleDownloadAttachment = async (attachmentUrl: string) => {
    if (attachmentUrl) {
      const fullUrl = `http://localhost:4000/api/${attachmentUrl}`;
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("Failed to download file");
        const blob = await response.blob();
        // Try to extract filename from the path, fallback to 'attachment.pdf'
        const parts = attachmentUrl.split(/[\\/]/);
        const filename = (parts[parts.length - 1] || "attachment") + ".pdf";
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        toast("Failed to download PDF", {
          description: (err as Error).message,
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Provider Requests
            </h1>
            <p className="text-gray-600">
              Manage requests from providers for your projects
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.accepted}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
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
                    placeholder="Search by provider name or project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="highest-bid">Highest Bid</SelectItem>
                    <SelectItem value="lowest-bid">Lowest Bid</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No requests found
                </h3>
                <p className="text-gray-600">
                  No provider requests match your current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Provider Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={request.providerAvatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {request.providerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {request.providerName}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {request.providerRating}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.providerLocation}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Responds in {request.providerResponseTime}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {request.projectTitle}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {request.coverLetter}
                        </p>
                        {request.attachmentUrl && (
                          <>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewAttachment(request.attachmentUrl!)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View PDF
                            </Button> */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadAttachment(request.attachmentUrl!)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="lg:w-80 space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Bid Amount</p>
                          <p className="font-semibold text-lg">
                            RM{request.bidAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-medium">
                            {request.proposedTimeline}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {request.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {request.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{request.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {/* {request.attachmentUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewAttachment(request.attachmentUrl!)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadAttachment(request.attachmentUrl!)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download PDF
                            </Button>
                          </>
                        )} */}
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle>Request Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about {selectedRequest.providerName}'s
                    request
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Provider Info */}
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={
                          selectedRequest.providerAvatar || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        {selectedRequest.providerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {selectedRequest.providerName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{selectedRequest.providerRating} rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedRequest.providerLocation}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedRequest.providerResponseTime} response time
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedRequest.experience} experience
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Project & Bid Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Project</h4>
                      <p className="text-gray-900">
                        {selectedRequest.projectTitle}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bid Amount</h4>
                      <p className="text-2xl font-bold text-green-600">
                        RM{selectedRequest.bidAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Proposed Timeline</h4>
                      <p className="text-gray-900">
                        {selectedRequest.proposedTimeline}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Status</h4>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status.charAt(0).toUpperCase() +
                          selectedRequest.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Cover Letter */}
                  <div>
                    <h4 className="font-semibold mb-2">Cover Letter</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRequest.coverLetter}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div>
                    <h4 className="font-semibold mb-2">Portfolio</h4>
                    <div className="space-y-2">
                      {selectedRequest.portfolio.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 underline"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Attachment */}
                  {selectedRequest.attachmentUrl && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Proposal Attachment
                      </h4>
                      <div className="flex gap-2">
                        {/* <Button
                          variant="outline"
                          onClick={() =>
                            handleViewAttachment(selectedRequest.attachmentUrl!)
                          }
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View PDF Attachment
                        </Button> */}
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleDownloadAttachment(
                              selectedRequest.attachmentUrl!
                            )
                          }
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  {selectedRequest.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRejectDialogOpen(true);
                          setViewDetailsOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          handleAcceptRequest(selectedRequest.id);
                          setViewDetailsOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept Request
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request. This will
                help the provider improve their future proposals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">Reason for rejection</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="Please explain why you're rejecting this request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedRequest &&
                  handleRejectRequest(selectedRequest.id, rejectReason)
                }
                className="bg-red-600 hover:bg-red-700"
                disabled={!rejectReason.trim()}
              >
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}
