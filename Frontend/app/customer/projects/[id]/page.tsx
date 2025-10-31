"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Edit,
  MoreHorizontal,
  Eye,
  Send,
  Loader2,
  X,
  Check,
  MapPin,
  Paperclip,
} from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import {
  getProjectById,
  getProposalsByServiceRequest,
  acceptProjectRequest,
  rejectProjectRequest,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateCompanyProject } from "@/lib/api";
// ADD with the other imports
import {
  getCompanyProjectMilestones,
  updateCompanyProjectMilestones,
  approveCompanyMilestones,
  approveIndividualMilestone,
  payMilestone,
  type Milestone,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedProposalForAction, setSelectedProposalForAction] =
    useState<any>(null);

  // for milestone editing after accepting
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [milestonesDraft, setMilestonesDraft] = useState<Milestone[]>([]);
  const [savingMilestonesModal, setSavingMilestonesModal] = useState(false);
  const [milestoneApprovalStateModal, setMilestoneApprovalStateModal] =
    useState({
      milestonesLocked: false,
      companyApproved: false,
      providerApproved: false,
      milestonesApprovedAt: null as string | null,
    });

  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract id from params which may be a Promise in newer Next.js versions
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [edit, setEdit] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    timeline: "",
    budgetMin: "",
    budgetMax: "",
    skills: "", // comma/newline separated
    requirements: "", // one per line
    deliverables: "", // one per line
  });

  // Project milestone management
  const [milestoneEditorOpen, setMilestoneEditorOpen] = useState(false);
  const [projectMilestones, setProjectMilestones] = useState<any[]>([]);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [milestoneApprovalState, setMilestoneApprovalState] = useState({
    milestonesLocked: false,
    companyApproved: false,
    providerApproved: false,
    milestonesApprovedAt: null as string | null,
  });

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] =
    useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // controls the proposal "View Details" dialog
  const [proposalDetailsOpen, setProposalDetailsOpen] = useState(false);
  const [selectedProposalDetails, setSelectedProposalDetails] =
    useState<any>(null);

  // controls the post-accept milestone review/approval dialog
  const [milestoneFinalizeOpen, setMilestoneFinalizeOpen] = useState(false);

  // Turn array | string | object into a string[] for bullet lists
  const toList = (v: any): string[] => {
    if (v == null) return [];
    if (Array.isArray(v))
      return v
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
    if (typeof v === "string")
      return v
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
    if (typeof v === "object") {
      try {
        // Flatten simple objects into "key: value" points
        return Object.entries(v)
          .flatMap(([k, val]) => {
            if (Array.isArray(val)) return val.map((x) => `${k}: ${String(x)}`);
            if (val && typeof val === "object")
              return `${k}: ${JSON.stringify(val)}`;
            return `${k}: ${String(val)}`;
          })
          .filter(Boolean);
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (!project) return;
    setEdit({
      title: project.title ?? "",
      description: project.description ?? "",
      category: project.category ?? "",
      priority: project.priority ?? "",
      timeline: project.timeline ?? "",
      budgetMin: project.budgetMin?.toString?.() ?? "",
      budgetMax: project.budgetMax?.toString?.() ?? "",
      skills: (Array.isArray(project.skills) ? project.skills : []).join(", "),
      requirements: toList(project.requirements).join("\n"),
      deliverables: toList(project.deliverables).join("\n"),
    });
  }, [project]);

  const toLines = (s: string) =>
    s
      .split(/\r?\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);

  useEffect(() => {
    let mounted = true;
    Promise.resolve(params)
      .then((p: any) => {
        if (mounted) setResolvedId(p?.id ?? null);
      })
      .catch(() => {
        if (mounted) setResolvedId(null);
      });
    return () => {
      mounted = false;
    };
  }, [params]);

  // Safe formatter for numbers - prevents calling toLocaleString on undefined
  const fmt = (v: any, fallback = "0") => {
    if (v === null || v === undefined) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : fallback;
  };

  // Ensure a value is an array before mapping
  const asArray = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!resolvedId) {
          setError("Invalid project id");
          setLoading(false);
          return;
        }
        const response = await getProjectById(resolvedId);

        if (response.success) {
          setProject(response.project);

          // If it's a ServiceRequest, fetch proposals
          if (response.project.type === "ServiceRequest") {
            const proposalsResponse = await getProposalsByServiceRequest(
              resolvedId
            );
            if (proposalsResponse.success) {
              setProposals(proposalsResponse.proposals || []);
            }
          }
        } else {
          setError("Failed to fetch project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [resolvedId]);

  // Load project milestones
  useEffect(() => {
    (async () => {
      if (project?.type !== "Project" || !project?.id) return;
      try {
        const milestoneData = await getCompanyProjectMilestones(project.id);
        setProjectMilestones(
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
      } catch (e) {
        console.warn("Failed to load project milestones:", e);
      }
    })();
  }, [project?.id, project?.type]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading project...</span>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !project) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error loading project
            </h3>
            <p className="text-gray-600 mb-4">{error || "Project not found"}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const norm = (s: any) => String(s || "").toUpperCase();

  const getStatusColor = (status: string) => {
    const S = norm(status);
    switch (S) {
      case "COMPLETED":
      case "PAID":
        return "bg-green-100 text-green-800";
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "LOCKED":
        return "bg-purple-100 text-purple-800";
      case "OPEN":
      case "PENDING":
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ON_HOLD":
      case "CANCELLED":
      case "REJECTED":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    const S = norm(status);
    switch (S) {
      case "COMPLETED":
        return "Completed";
      case "PAID":
        return "Paid";
      case "APPROVED":
        return "Approved";
      case "SUBMITTED":
        return "Submitted";
      case "IN_PROGRESS":
        return "In Progress";
      case "LOCKED":
        return "Locked";
      case "OPEN":
      case "PENDING":
        return "Pending";
      case "DRAFT":
        return "Draft";
      case "ON_HOLD":
        return "On Hold";
      case "CANCELLED":
        return "Cancelled";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "SUBMITTED":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "LOCKED":
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      case "PENDING":
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case "DRAFT":
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Helpers for project milestone editor
  const normalizeMilestoneSequences = (items: Milestone[]) =>
    items
      .map((m, i) => ({ ...m, sequence: i + 1 }))
      .sort((a, b) => a.sequence - b.sequence);

  const addProjectMilestone = () => {
    setProjectMilestones((prev) =>
      normalizeMilestoneSequences([
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

  const updateProjectMilestone = (i: number, patch: Partial<Milestone>) => {
    setProjectMilestones((prev) =>
      normalizeMilestoneSequences(
        prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m))
      )
    );
  };

  const removeProjectMilestone = (i: number) => {
    setProjectMilestones((prev) =>
      normalizeMilestoneSequences(prev.filter((_, idx) => idx !== i))
    );
  };

  // Normalize project data to safe arrays to avoid runtime errors
  const safeProject = project ?? {};
  const skills = asArray<string>(safeProject.skills);
  const requirements = toList(safeProject.requirements);
  const deliverables = toList(safeProject.deliverables);
  const milestones = asArray<any>(safeProject.milestones);
  const bids = asArray<any>(safeProject.bids);
  const files = asArray<any>(safeProject.files);
  const messages = asArray<any>(safeProject.messages);
  // ⬇️ ADD THIS just after you define `project` (and `proposals` if present)
  const currency = project?.currency ?? "RM";
  const viewCount = Number(project?.viewCount ?? 0);
  const bidCount = Number(
    project?.bidCount ?? (Array.isArray(proposals) ? proposals.length : 0)
  );
  const startDate = project?.startDate ? new Date(project.startDate) : null;
  const endDate = project?.endDate ? new Date(project.endDate) : null;

  const handleSave = async () => {
    try {
      const payload: any = {
        title: edit.title,
        description: edit.description,
        category: edit.category,
        priority: edit.priority,
        timeline: edit.timeline,
      };

      if (edit.budgetMin) payload.budgetMin = Number(edit.budgetMin);
      if (edit.budgetMax) payload.budgetMax = Number(edit.budgetMax);

      const skillsArr = toLines(edit.skills);
      if (skillsArr.length) payload.skills = skillsArr;

      const reqArr = toLines(edit.requirements);
      const delArr = toLines(edit.deliverables);
      payload.requirements = reqArr; // backend expects string[]
      payload.deliverables = delArr; // backend expects string[]

      const { project: updated } = await updateCompanyProject(
        project.id,
        payload
      );
      setProject(updated);
      toast({ title: "Saved", description: "Project updated successfully." });
      setIsEditOpen(false);
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

  // ADD - save draft
  const handleSaveProjectMilestones = async () => {
    if (!project?.id) return;
    try {
      setSavingMilestones(true);
      const payload = normalizeMilestoneSequences(projectMilestones).map(
        (m) => ({
          ...m,
          amount: Number(m.amount),
          dueDate: new Date(m.dueDate).toISOString(), // ensure ISO
        })
      );
      const res = await updateCompanyProjectMilestones(project.id, payload);
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

  // ADD - confirm
  const handleApproveProjectMilestones = async () => {
    if (!project?.id) return;
    try {
      const res = await approveCompanyMilestones(project.id);

      setMilestoneApprovalState({
        milestonesLocked: res.milestonesLocked,
        companyApproved: res.companyApproved,
        providerApproved: res.providerApproved,
        milestonesApprovedAt: res.milestonesApprovedAt,
      });

      // Always close the inline milestone editor
      setMilestoneEditorOpen(false);

      // Toast feedback
      toast({
        title: "Milestones approved",
        description: res.milestonesLocked
          ? "Milestones are now locked. Work can start."
          : "Waiting for provider to approve.",
      });

      // Pop the finalize/summary dialog
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

  // Approve individual milestone
  const handleApproveIndividualMilestone = async (milestoneId: string) => {
    try {
      await approveIndividualMilestone(milestoneId);
      toast({
        title: "Milestone approved",
        description:
          "The milestone has been approved and is ready for payment.",
      });
      // Reload project data to reflect the change
      window.location.reload();
    } catch (e) {
      toast({
        title: "Approval failed",
        description:
          e instanceof Error ? e.message : "Could not approve milestone",
        variant: "destructive",
      });
    }
  };

  // Reject milestone (request changes)
  const handleRejectMilestone = async (milestoneId: string) => {
    try {
      // For now, just show a message. In the future, this could open a dialog for feedback
      toast({
        title: "Feature coming soon",
        description:
          "Milestone rejection functionality will be available soon.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not process request",
        variant: "destructive",
      });
    }
  };

  // Handle payment button click
  const handlePayMilestone = (milestoneId: string, amount: number) => {
    const milestone = projectMilestones.find((m) => m.id === milestoneId);
    if (milestone) {
      setSelectedMilestoneForPayment(milestone);
      setPaymentDialogOpen(true);
    }
  };

  // Accept proposal from Bids tab
  const handleAcceptProposal = async (proposal: any) => {
    try {
      setProcessingId(proposal.id);

      // accept on backend (true = auto create project / link)
      const response = await acceptProjectRequest(proposal.id, true);

      // new project id that was created/matched
      const newProjectId = response?.id || response?.project?.id;

      // optimistic UI: mark proposal as accepted in local proposals state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id ? { ...p, status: "ACCEPTED" } : p
        )
      );

      // if we got a project id, pull milestones for editing
      if (newProjectId) {
        const milestoneData = await getCompanyProjectMilestones(newProjectId);

        setMilestonesDraft(
          Array.isArray(milestoneData.milestones)
            ? milestoneData.milestones.map((m: any) => ({
                ...m,
                sequence: m.order,
              }))
            : []
        );

        setMilestoneApprovalStateModal({
          milestonesLocked: milestoneData.milestonesLocked,
          companyApproved: milestoneData.companyApproved,
          providerApproved: milestoneData.providerApproved,
          milestonesApprovedAt: milestoneData.milestonesApprovedAt,
        });

        setActiveProjectId(newProjectId);
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

  // Save milestones after accept (inside modal)
  const handleSaveAcceptedMilestones = async () => {
    if (!activeProjectId) return;
    try {
      setSavingMilestonesModal(true);

      const payload = milestonesDraft
        .map((m, i) => ({
          ...m,
          sequence: i + 1,
          amount: Number(m.amount),
          dueDate: new Date(m.dueDate).toISOString(),
        }))
        .sort((a, b) => a.sequence - b.sequence);

      const res = await updateCompanyProjectMilestones(
        activeProjectId,
        payload
      );

      setMilestoneApprovalStateModal({
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
      setSavingMilestonesModal(false);
    }
  };

  // Approve milestones after editing (inside modal)
  const handleApproveAcceptedMilestones = async () => {
    if (!activeProjectId) return;

    try {
      const res = await approveCompanyMilestones(activeProjectId);

      // sync the approval state shown in the finalize dialog
      setMilestoneApprovalStateModal({
        milestonesLocked: res.milestonesLocked,
        companyApproved: res.companyApproved,
        providerApproved: res.providerApproved,
        milestonesApprovedAt: res.milestonesApprovedAt,
      });

      // 1. ALWAYS close the milestone editor dialog
      setMilestonesOpen(false);

      // 2. Show success toast
      toast({
        title: "Milestones approved",
        description: res.milestonesLocked
          ? "Milestones are now locked. Work can start."
          : "Waiting for provider approval.",
      });

      // 3. Open the summary/status dialog
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

  // Reject proposal flow
  const handleStartRejectProposal = (proposal: any) => {
    setSelectedProposalForAction(proposal);
    setRejectDialogOpen(true);
  };

  const handleConfirmRejectProposal = async () => {
    if (!selectedProposalForAction) return;
    try {
      setProcessingId(selectedProposalForAction.id);

      await rejectProjectRequest(selectedProposalForAction.id, rejectReason);

      // optimistic UI
      setProposals((prev) =>
        prev.map((p) =>
          p.id === selectedProposalForAction.id
            ? { ...p, status: "REJECTED" }
            : p
        )
      );

      // cleanup
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedProposalForAction(null);

      toast({
        title: "Request Rejected",
        description: "The provider has been notified.",
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

  // Process milestone payment
  const handleProcessPayment = async () => {
    if (!selectedMilestoneForPayment) return;

    try {
      setProcessingPayment(true);
      await payMilestone(selectedMilestoneForPayment.id);

      toast({
        title: "Payment processed",
        description: `Payment of RM ${selectedMilestoneForPayment.amount} has been processed successfully.`,
      });

      setPaymentDialogOpen(false);
      setSelectedMilestoneForPayment(null);

      // Reload project data to reflect the change
      window.location.reload();
    } catch (e) {
      toast({
        title: "Payment failed",
        description:
          e instanceof Error ? e.message : "Could not process payment",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.title}
              </h1>
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
              {project.priority === "high" && (
                <Badge variant="destructive">High Priority</Badge>
              )}
              {project.isFeatured && (
                <Badge className="bg-purple-100 text-purple-800">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewCount} views
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {bidCount} bids
              </div>
              {startDate && endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {startDate.toLocaleDateString()} -{" "}
                  {endDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>

            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Provider
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-2xl font-bold">
                    {currency} {fmt(project.budget)}
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
                  <p className="text-sm text-gray-500">Spent</p>
                  <p className="text-2xl font-bold">
                    {project.currency} {fmt(project.spent)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-2xl font-bold">{project.progress}%</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"
                    style={{ animationDuration: "2s" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Days Left</p>
                  <p className="text-2xl font-bold">
                    {Math.ceil(
                      (new Date(project.endDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {project.status === "in_progress" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Overall Progress</h3>
                <span className="text-sm text-gray-500">
                  {project.progress}% Complete
                </span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Assigned Provider */}
        {project.assignedProvider && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        project.assignedProvider.avatar || "/placeholder.svg"
                      }
                    />
                    <AvatarFallback>
                      {project.assignedProvider.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {project.assignedProvider.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{project.assignedProvider.rating}</span>
                      </div>
                      <span>•</span>
                      <span>
                        {project.assignedProvider.completedJobs} jobs completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-gray-600">{project.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.startDate).toLocaleDateString()} -{" "}
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Track progress through key project milestones
                </CardDescription>
                {project?.type === "Project" && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline">
                      Company{" "}
                      {milestoneApprovalState.companyApproved ? "✓" : "✗"} ·
                      Provider{" "}
                      {milestoneApprovalState.providerApproved ? "✓" : "✗"}
                      {milestoneApprovalState.milestonesLocked && " · LOCKED"}
                    </Badge>
                    {!milestoneApprovalState.milestonesLocked && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setMilestoneEditorOpen(true)}
                        >
                          Edit Milestones
                        </Button>
                        <Button onClick={handleApproveProjectMilestones}>
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projectMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getMilestoneStatusIcon(milestone.status)}
                        {index < projectMilestones.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(milestone.status)}>
                              {getStatusText(milestone.status)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {fmt(milestone.amount)} {project.currency}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {milestone.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due:{" "}
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                          {milestone.completedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Completed:{" "}
                              {new Date(
                                milestone.completedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {milestone.status === "in_progress" &&
                          milestone.progress && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{milestone.progress}%</span>
                              </div>
                              <Progress
                                value={milestone.progress}
                                className="h-2"
                              />
                            </div>
                          )}
                        {milestone.status === "SUBMITTED" && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApproveIndividualMilestone(milestone.id)
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Milestone
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRejectMilestone(milestone.id)
                              }
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Request Changes
                            </Button>
                          </div>
                        )}
                        {milestone.status === "APPROVED" && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handlePayMilestone(
                                  milestone.id,
                                  milestone.amount
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay Milestone
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Received Proposals ({proposals.length})</CardTitle>
                <CardDescription>
                  Review and manage proposals from providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {proposals.map((p: any) => (
                    <div
                      key={p.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Provider Info (matches requests page layout) */}
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={p.provider?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {(p.provider?.name || "P").charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            {/* Name + rating */}
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {p.provider?.name || "Provider"}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {p.provider?.rating ?? "—"}
                                </span>
                              </div>
                            </div>

                            {/* You can add location / response time later if that data exists on p.provider */}

                            {/* Cover letter (short preview) */}
                            {p.coverLetter && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {p.coverLetter}
                              </p>
                            )}

                            {/* Skills preview if provider has skills */}
                            {Array.isArray(p.provider?.skills) &&
                              p.provider.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {p.provider.skills
                                    .slice(0, 3)
                                    .map((skill: string) => (
                                      <Badge
                                        key={skill}
                                        variant="secondary"
                                        className="text-[10px] leading-tight"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  {p.provider.skills.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] leading-tight"
                                    >
                                      +{p.provider.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Proposal Details + Actions (right column, like requests page) */}
                        <div className="lg:w-80 space-y-3">
                          {/* status + submitted date */}
                          <div className="flex justify-between items-center">
                            <Badge className={getStatusColor(p.status)}>
                              {getStatusText(p.status)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString()
                                : ""}
                            </span>
                          </div>

                          {/* bid / timeline */}
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">
                                Bid Amount
                              </p>
                              <p className="font-semibold text-lg">
                                RM {Number(p.bidAmount ?? 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Timeline</p>
                              <p className="font-medium">
                                {p.deliveryTime
                                  ? `${p.deliveryTime} days`
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          {/* milestones mini list */}
                          {!!p.milestones?.length && (
                            <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                              <div className="font-medium text-gray-900 mb-1">
                                Proposed Milestones
                              </div>
                              <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                {p.milestones.map((m: any) => (
                                  <li
                                    key={m.id || m.sequence}
                                    className="flex justify-between"
                                  >
                                    <span className="truncate">{m.title}</span>
                                    <span>
                                      RM {Number(m.amount).toLocaleString()}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* actions */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {/* View profile */}
                            {p.provider?.id && (
                              <a
                                href={`/customer/providers/${p.provider.id}`}
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
                              </a>
                            )}

                            {/* View details dialog (re-use your own Dialog in this page later if you add it) */}
                            {/* For now we'll give a placeholder button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedProposalDetails(p);
                                setProposalDetailsOpen(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              View Details
                            </Button>

                            {/* Accept / Reject only if status is PENDING */}
                            {String(p.status).toUpperCase() === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptProposal(p)}
                                  className="bg-green-600 hover:bg-green-700 flex-1"
                                  disabled={processingId === p.id}
                                >
                                  {processingId === p.id ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-1" />
                                  )}
                                  {processingId === p.id
                                    ? "Accepting..."
                                    : "Accept"}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartRejectProposal(p)}
                                  className="text-red-600 hover:text-red-700 flex-1"
                                  disabled={processingId === p.id}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {proposals.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No proposals yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
                <CardDescription>
                  Documents and files related to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.size} • Uploaded{" "}
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Messages</CardTitle>
                <CardDescription>
                  Communication with your assigned provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "You" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {message.sender.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex-1 max-w-xs ${
                          message.sender === "You" ? "text-right" : ""
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender === "You"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-opacity-20">
                                {asArray<string>(message.attachments).map(
                                  (attachment, index) => (
                                    <div
                                      key={index}
                                      className="text-xs opacity-75"
                                    >
                                      📎 {attachment}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={edit.description}
                onChange={(e) =>
                  setEdit({ ...edit, description: e.target.value })
                }
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={edit.category}
                  onChange={(e) =>
                    setEdit({ ...edit, category: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  value={edit.priority}
                  onChange={(e) =>
                    setEdit({ ...edit, priority: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Timeline</Label>
                <Input
                  value={edit.timeline}
                  onChange={(e) =>
                    setEdit({ ...edit, timeline: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Budget Min</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={edit.budgetMin}
                  onChange={(e) =>
                    setEdit({ ...edit, budgetMin: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Budget Max</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={edit.budgetMax}
                  onChange={(e) =>
                    setEdit({ ...edit, budgetMax: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Skills (comma / new line)</Label>
              <Textarea
                rows={2}
                placeholder="React, Node.js, PostgreSQL"
                value={edit.skills}
                onChange={(e) => setEdit({ ...edit, skills: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Requirements (one per line)</Label>
                <Textarea
                  rows={4}
                  placeholder={"Cross-platform app\nUser auth\nPayments"}
                  value={edit.requirements}
                  onChange={(e) =>
                    setEdit({ ...edit, requirements: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Deliverables (one per line)</Label>
                <Textarea
                  rows={4}
                  placeholder={"Source code\nAdmin panel\nAPI docs"}
                  value={edit.deliverables}
                  onChange={(e) =>
                    setEdit({ ...edit, deliverables: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Edit className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={milestoneEditorOpen} onOpenChange={setMilestoneEditorOpen}>
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
            {projectMilestones.map((m, i) => (
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
                          updateProjectMilestone(i, { title: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        value={String(m.amount ?? 0)}
                        onChange={(e) =>
                          updateProjectMilestone(i, {
                            amount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={(m.dueDate || "").slice(0, 10)}
                        onChange={(e) =>
                          updateProjectMilestone(i, { dueDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      rows={2}
                      value={m.description || ""}
                      onChange={(e) =>
                        updateProjectMilestone(i, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => removeProjectMilestone(i)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={addProjectMilestone}>
                + Add Milestone
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveProjectMilestones}
                  disabled={savingMilestones}
                >
                  {savingMilestones ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={handleApproveProjectMilestones}>
                  Approve
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Milestone Payment</DialogTitle>
            <DialogDescription>
              Confirm payment for the milestone work
            </DialogDescription>
          </DialogHeader>

          {selectedMilestoneForPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">
                  {selectedMilestoneForPayment.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedMilestoneForPayment.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount to pay:</span>
                  <span className="text-lg font-semibold text-green-600">
                    RM {selectedMilestoneForPayment.amount}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Payment Method
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  This is a temporary payment dialog. In production, this would
                  integrate with payment gateways like Stripe, FPX, or other
                  payment methods.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={processingPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Process Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Proposal</DialogTitle>
            <DialogDescription>
              Let the provider know why you're rejecting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Label htmlFor="rejectReason">Reason / message to provider</Label>
            <Textarea
              id="rejectReason"
              placeholder="Example: Budget is too high, timeline not suitable..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
                setSelectedProposalForAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejectProposal}
              disabled={processingId === selectedProposalForAction?.id}
            >
              {processingId === selectedProposalForAction?.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {processingId === selectedProposalForAction?.id
                ? "Rejecting..."
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proposal Details Dialog (View Details) */}
      <Dialog
        open={proposalDetailsOpen}
        onOpenChange={(open) => {
          setProposalDetailsOpen(open);
          if (!open) {
            setSelectedProposalDetails(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Proposal Details</DialogTitle>
            <DialogDescription>
              Full proposal from{" "}
              {selectedProposalDetails?.provider?.name || "Provider"}
            </DialogDescription>
          </DialogHeader>

          {selectedProposalDetails && (
            <div className="space-y-6">
              {/* Provider Header */}
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={
                      selectedProposalDetails.provider?.avatar ||
                      "/placeholder.svg"
                    }
                  />
                  <AvatarFallback>
                    {(selectedProposalDetails.provider?.name || "P")
                      .split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedProposalDetails.provider?.name || "Provider"}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>
                        {selectedProposalDetails.provider?.rating ??
                          "No rating"}
                      </span>
                    </div>

                    {selectedProposalDetails.provider?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {selectedProposalDetails.provider?.location}
                        </span>
                      </div>
                    )}

                    {selectedProposalDetails.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Submitted{" "}
                          {new Date(
                            selectedProposalDetails.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bid / Timeline / Attachments Summary */}
              <Card>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Bid Amount</div>
                    <div className="text-lg font-semibold text-gray-900">
                      RM{" "}
                      {Number(
                        selectedProposalDetails.bidAmount || 0
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Timeline</div>
                    <div className="font-medium text-gray-900">
                      {selectedProposalDetails.deliveryTime
                        ? `${selectedProposalDetails.deliveryTime} days`
                        : "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Attachments</div>
                    <div className="font-medium text-gray-900">
                      {Array.isArray(selectedProposalDetails.attachmentUrls)
                        ? `${selectedProposalDetails.attachmentUrls.length} file(s)`
                        : "0 file(s)"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cover Letter */}
              {selectedProposalDetails.coverLetter && (
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedProposalDetails.coverLetter}
                  </p>
                </div>
              )}

              {/* Milestones */}
              {Array.isArray(selectedProposalDetails.milestones) &&
                selectedProposalDetails.milestones.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Proposed Milestones</h4>

                    <div className="space-y-4">
                      {selectedProposalDetails.milestones
                        .slice()
                        .sort(
                          (a: any, b: any) =>
                            (a.sequence ?? a.order ?? 0) -
                            (b.sequence ?? b.order ?? 0)
                        )
                        .map((m: any, idx: number) => (
                          <Card key={idx} className="border border-gray-200">
                            <CardContent className="p-4 space-y-2 text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    #{m.sequence ?? m.order ?? idx + 1}
                                  </Badge>
                                  <span className="font-medium text-gray-900">
                                    {m.title || "Untitled milestone"}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <div className="text-gray-500 text-xs">
                                    Amount
                                  </div>
                                  <div className="text-lg font-semibold text-gray-900">
                                    RM {Number(m.amount || 0).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {m.description && (
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {m.description}
                                </p>
                              )}

                              <div className="text-gray-600 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Due:{" "}
                                    {m.dueDate
                                      ? new Date(m.dueDate).toLocaleDateString()
                                      : "—"}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* Total vs Bid */}
                    <div className="text-xs text-gray-700 font-medium pt-3 border-t">
                      {(() => {
                        const total = selectedProposalDetails.milestones.reduce(
                          (sum: number, mm: any) =>
                            sum + (Number(mm.amount) || 0),
                          0
                        );
                        return (
                          <>
                            Milestones total: RM {total.toLocaleString()} <br />
                            Provider bid: RM{" "}
                            {Number(
                              selectedProposalDetails.bidAmount || 0
                            ).toLocaleString()}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

              {/* Attachments list */}
              {Array.isArray(selectedProposalDetails.attachmentUrls) &&
                selectedProposalDetails.attachmentUrls.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" /> Attachments
                    </h4>

                    <ul className="space-y-2 text-sm">
                      {selectedProposalDetails.attachmentUrls.map(
                        (url: string, i: number) => {
                          const fileName =
                            url.split("/").pop() || `File ${i + 1}`;
                          return (
                            <li
                              key={i}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded border hover:bg-gray-100 transition"
                            >
                              <div className="flex items-center gap-2 text-gray-700 truncate">
                                <Paperclip className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{fileName}</span>
                              </div>
                              <a
                                className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-4 h-4" /> View
                              </a>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProposalDetailsOpen(false);
                setSelectedProposalDetails(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestones Finalized Dialog */}
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
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">
                  Company Approved
                </div>
                <div>
                  {milestoneApprovalStateModal.companyApproved
                    ? "You have approved the milestone plan."
                    : "You haven't approved yet."}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  milestoneApprovalStateModal.providerApproved
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Provider Approved
                </div>
                <div>
                  {milestoneApprovalStateModal.providerApproved
                    ? "Provider approved the milestone plan."
                    : "Waiting for provider approval."}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  milestoneApprovalStateModal.milestonesLocked
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Locked & Ready
                </div>
                <div>
                  {milestoneApprovalStateModal.milestonesLocked
                    ? "Milestones are locked. Work can start and payments will follow these milestones."
                    : "Milestones are not locked yet."}
                </div>
                {milestoneApprovalStateModal.milestonesApprovedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Locked at{" "}
                    {new Date(
                      milestoneApprovalStateModal.milestonesApprovedAt
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
