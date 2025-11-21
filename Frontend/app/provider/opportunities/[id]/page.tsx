"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  DollarSign,
  Clock,
  User,
  MapPin,
  Globe,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Send,
  Paperclip,
  ThumbsUp,
  Users,
  Zap,
  Eye,
} from "lucide-react";
import { ProviderLayout } from "@/components/provider-layout";
import {
  getProviderOpportunityById,
  sendProposal,
} from "@/lib/api";
import { formatTimeline, buildTimelineData, timelineToDays } from "@/lib/timeline-utils";
import { MarkdownViewer } from "@/components/markdown/MarkdownViewer";

type Milestone = {
  sequence: number;
  title: string;
  description?: string;
  amount: number;
  dueDate: string; // ISO (yyyy-mm-dd)
};

type ProposalFormData = {
  coverLetter: string;
  bidAmount: string;
  timelineAmount: string;
  timelineUnit: "day" | "week" | "month" | "";
  milestones: Milestone[];
  attachments: File[];
};

export default function OpportunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const [proposalData, setProposalData] = useState<ProposalFormData>({
    coverLetter: "",
    bidAmount: "",
    timelineAmount: "",
    timelineUnit: "",
    milestones: [],
    attachments: [],
  });

  const [proposalErrors, setProposalErrors] = useState<{
    bidAmount?: string;
    timelineAmount?: string;
    timelineUnit?: string;
    coverLetter?: string;
    milestones?: string;
  }>({});

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId]);

  const loadOpportunity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProviderOpportunityById(opportunityId);
      if (response.success) {
        setOpportunity(response.opportunity);
      } else {
        setError("Failed to load opportunity");
      }
    } catch (err: any) {
      console.error("Error loading opportunity:", err);
      setError(err.message || "Failed to load opportunity");
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    setProposalData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          sequence: prev.milestones.length + 1,
          title: "",
          description: "",
          amount: 0,
          dueDate: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
        },
      ],
    }));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    setProposalData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const removeMilestone = (index: number) => {
    setProposalData((prev) => ({
      ...prev,
      milestones: prev.milestones
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, sequence: i + 1 })),
    }));
  };

  function validateProposal(form: ProposalFormData) {
    const newErrors: {
      bidAmount?: string;
      timelineAmount?: string;
      timelineUnit?: string;
      coverLetter?: string;
      milestones?: string;
    } = {};

    // Bid amount: required, >0, and within budget range
    const bidAmountNum = Number(form.bidAmount);
    if (!form.bidAmount) {
      newErrors.bidAmount = "Bid amount is required.";
    } else if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
      newErrors.bidAmount = "Bid amount must be a positive number.";
    } else if (opportunity) {
      const budgetMin = opportunity.budgetMin || 0;
      const budgetMax = opportunity.budgetMax || 0;
      if (bidAmountNum < budgetMin || bidAmountNum > budgetMax) {
        newErrors.bidAmount = `Bid amount must be between RM ${budgetMin.toLocaleString()} and RM ${budgetMax.toLocaleString()}.`;
      }
    }

    // Timeline: required, and must be <= original timeline
    const timelineAmountNum = Number(form.timelineAmount);
    if (!form.timelineAmount) {
      newErrors.timelineAmount = "Timeline amount is required.";
    } else if (isNaN(timelineAmountNum) || timelineAmountNum <= 0) {
      newErrors.timelineAmount = "Timeline amount must be greater than 0.";
    }

    if (!form.timelineUnit) {
      newErrors.timelineUnit = "Timeline unit is required.";
    } else if (opportunity && opportunity.timeline) {
      // Parse original timeline to days
      const timelineStr = opportunity.timeline.toLowerCase().trim();
      const match = timelineStr.match(/^(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)$/);
      if (match) {
        const amount = Number(match[1]);
        const unit = match[2].replace(/s$/, "");
        const originalTimelineInDays = timelineToDays(amount, unit);
        const providerTimelineInDays = timelineToDays(timelineAmountNum, form.timelineUnit);
        if (providerTimelineInDays > originalTimelineInDays) {
          newErrors.timelineAmount = `Your timeline must be equal to or less than the company's timeline (${opportunity.timeline}).`;
        }
      }
    }

    // Cover letter: required, min length 20
    if (!form.coverLetter || form.coverLetter.trim().length < 20) {
      newErrors.coverLetter = "Cover letter must be at least 20 characters.";
    }

    // Milestones validation (REQUIRED)
    if (form.milestones.length === 0) {
      newErrors.milestones = "At least one milestone is required.";
    } else {
      // Validate each milestone
      form.milestones.forEach((m: Milestone, idx: number) => {
        if (!m.title || !m.title.trim()) {
          newErrors.milestones = `Milestone #${idx + 1}: title is required.`;
        }
        if (m.amount == null || isNaN(Number(m.amount)) || Number(m.amount) <= 0) {
          newErrors.milestones = `Milestone #${idx + 1}: amount must be > 0.`;
        }
        if (!m.dueDate) {
          newErrors.milestones = `Milestone #${idx + 1}: due date is required.`;
        } else {
          // Validate due date is not in the past
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(m.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < today) {
            newErrors.milestones = `Milestone #${idx + 1}: due date cannot be in the past.`;
          }
        }
      });
    }

    setProposalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmitProposal = async () => {
    if (!opportunity) return;

    if (!validateProposal(proposalData)) {
      toast.error("Please fix the errors in your proposal");
      return;
    }

    try {
      setSubmittingProposal(true);

      // Build timeline string and calculate days
      const timelineData = buildTimelineData(
        Number(proposalData.timelineAmount),
        proposalData.timelineUnit
      );

      // Create FormData for proposal submission
      const formData = new FormData();
      formData.append("serviceRequestId", opportunity.id);
      formData.append("coverLetter", proposalData.coverLetter);
      formData.append("bidAmount", proposalData.bidAmount);
      formData.append("timeline", timelineData.timeline);
      formData.append("timelineInDays", timelineData.timelineInDays.toString());

      // Add milestones
      proposalData.milestones.forEach((milestone, index) => {
        formData.append(`milestones[${index}][title]`, milestone.title);
        if (milestone.description) {
          formData.append(`milestones[${index}][description]`, milestone.description);
        }
        formData.append(`milestones[${index}][amount]`, milestone.amount.toString());
        formData.append(`milestones[${index}][dueDate]`, new Date(milestone.dueDate).toISOString());
        formData.append(`milestones[${index}][order]`, (index + 1).toString());
      });

      // Add attachments
      proposalData.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await sendProposal(formData);

      if (response.success) {
        toast.success("Proposal submitted successfully!");
        setIsProposalModalOpen(false);
        setProposalData({
          coverLetter: "",
          bidAmount: "",
          timelineAmount: "",
          timelineUnit: "",
          milestones: [],
          attachments: [],
        });
        // Reload opportunity to update hasProposed flag
        await loadOpportunity();
      } else {
        toast.error(response.message || "Failed to submit proposal");
      }
    } catch (err: any) {
      console.error("Error submitting proposal:", err);
      toast.error(err.message || "Failed to submit proposal");
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setProposalData((prev) => ({
        ...prev,
        attachments: Array.from(files),
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setProposalData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading opportunity...
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the opportunity details.
            </p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  if (error || !opportunity) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error loading opportunity
            </h3>
            <p className="text-gray-600 mb-4">{error || "Opportunity not found"}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `RM${amount.toLocaleString()}`;
  };

  // Get skills array
  const skills = Array.isArray(opportunity.skills) ? opportunity.skills : [];

  // Get requirements and deliverables (handle both string and array formats)
  const requirements =
    typeof opportunity.requirements === "string"
      ? opportunity.requirements
      : Array.isArray(opportunity.requirements)
      ? opportunity.requirements.map((r: any) => `- ${r}`).join("\n")
      : "";

  const deliverables =
    typeof opportunity.deliverables === "string"
      ? opportunity.deliverables
      : Array.isArray(opportunity.deliverables)
      ? opportunity.deliverables.map((d: any) => `- ${d}`).join("\n")
      : "";

  // Get client profile image
  const clientAvatar =
    opportunity.customer?.customerProfile?.profileImageUrl ||
    opportunity.customer?.customerProfile?.logoUrl;

  const clientAvatarUrl = clientAvatar
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${clientAvatar.startsWith("/") ? "" : "/"}${clientAvatar}`
    : "/placeholder.svg";

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
            <p className="text-gray-600">{opportunity.description}</p>
          </div>
          <div className="flex gap-3">
            {opportunity.hasProposed ? (
              <Button variant="outline" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                Proposal Submitted
              </Button>
            ) : (
              <Button
                onClick={() => setIsProposalModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Submit Proposal
              </Button>
            )}
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {opportunity.milestones && opportunity.milestones.length > 0 && (
                  <TabsTrigger value="milestones">
                    Milestones ({opportunity.milestones.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Category
                        </Label>
                        <p className="text-lg">{opportunity.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Status
                        </Label>
                        <Badge className="bg-green-100 text-green-800">
                          Open
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Budget Range
                        </Label>
                        <p className="text-lg">
                          {formatCurrency(opportunity.budgetMin || 0)} -{" "}
                          {formatCurrency(opportunity.budgetMax || 0)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Timeline
                        </Label>
                        <p className="text-lg">
                          {formatTimeline(opportunity.timeline) || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Priority
                        </Label>
                        <Badge>
                          {opportunity.priority || "medium"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Proposals
                        </Label>
                        <p className="text-lg">
                          {opportunity._count?.proposals || 0} proposals received
                        </p>
                      </div>
                    </div>

                    {skills.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Required Skills
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {requirements && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Requirements
                        </Label>
                        <div className="mt-2 prose max-w-none text-gray-700">
                          <MarkdownViewer
                            content={requirements}
                            className="prose max-w-none text-gray-700"
                            emptyMessage="No requirements specified"
                          />
                        </div>
                      </div>
                    )}

                    {deliverables && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Deliverables
                        </Label>
                        <div className="mt-2 prose max-w-none text-gray-700">
                          <MarkdownViewer
                            content={deliverables}
                            className="prose max-w-none text-gray-700"
                            emptyMessage="No deliverables specified"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {opportunity.milestones && opportunity.milestones.length > 0 && (
                <TabsContent value="milestones" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Proposed Milestones</CardTitle>
                      <CardDescription>
                        These are the milestones suggested by the company. You can use them or propose your own in your proposal.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {opportunity.milestones.map((milestone: any, index: number) => (
                          <div key={milestone.id || index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                  {milestone.order || index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{milestone.title}</h4>
                                  {milestone.description && (
                                    <p className="text-sm text-gray-600">
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold">
                                  {formatCurrency(milestone.amount || 0)}
                                </p>
                                {milestone.dueDate && (
                                  <p className="text-sm text-gray-500">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={clientAvatarUrl} />
                    <AvatarFallback>
                      {opportunity.customer?.name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-semibold text-lg">
                        {opportunity.customer?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {opportunity.customer?.email || ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {opportunity.customer?.customerProfile?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {opportunity.customer.customerProfile.location}
                          </span>
                        </div>
                      )}
                      {opportunity.customer?.customerProfile?.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a
                            href={
                              opportunity.customer.customerProfile.website.startsWith("http")
                                ? opportunity.customer.customerProfile.website
                                : `https://${opportunity.customer.customerProfile.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {opportunity.customer.customerProfile.website}
                          </a>
                        </div>
                      )}
                      {opportunity.customer?.customerProfile?.industry && (
                        <div>
                          <span className="text-gray-500">Industry: </span>
                          <span className="text-gray-700">
                            {opportunity.customer.customerProfile.industry}
                          </span>
                        </div>
                      )}
                      {opportunity.customer?.customerProfile?.companySize && (
                        <div>
                          <span className="text-gray-500">Company Size: </span>
                          <span className="text-gray-700">
                            {opportunity.customer.customerProfile.companySize}
                          </span>
                        </div>
                      )}
                      {opportunity.customer?.customerProfile?.projectsPosted !== undefined && (
                        <div>
                          <span className="text-gray-500">Projects Posted: </span>
                          <span className="text-gray-700">
                            {opportunity.customer.customerProfile.projectsPosted || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    {opportunity.customer?.id && (
                      <Link href={`/provider/companies/${opportunity.customer.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Company
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-semibold">
                    {new Date(opportunity.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Proposals:</span>
                  <span className="font-semibold">
                    {opportunity._count?.proposals || 0}
                  </span>
                </div>
                {opportunity.priority && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <Badge>{opportunity.priority}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Proposal Dialog */}
        <Dialog open={isProposalModalOpen} onOpenChange={setIsProposalModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Submit Proposal</DialogTitle>
              <DialogDescription>
                Submit your proposal for: {opportunity.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Cover Letter */}
              <div>
                <Label htmlFor="coverLetter">
                  Cover Letter <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="coverLetter"
                  value={proposalData.coverLetter}
                  onChange={(e) =>
                    setProposalData((prev) => ({
                      ...prev,
                      coverLetter: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Write a compelling cover letter (minimum 20 characters)..."
                  className="mt-1"
                />
                {proposalErrors.coverLetter && (
                  <p className="text-sm text-red-500 mt-1">
                    {proposalErrors.coverLetter}
                  </p>
                )}
              </div>

              {/* Bid Amount */}
              <div>
                <Label htmlFor="bidAmount">
                  Bid Amount (RM) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bidAmount"
                  type="number"
                  value={proposalData.bidAmount}
                  onChange={(e) =>
                    setProposalData((prev) => ({
                      ...prev,
                      bidAmount: e.target.value,
                    }))
                  }
                  placeholder="Enter your bid amount"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Budget range: {formatCurrency(opportunity.budgetMin || 0)} -{" "}
                  {formatCurrency(opportunity.budgetMax || 0)}
                </p>
                {proposalErrors.bidAmount && (
                  <p className="text-sm text-red-500 mt-1">
                    {proposalErrors.bidAmount}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timelineAmount">
                    Timeline Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="timelineAmount"
                    type="number"
                    value={proposalData.timelineAmount}
                    onChange={(e) =>
                      setProposalData((prev) => ({
                        ...prev,
                        timelineAmount: e.target.value,
                      }))
                    }
                    placeholder="e.g., 2"
                    className="mt-1"
                  />
                  {proposalErrors.timelineAmount && (
                    <p className="text-sm text-red-500 mt-1">
                      {proposalErrors.timelineAmount}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="timelineUnit">
                    Timeline Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={proposalData.timelineUnit}
                    onValueChange={(value: "day" | "week" | "month") =>
                      setProposalData((prev) => ({
                        ...prev,
                        timelineUnit: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day(s)</SelectItem>
                      <SelectItem value="week">Week(s)</SelectItem>
                      <SelectItem value="month">Month(s)</SelectItem>
                    </SelectContent>
                  </Select>
                  {proposalErrors.timelineUnit && (
                    <p className="text-sm text-red-500 mt-1">
                      {proposalErrors.timelineUnit}
                    </p>
                  )}
                </div>
              </div>
              {opportunity.timeline && (
                <p className="text-xs text-gray-500">
                  Company's timeline: {formatTimeline(opportunity.timeline)}. Your
                  timeline must be equal to or less than this.
                </p>
              )}

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>
                    Milestones <span className="text-red-500">*</span> (At least one
                    required)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMilestone}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>
                {proposalErrors.milestones && (
                  <p className="text-sm text-red-500 mb-2">
                    {proposalErrors.milestones}
                  </p>
                )}
                <div className="space-y-4">
                  {proposalData.milestones.map((milestone, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Milestone #{milestone.sequence}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(index)}
                            >
                              Remove
                            </Button>
                          </div>
                          <div>
                            <Label>Title *</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) =>
                                updateMilestone(index, "title", e.target.value)
                              }
                              placeholder="Milestone title"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={milestone.description || ""}
                              onChange={(e) =>
                                updateMilestone(index, "description", e.target.value)
                              }
                              placeholder="Milestone description (optional)"
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Amount (RM) *</Label>
                              <Input
                                type="number"
                                value={milestone.amount || ""}
                                onChange={(e) =>
                                  updateMilestone(
                                    index,
                                    "amount",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Due Date *</Label>
                              <Input
                                type="date"
                                value={milestone.dueDate}
                                onChange={(e) =>
                                  updateMilestone(index, "dueDate", e.target.value)
                                }
                                min={new Date().toISOString().slice(0, 10)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {proposalData.milestones.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No milestones added. Click "Add Milestone" to add one.
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  className="mt-1"
                />
                {proposalData.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {proposalData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProposalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitProposal}
                disabled={submittingProposal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submittingProposal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProviderLayout>
  );
}

