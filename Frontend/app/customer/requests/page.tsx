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
  Loader2,
  CheckCircle,
} from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { useToast } from "@/hooks/use-toast";
import {
  getCompanyProjectRequests,
  acceptProjectRequest,
  rejectProjectRequest,
  getProjectRequestStats,
} from "@/lib/api";
import {
  getCompanyProjectMilestones,
  updateCompanyProjectMilestones,
  approveCompanyMilestones,
  type Milestone,
} from "@/lib/api";
import Link from "next/link";

interface ProviderRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  providerLocation: string;
  providerResponseTime: string;
  projectId: string;
  projectTitle: string;
  bidAmount: number;
  proposedTimeline: string;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
  skills: string[];
  portfolio: string[];
  experience: string;
  attachments: string[];
  milestones: Array<{
    title: string;
    description?: string; // backend may not send, so optional
    amount: number;
    dueDate: string;
    order: number;
  }>;
}

interface ApiProposal {
  id: string;
  serviceRequest: {
    id: string;
    title: string;
  };
  provider: {
    id: string;
    name: string;
    avatarUrl?: string;
    rating: number;
    location: string;
    responseTime: string;
    portfolio: string[];
    experience: string;
    skills: string[];
  };
  bidAmount: number;
  deliveryTime: number;
  coverLetter: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  submittedAt?: string;
  createdAt?: string;
  milestones: Array<{
    title: string;
    amount: number;
    dueDate: string;
    order: number;
  }>;
  attachmentUrls?: string[];
}

export default function CustomerRequestsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRequest, setSelectedRequest] =
    useState<ProviderRequest | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // API state
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProposals: 0,
    openRequests: 0,
    matchedRequests: 0,
    averageProposalsPerRequest: 0,
  });
  const [projectOptions, setProjectOptions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const asArray = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);
  const fmt = (v: any, fallback = "0") => {
    if (v === null || v === undefined) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : fallback;
  };

  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneApprovalState, setMilestoneApprovalState] = useState({
    milestonesLocked: false,
    companyApproved: false,
    providerApproved: false,
    milestonesApprovedAt: null as string | null,
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [milestoneFinalizeOpen, setMilestoneFinalizeOpen] = useState(false);

  const normalizeSequences = (items: Milestone[]) =>
    items
      .map((m, i) => ({ ...m, sequence: i + 1 }))
      .sort((a, b) => a.sequence - b.sequence);

  const addMilestone = () => {
    setMilestones((prev) =>
      normalizeSequences([
        ...prev,
        {
          sequence: prev.length + 1,
          title: "",
          description: "",
          amount: 0,
          dueDate: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
        },
      ])
    );
  };

  const updateMilestone = (i: number, patch: Partial<Milestone>) => {
    setMilestones((prev) =>
      normalizeSequences(
        prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m))
      )
    );
  };

  const removeMilestone = (i: number) => {
    setMilestones((prev) =>
      normalizeSequences(prev.filter((_, idx) => idx !== i))
    );
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [proposalsResponse, statsResponse] = await Promise.all([
          getCompanyProjectRequests({
            page: 1,
            limit: 100,
            search: searchQuery,
            proposalStatus:
              statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
            serviceRequestId:
              projectFilter === "all" ? undefined : projectFilter,
            sort: sortBy,
          }),
          getProjectRequestStats(),
        ]);

        // Ensure we have arrays from the API responses (backend may return proposals|data|items)
        const proposals = Array.isArray(proposalsResponse?.proposals)
          ? proposalsResponse.proposals
          : Array.isArray(proposalsResponse?.data)
          ? proposalsResponse.data
          : Array.isArray(proposalsResponse?.items)
          ? proposalsResponse.items
          : [];
        const mappedRequests: ProviderRequest[] = proposals.map(
          (proposal: ApiProposal) => {
            const provider = (proposal as any).provider || {};
            const profile = provider.providerProfile || {};
            return {
              id: proposal.id,
              providerId: provider.id,
              providerName: provider.name,
              providerAvatar: profile.profileImageUrl && profile.profileImageUrl !== "/placeholder.svg"
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${profile.profileImageUrl.startsWith("/") ? "" : "/"}${profile.profileImageUrl}`
                : "/placeholder.svg?height=40&width=40",
              providerRating: profile.rating ?? provider.rating ?? 0,
              providerLocation: profile.location ?? provider.location ?? "",
              providerResponseTime:
                profile.responseTime ?? provider.responseTime ?? "",
              projectId: proposal.serviceRequest.id,
              projectTitle: proposal.serviceRequest.title,
              bidAmount: proposal.bidAmount,
              proposedTimeline: `${proposal.deliveryTime} days`,
              coverLetter: proposal.coverLetter,
              status: proposal.status.toLowerCase() as
                | "pending"
                | "accepted"
                | "rejected",
              submittedAt: proposal.createdAt || proposal.submittedAt,
              skills: Array.isArray(profile.skills)
                ? profile.skills
                : Array.isArray(provider.skills)
                ? provider.skills
                : [],
              portfolio: Array.isArray(profile.portfolios)
                ? profile.portfolios
                : Array.isArray(provider.portfolio)
                ? provider.portfolio
                : [],
              experience: profile.experience ?? provider.experience ?? "",
              attachments: Array.isArray(proposal.attachmentUrls)
                ? proposal.attachmentUrls
                : [],
              milestones: Array.isArray(proposal.milestones)
                ? proposal.milestones
                : [],
            };
          }
        );
        setRequests(mappedRequests);
        setStats(
          statsResponse?.stats ??
            statsResponse?.data ?? {
              totalProposals: 0,
              openRequests: 0,
              matchedRequests: 0,
              averageProposalsPerRequest: 0,
            }
        );

        // Build project options from unique service requests using the safe proposals array
        const uniqueProjects = proposals.reduce(
          (
            acc: Array<{ id: string; title: string }>,
            proposal: ApiProposal
          ) => {
            const existing = acc.find(
              (p) => p.id === proposal.serviceRequest.id
            );
            if (!existing) {
              acc.push({
                id: proposal.serviceRequest.id,
                title: proposal.serviceRequest.title,
              });
            }
            return acc;
          },
          []
        );
        setProjectOptions(uniqueProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, statusFilter, projectFilter, sortBy]);

  // Since we're filtering on the server side, we can use requests directly
  const filteredRequests = requests.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
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

  const handleAcceptRequest = async (proposalId: string) => {
    try {
      setProcessingId(proposalId);
      const response = await acceptProjectRequest(proposalId, true);

      // Get the created project ID from the response
      const projectId = response?.id || response?.project?.id;

      // Optimistic status update
      setRequests((prev) =>
        prev.map((req) =>
          req.id === proposalId ? { ...req, status: "accepted" as const } : req
        )
      );

      // Immediately load project milestones for edit
      if (projectId) {
        const milestoneData = await getCompanyProjectMilestones(projectId);
        setMilestones(
          Array.isArray(milestoneData.milestones)
            ? milestoneData.milestones.map((m) => ({ ...m, sequence: m.order }))
            : []
        );
        setMilestoneApprovalState({
          milestonesLocked: milestoneData.milestonesLocked,
          companyApproved: milestoneData.companyApproved,
          providerApproved: milestoneData.providerApproved,
          milestonesApprovedAt: milestoneData.milestonesApprovedAt,
        });
        setActiveProjectId(projectId);
        setMilestonesOpen(true);
      }

      toast({
        title: "Request Accepted",
        description: "Edit milestones and confirm to finalize.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to accept request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveMilestones = async () => {
    if (!activeProjectId) return;
    try {
      setSavingMilestones(true);
      const payload = normalizeSequences(milestones).map((m) => ({
        ...m,
        amount: Number(m.amount),
        dueDate: new Date(m.dueDate).toISOString(),
      }));
      const res = await updateCompanyProjectMilestones(
        activeProjectId,
        payload
      );
      setMilestoneApprovalState({
        milestonesLocked: res.milestonesLocked,
        companyApproved: res.companyApproved,
        providerApproved: res.providerApproved,
        milestonesApprovedAt: res.milestonesApprovedAt,
      });
      toast({
        title: "Milestones updated",
        description: "Milestone changes have been saved.",
      });
    } catch (e) {
      toast({
        title: "Save failed",
        description:
          e instanceof Error ? e.message : "Could not save milestones",
        variant: "destructive",
      });
    } finally {
      setSavingMilestones(false);
    }
  };

  const handleApproveAcceptedMilestones = async () => {
    if (!activeProjectId) return;

    try {
      const res = await approveCompanyMilestones(activeProjectId);

      setMilestoneApprovalState({
        milestonesLocked: res.milestonesLocked,
        companyApproved: res.companyApproved,
        providerApproved: res.providerApproved,
        milestonesApprovedAt: res.milestonesApprovedAt,
      });

      // 1. Close the milestone editor dialog ALWAYS
      setMilestonesOpen(false);

      // 2. Toast feedback
      toast({
        title: "Milestones approved",
        description: res.milestonesLocked
          ? "Milestones are now locked. Work can start and payments will follow these milestones."
          : "Waiting for provider to approve.",
      });

      // 3. Open summary / receipt dialog
      setMilestoneFinalizeOpen(true);
    } catch (e) {
      toast({
        title: "Approval failed",
        description:
          e instanceof Error ? e.message : "Could not approve milestones",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      setProcessingId(requestId);
      await rejectProjectRequest(requestId, reason);

      // Update local state optimistically
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "rejected" as const } : req
        )
      );

      setRejectDialogOpen(false);
      setRejectReason("");

      toast({
        title: "Request Rejected",
        description: "The provider has been notified about the rejection.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (request: ProviderRequest) => {
    setSelectedRequest(request);
    setViewDetailsOpen(true);
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

  const displayStats = {
    total: stats.totalProposals,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

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
                    {displayStats.total}
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
                    {displayStats.pending}
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
                    {displayStats.accepted}
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
                    {displayStats.rejected}
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
                    {projectOptions.map((project) => (
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
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading requests...
                </h3>
                <p className="text-gray-600">
                  Please wait while we fetch your provider requests.
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error loading requests
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredRequests.length === 0 ? (
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
                          src={
                            request.providerAvatar && 
                            request.providerAvatar !== "/placeholder.svg?height=40&width=40" &&
                            !request.providerAvatar.includes("/placeholder.svg")
                              ? request.providerAvatar
                              : "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {String(request.providerName || "")
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Name + rating */}
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

                        {/* Location + response time */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.providerLocation || "—"}
                          </div>
                        </div>

                        {/* Project title */}
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {request.projectTitle}
                        </p>

                        {/* Cover letter */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {request.coverLetter}
                        </p>

                        {/* ⬅ NEW: skills preview */}
                        <div className="flex flex-wrap gap-1">
                          {asArray<string>(request.skills)
                            .slice(0, 3)
                            .map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-[10px] leading-tight"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {asArray<string>(request.skills).length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] leading-tight"
                            >
                              +{asArray<string>(request.skills).length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* ⬅ NEW: short experience line */}
                        {request.experience && (
                          <p className="text-[12px] text-gray-500 mt-2 line-clamp-1">
                            {request.experience} experience
                          </p>
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
                          {request.submittedAt && !isNaN(new Date(request.submittedAt).getTime())
                            ? new Date(request.submittedAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Bid Amount</p>
                          <p className="font-semibold text-lg">
                            RM{fmt(request.bidAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-medium">
                            {request.proposedTimeline}
                          </p>
                        </div>
                      </div>



                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {/* View profile - always visible */}
                        <Link
                          href={`/customer/providers/${request.providerId}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                        </Link>

                        {/* View details dialog (proposal info) */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                          className="flex-1"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          View Details
                        </Button>

                        {/* Accept / Reject if pending */}
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1" />
                              )}
                              {processingId === request.id
                                ? "Accepting..."
                                : "Accept"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 flex-1"
                              disabled={processingId === request.id}
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
                          selectedRequest.providerAvatar && 
                          selectedRequest.providerAvatar !== "/placeholder.svg?height=40&width=40" &&
                          !selectedRequest.providerAvatar.includes("/placeholder.svg")
                            ? selectedRequest.providerAvatar
                            : "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        {String(selectedRequest.providerName || "")
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      {/* Name + rating */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {selectedRequest.providerName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>
                                {selectedRequest.providerRating} rating
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedRequest.providerLocation || "—"}
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {selectedRequest.providerResponseTime} response
                              time
                            </div>
                          </div>

                          {selectedRequest.experience && (
                            <p className="text-sm text-gray-600 mt-2">
                              {selectedRequest.experience} experience
                            </p>
                          )}

                          {/* ⬅ NEW: top skills inline preview */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {asArray<string>(selectedRequest.skills)
                              .slice(0, 4)
                              .map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="text-[10px] leading-tight"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {asArray<string>(selectedRequest.skills).length >
                              4 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] leading-tight"
                              >
                                +
                                {asArray<string>(selectedRequest.skills)
                                  .length - 4}{" "}
                                more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* ⬅ NEW: View profile button */}
                        <Link
                          href={`/customer/providers/${selectedRequest.providerId}`}
                          className="self-start"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
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
                        RM{fmt(selectedRequest.bidAmount)}
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
                      {asArray<string>(selectedRequest.skills).map((skill) => (
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
                      {asArray<string>(selectedRequest.portfolio).map(
                        (link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:text-blue-800 underline"
                          >
                            {link}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                  {/* Proposed Milestones */}
                  {selectedRequest.milestones &&
                    selectedRequest.milestones.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Proposed Milestones
                        </h4>

                        <div className="space-y-4">
                          {selectedRequest.milestones
                            .sort((a, b) => a.order - b.order)
                            .map((m, idx) => (
                              <Card
                                key={idx}
                                className="border border-gray-200"
                              >
                                <CardContent className="p-4 space-y-2">
                                  {/* Top row: title + amount */}
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">
                                        #{m.order || idx + 1}
                                      </Badge>
                                      <span className="font-medium text-gray-900">
                                        {m.title || "Untitled milestone"}
                                      </span>
                                    </div>

                                    <div className="text-right">
                                      <span className="text-sm text-gray-500 block">
                                        Amount
                                      </span>
                                      <span className="text-lg font-semibold text-gray-900">
                                        RM{" "}
                                        {Number(m.amount || 0).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {m.description &&
                                    m.description.trim() !== "" && (
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {m.description}
                                      </p>
                                    )}

                                  {/* Dates */}
                                  <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        Due:{" "}
                                        {m.dueDate
                                          ? new Date(
                                              m.dueDate
                                            ).toLocaleDateString()
                                          : "—"}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Attachments */}
                  {Array.isArray(selectedRequest.attachments) &&
                    selectedRequest.attachments.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                          Attachments
                        </h4>

                        <div className="space-y-2">
                          {selectedRequest.attachments.map((rawUrl, idx) => {
                            // rawUrl can look like: "uploads\proposals\1761857633365_Screenshots.pdf"
                            // We normalize slashes and extract filename.
                            const normalized = rawUrl.replace(/\\/g, "/"); // -> "uploads/proposals/..."
                            const fileName =
                              normalized.split("/").pop() || `file-${idx + 1}`;

                            // Build absolute URL to download
                            const fullUrl = `${
                              process.env.NEXT_PUBLIC_API_URL ||
                              "http://localhost:4000"
                            }/${normalized.replace(/^\//, "")}`;

                            return (
                              <a
                                key={idx}
                                href={fullUrl}
                                download={fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 hover:shadow-sm transition"
                              >
                                {/* Icon circle */}
                                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-xs font-medium">
                                  {/* If you want, you can make this dynamic based on extension */}
                                  PDF
                                </div>

                                {/* File info */}
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium text-gray-900 break-all leading-snug">
                                    {fileName}
                                  </span>
                                  <span className="text-xs text-gray-500 leading-snug">
                                    Click to preview / download
                                  </span>
                                </div>

                                {/* Download icon on the far right */}
                                <div className="ml-auto flex items-center text-gray-500 hover:text-gray-700">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <path d="M7 10l5 5 5-5" />
                                    <path d="M12 15V3" />
                                  </svg>
                                </div>
                              </a>
                            );
                          })}
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
                        disabled={processingId === selectedRequest.id}
                      >
                        {processingId === selectedRequest.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        {processingId === selectedRequest.id
                          ? "Accepting..."
                          : "Accept Request"}
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
                disabled={
                  !rejectReason.trim() || processingId === selectedRequest?.id
                }
              >
                {processingId === selectedRequest?.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Request"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={milestonesOpen} onOpenChange={setMilestonesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Milestones</DialogTitle>
            <DialogDescription>
              Company {milestoneApprovalState.companyApproved ? "✓" : "✗"} ·
              Provider {milestoneApprovalState.providerApproved ? "✓" : "✗"}
              {milestoneApprovalState.milestonesLocked && " · LOCKED"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {milestones.map((m, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="grid md:grid-cols-12 gap-3">
                    <div className="md:col-span-1">
                      <Label>Seq</Label>
                      <Input type="number" value={i + 1} disabled />
                    </div>
                    <div className="md:col-span-4">
                      <Label>Title</Label>
                      <Input
                        value={m.title}
                        onChange={(e) =>
                          updateMilestone(i, { title: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={String(m.amount ?? 0)}
                        onChange={(e) =>
                          updateMilestone(i, { amount: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={(m.dueDate || "").slice(0, 10)}
                        onChange={(e) =>
                          updateMilestone(i, { dueDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      value={m.description || ""}
                      onChange={(e) =>
                        updateMilestone(i, { description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => removeMilestone(i)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={addMilestone}>
                + Add Milestone
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveMilestones}
                  disabled={savingMilestones}
                >
                  {savingMilestones ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={handleApproveAcceptedMilestones}>
                  Approve
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter />
        </DialogContent>
      </Dialog>
      <Dialog
        open={milestoneFinalizeOpen}
        onOpenChange={setMilestoneFinalizeOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Milestones Submitted</DialogTitle>
            <DialogDescription>
              These milestones are now awaiting final confirmation, or have been
              locked if both sides approved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle
                className={`w-5 h-5 ${
                  milestoneApprovalState.companyApproved
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Company Approved
                </div>
                <div>
                  {milestoneApprovalState.companyApproved
                    ? "You have approved the milestone plan."
                    : "You haven't approved yet."}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle
                className={`w-5 h-5 ${
                  milestoneApprovalState.providerApproved
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Provider Approved
                </div>
                <div>
                  {milestoneApprovalState.providerApproved
                    ? "The provider approved the milestone plan."
                    : "Waiting for provider approval."}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle
                className={`w-5 h-5 ${
                  milestoneApprovalState.milestonesLocked
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Locked & Ready
                </div>
                <div>
                  {milestoneApprovalState.milestonesLocked
                    ? "Milestones are locked. Work can start and payments follow these milestones."
                    : "Milestones are not locked yet."}
                </div>
                {milestoneApprovalState.milestonesApprovedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Locked at{" "}
                    {new Date(
                      milestoneApprovalState.milestonesApprovedAt
                    ).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button onClick={() => setMilestoneFinalizeOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
