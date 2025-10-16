"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  ThumbsUp,
  Eye,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Zap,
  Star,
  Send,
  Paperclip,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { ProviderLayout } from "@/components/provider-layout";
import { toast } from "sonner";
import { getProviderOpportunities, sendProposal } from "@/lib/api";

export default function ProviderOpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  type Milestone = {
    sequence: number;
    title: string;
    description?: string;
    amount: number;
    dueDate: string; // ISO (yyyy-mm-dd or full ISO; we’ll normalize on submit)
  };

  const [proposalData, setProposalData] = useState({
    coverLetter: "",
    bidAmount: "",
    timeline: "",
    milestones: [] as Milestone[],
    attachments: [] as File[],
  });

  // API state
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getProviderOpportunities({
          page: 1,
          limit: 100,
          search: searchQuery,
          category: categoryFilter === "all" ? undefined : categoryFilter,
        });

        if (response.success) {
          // Map API response to UI format
          const mappedOpportunities = (response.opportunities || []).map(
            (opportunity: any) => ({
              id: opportunity.id,
              title: opportunity.title,
              description: opportunity.description,
              fullDescription: opportunity.description, // Use description as full description for now
              client: opportunity.customer?.name || "Unknown Client",
              budget: `RM ${opportunity.budgetMin?.toLocaleString()} - RM ${opportunity.budgetMax?.toLocaleString()}`,
              budgetType: "fixed",
              timeline: opportunity.timeline || "Not specified",
              skills: opportunity.skills || [],
              postedTime: new Date(opportunity.createdAt).toLocaleDateString(),
              matchScore: 85, // Default match score
              proposals: opportunity._count?.proposals || 0,
              category: opportunity.category,
              location:
                opportunity.customer?.customerProfile?.location ||
                "Not specified",
              clientRating: 4.5, // Default rating
              clientJobs: 10, // Default jobs count
              avatar:
                opportunity.customer?.customerProfile?.logoUrl ||
                "/placeholder.svg?height=40&width=40",
              urgent: opportunity.priority === "High",
              verified: true,
              hasSubmitted: opportunity.hasProposed || false,
              requirements: Array.isArray(opportunity.requirements)
                ? opportunity.requirements
                : [],
              deliverables: Array.isArray(opportunity.deliverables)
                ? opportunity.deliverables
                : [],
              clientInfo: {
                companySize:
                  opportunity.customer?.customerProfile?.companySize ||
                  "Not specified",
                industry:
                  opportunity.customer?.customerProfile?.industry ||
                  "Not specified",
                memberSince: new Date(
                  opportunity.customer?.createdAt || Date.now()
                )
                  .getFullYear()
                  .toString(),
                totalSpent: "RM 100,000+", // Default value
                avgRating: 4.5, // Default rating
              },
              originalData: opportunity, // Store original API data for proposal submission
            })
          );

          setOpportunities(mappedOpportunities);
        } else {
          setError("Failed to fetch opportunities");
        }
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch opportunities"
        );
        toast.error("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [searchQuery, categoryFilter, toast]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };
  // Keep sequences clean and sorted
  const normalizeDraftSequences = (items: Milestone[]) =>
    items
      .map((m, i) => ({ ...m, sequence: i + 1 }))
      .sort((a, b) => a.sequence - b.sequence);

  const addProposalMilestone = () => {
    setProposalData((prev) => ({
      ...prev,
      milestones: normalizeDraftSequences([
        ...prev.milestones,
        {
          sequence: prev.milestones.length + 1,
          title: "",
          description: "",
          amount: 0,
          dueDate: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
        },
      ]),
    }));
  };

  const updateProposalMilestone = (i: number, patch: Partial<Milestone>) => {
    setProposalData((prev) => ({
      ...prev,
      milestones: normalizeDraftSequences(
        prev.milestones.map((m, idx) => (idx === i ? { ...m, ...patch } : m))
      ),
    }));
  };

  const removeProposalMilestone = (i: number) => {
    setProposalData((prev) => ({
      ...prev,
      milestones: normalizeDraftSequences(
        prev.milestones.filter((_, idx) => idx !== i)
      ),
    }));
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.skills.some((skill: string) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    let matchesCategory = true;
    if (categoryFilter === "submitted") {
      matchesCategory = opportunity.hasSubmitted;
    } else if (categoryFilter === "not-submitted") {
      matchesCategory = !opportunity.hasSubmitted;
    } else if (categoryFilter !== "all") {
      matchesCategory = opportunity.category
        .toLowerCase()
        .includes(categoryFilter.toLowerCase());
    }

    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (opportunity: any) => {
    setSelectedProject(opportunity);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitProposal = (opportunity: any) => {
    setSelectedProject(opportunity);
    setIsProposalModalOpen(true);
    setProposalData({
      coverLetter: "",
      bidAmount: "",
      timeline: "",
      milestones: [],
      attachments: [],
    });
  };

  const handleProposalSubmit = async () => {
    if (
      !proposalData.coverLetter ||
      !proposalData.bidAmount ||
      !proposalData.timeline
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedProject?.originalData) {
      toast.error("Invalid project data");
      return;
    }

    try {
      setSubmittingProposal(true);

      const normalized = normalizeDraftSequences(proposalData.milestones).map(
        (m) => ({
          title: (m.title || "").trim(),
          amount: Number(m.amount || 0),
          // API wants a string; ensure ISO even if user left it blank
          dueDate: m.dueDate
            ? new Date(m.dueDate).toISOString()
            : new Date().toISOString(),
          order: Number(m.sequence || 1),
        })
      );

      const proposalPayload = {
        serviceRequestId: selectedProject.originalData.id,
        bidAmount: parseFloat(proposalData.bidAmount),
        // NOTE: your Select options are strings like "1-2 weeks".
        // parseInt("1-2 weeks") => 1, which may be okay for now.
        // Later, map to days if the backend expects days.
        deliveryTime: parseInt(proposalData.timeline),
        coverLetter: proposalData.coverLetter,
        milestones: normalized.length ? normalized : undefined,
      };

      const response = await sendProposal(proposalPayload);

      if (response.success) {
        toast.success("Proposal submitted successfully!");
        setIsProposalModalOpen(false);

        // Update the opportunity status optimistically
        const updatedOpportunities = opportunities.map((opp) =>
          opp.id === selectedProject?.id
            ? {
                ...opp,
                hasSubmitted: true,
                proposals: opp.proposals + 1,
              }
            : opp
        );
        setOpportunities(updatedOpportunities);

        // Reset form
        setProposalData({
          coverLetter: "",
          bidAmount: "",
          timeline: "",
          milestones: [],
          attachments: [],
        });
      } else {
        toast.error(response.message || "Failed to submit proposal");
      }
    } catch (err) {
      console.error("Error submitting proposal:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit proposal"
      );
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setProposalData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setProposalData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Job Opportunities
            </h1>
            <p className="text-gray-600">
              Discover projects that match your skills and expertise
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              AI Recommendations
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search opportunities by title, client, or skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="submitted">Already Submitted</SelectItem>
                  <SelectItem value="not-submitted">Not Submitted</SelectItem>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="cloud">Cloud Services</SelectItem>
                  <SelectItem value="iot">IoT Solutions</SelectItem>
                  <SelectItem value="data">Data Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading opportunities...
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch available opportunities.
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error loading opportunities
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="recommended" className="space-y-6">
            <TabsList>
              <TabsTrigger value="recommended">AI Recommended</TabsTrigger>
              <TabsTrigger value="recent">Most Recent</TabsTrigger>
              <TabsTrigger value="budget">Highest Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="space-y-6">
              {filteredOpportunities.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No opportunities found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery || categoryFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "There are no opportunities available at the moment."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <Card
                    key={opportunity.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              {opportunity.title}
                            </CardTitle>
                            {opportunity.urgent && (
                              <Badge className="bg-red-100 text-red-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                            {opportunity.verified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Verified Client
                              </Badge>
                            )}
                            {opportunity.hasSubmitted && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Submitted
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {opportunity.description}
                          </CardDescription>
                        </div>
                        <Badge
                          className={`${getMatchScoreColor(
                            opportunity.matchScore
                          )} font-semibold text-sm px-3 py-1`}
                        >
                          {opportunity.matchScore}% match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={opportunity.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {opportunity.client.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{opportunity.client}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1">
                                  {opportunity.clientRating}
                                </span>
                              </div>
                              <span>•</span>
                              <span>{opportunity.clientJobs} jobs posted</span>
                              <span>•</span>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {opportunity.location}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-green-600 font-semibold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {opportunity.budget}
                          </div>
                          <p className="text-sm text-gray-500">
                            {opportunity.timeline}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {opportunity.skills.map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{opportunity.postedTime}</span>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {opportunity.proposals} proposals
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(opportunity)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitProposal(opportunity)}
                            disabled={opportunity.hasSubmitted}
                          >
                            {opportunity.hasSubmitted ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Submitted
                              </>
                            ) : (
                              <>
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Submit Proposal
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="recent">
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Recent opportunities will be displayed here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Highest budget opportunities will be displayed here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Project Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedProject?.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                Posted by {selectedProject?.client} •{" "}
                {selectedProject?.postedTime}
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <div className="space-y-6">
                {/* Project Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Project Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedProject.fullDescription}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Requirements
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {selectedProject.requirements?.map(
                          (req: string, index: number) => (
                            <li key={index}>{req}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Deliverables
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {selectedProject.deliverables?.map(
                          (deliverable: string, index: number) => (
                            <li key={index}>{deliverable}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Project Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-semibold text-green-600">
                            {selectedProject.budget}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Timeline:</span>
                          <span className="font-semibold">
                            {selectedProject.timeline}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Proposals:</span>
                          <span className="font-semibold">
                            {selectedProject.proposals}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold">
                            {selectedProject.location}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Match Score:</span>
                          <Badge
                            className={getMatchScoreColor(
                              selectedProject.matchScore
                            )}
                          >
                            {selectedProject.matchScore}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Client Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={selectedProject.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {selectedProject.client.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {selectedProject.client}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              {selectedProject.clientRating} (
                              {selectedProject.clientJobs} jobs)
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company Size:</span>
                            <span>
                              {selectedProject.clientInfo?.companySize}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Industry:</span>
                            <span>{selectedProject.clientInfo?.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Member Since:</span>
                            <span>
                              {selectedProject.clientInfo?.memberSince}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Spent:</span>
                            <span className="text-green-600 font-semibold">
                              {selectedProject.clientInfo?.totalSpent}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Skills Required */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Skills Required
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleSubmitProposal(selectedProject);
                }}
                disabled={selectedProject?.hasSubmitted}
              >
                {selectedProject?.hasSubmitted
                  ? "Already Submitted"
                  : "Submit Proposal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Proposal Submission Modal */}
        <Dialog
          open={isProposalModalOpen}
          onOpenChange={setIsProposalModalOpen}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Submit Proposal</DialogTitle>
              <DialogDescription>
                Submit your proposal for "{selectedProject?.title}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Bid Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bidAmount">Your Bid Amount (RM) *</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    placeholder="15000"
                    value={proposalData.bidAmount}
                    onChange={(e) =>
                      setProposalData((prev) => ({
                        ...prev,
                        bidAmount: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Client budget: {selectedProject?.budget}
                  </p>
                </div>
                <div>
                  <Label htmlFor="timeline">Delivery Timeline *</Label>
                  <Select
                    value={proposalData.timeline}
                    onValueChange={(value) =>
                      setProposalData((prev) => ({ ...prev, timeline: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="3+ months">3+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Introduce yourself and explain why you're the best fit for this project..."
                  className="min-h-[120px]"
                  value={proposalData.coverLetter}
                  onChange={(e) =>
                    setProposalData((prev) => ({
                      ...prev,
                      coverLetter: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  {proposalData.coverLetter.length}/1000 characters
                </p>
              </div>

              {/* Project Milestones (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Project Milestones (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProposalMilestone}
                  >
                    + Add Milestone
                  </Button>
                </div>

                {proposalData.milestones.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No milestones yet. Click “Add Milestone”.
                  </p>
                )}

                <div className="space-y-3">
                  {proposalData.milestones.map((m, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid md:grid-cols-12 gap-3">
                          <div className="md:col-span-1">
                            <label className="text-sm font-medium">Seq</label>
                            <Input type="number" value={i + 1} disabled />
                          </div>
                          <div className="md:col-span-4">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                              value={m.title}
                              onChange={(e) =>
                                updateProposalMilestone(i, {
                                  title: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-sm font-medium">
                              Amount (RM)
                            </label>
                            <Input
                              type="number"
                              value={String(m.amount ?? 0)}
                              onChange={(e) =>
                                updateProposalMilestone(i, {
                                  amount: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="text-sm font-medium">
                              Due Date
                            </label>
                            <Input
                              type="date"
                              value={(m.dueDate || "").slice(0, 10)}
                              onChange={(e) =>
                                updateProposalMilestone(i, {
                                  dueDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            rows={2}
                            value={m.description || ""}
                            onChange={(e) =>
                              updateProposalMilestone(i, {
                                description: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeProposalMilestone(i)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <Label>Attachments (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Paperclip className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload portfolio, resume, or relevant documents
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                    </p>
                  </label>
                </div>

                {/* Uploaded Files */}
                {proposalData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {proposalData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {file.name}
                        </span>
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

              {/* Proposal Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Proposal Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Your Bid:</span>
                      <span className="font-semibold">
                        RM {proposalData.bidAmount || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <span>{proposalData.timeline || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attachments:</span>
                      <span>{proposalData.attachments.length} files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProposalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProposalSubmit}
                disabled={submittingProposal}
              >
                {submittingProposal ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {submittingProposal ? "Submitting..." : "Submit Proposal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProviderLayout>
  );
}
