"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
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
  Send
} from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"
import { getProviderProjectById, updateProviderProjectStatus, updateProviderMilestoneStatus, getProviderProjectMilestones, updateProviderProjectMilestones, approveProviderMilestones, type Milestone } from "@/lib/api"

export default function ProviderProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null)
  const [milestoneDeliverables, setMilestoneDeliverables] = useState("")
  const [updating, setUpdating] = useState(false)
  
  // Project milestone management
  const [milestoneEditorOpen, setMilestoneEditorOpen] = useState(false)
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([])
  const [savingMilestones, setSavingMilestones] = useState(false)
  const [milestoneApprovalState, setMilestoneApprovalState] = useState({
    milestonesLocked: false,
    companyApproved: false,
    providerApproved: false,
    milestonesApprovedAt: null as string | null,
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getProviderProjectById(params.id as string)
        
        if (response.success) {
          setProject(response.project)
        } else {
          setError("Failed to fetch project details")
        }
      } catch (err) {
        console.error("Error fetching project:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch project")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  // Load project milestones
  useEffect(() => {
    (async () => {
      if (!project?.id) return;
      try {
        const milestoneData = await getProviderProjectMilestones(project.id);
        setProjectMilestones(
          Array.isArray(milestoneData.milestones) 
            ? milestoneData.milestones.map(m => ({ ...m, sequence: m.order }))
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
  }, [project?.id]);

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

  // Save project milestones
  const handleSaveProjectMilestones = async () => {
    if (!project?.id) return;
    try {
      setSavingMilestones(true);
      const payload = normalizeMilestoneSequences(projectMilestones).map((m) => ({
        ...m,
        amount: Number(m.amount),
        dueDate: new Date(m.dueDate).toISOString(), // ensure ISO
      }));
      const res = await updateProviderProjectMilestones(project.id, payload);
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

  // Approve project milestones
  const handleApproveProjectMilestones = async () => {
    if (!project?.id) return;
    try {
      const res = await approveProviderMilestones(project.id);
      setMilestoneApprovalState({
        milestonesLocked: res.milestonesLocked,
        companyApproved: res.companyApproved,
        providerApproved: res.providerApproved,
        milestonesApprovedAt: res.milestonesApprovedAt,
      });
      
      if (res.locked) {
        toast({
          title: "Milestones approved and locked",
          description: "Both parties have approved. Milestones are now locked.",
        });
        setMilestoneEditorOpen(false);
      } else {
        toast({
          title: "Approved",
          description: "Waiting for company to approve.",
        });
      }
    } catch (e) {
      toast({
        title: "Approval failed",
        description:
          e instanceof Error ? e.message : "Could not approve milestones",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true)
      const response = await updateProviderProjectStatus(params.id as string, newStatus)
      
      if (response.success) {
        setProject(response.project)
        toast({
          title: "Success",
          description: "Project status updated successfully",
        })
        setIsStatusDialogOpen(false)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleMilestoneUpdate = async (status: string) => {
    try {
      setUpdating(true)
      const response = await updateProviderMilestoneStatus(
        selectedMilestone.id, 
        status, 
        milestoneDeliverables ? { description: milestoneDeliverables } : undefined
      )
      
      if (response.success) {
        // Refresh project data
        const projectResponse = await getProviderProjectById(params.id as string)
        if (projectResponse.success) {
          setProject(projectResponse.project)
        }
        toast({
          title: "Success",
          description: "Milestone updated successfully",
        })
        setIsMilestoneDialogOpen(false)
        setSelectedMilestone(null)
        setMilestoneDeliverables("")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update milestone",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "DISPUTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed"
      case "IN_PROGRESS":
        return "In Progress"
      case "DISPUTED":
        return "Disputed"
      default:
        return status
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "APPROVED":
        return "bg-green-100 text-green-700"
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "LOCKED":
        return "bg-purple-100 text-purple-800"
      case "PENDING":
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid"
      case "APPROVED":
        return "Approved"
      case "SUBMITTED":
        return "Submitted"
      case "IN_PROGRESS":
        return "In Progress"
      case "LOCKED":
        return "Locked"
      case "PENDING":
        return "Pending"
      case "DRAFT":
        return "Draft"
      case "REJECTED":
        return "Rejected"
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading project...</h3>
            <p className="text-gray-600">Please wait while we fetch the project details.</p>
          </div>
        </div>
      </ProviderLayout>
    )
  }

  if (error || !project) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading project</h3>
            <p className="text-gray-600 mb-4">{error || "Project not found"}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </ProviderLayout>
    )
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Client
            </Button>
            {project.status === "IN_PROGRESS" && (
              <Button onClick={() => setIsStatusDialogOpen(true)}>
                Update Status
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
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
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
                        <Label className="text-sm font-medium text-gray-500">Category</Label>
                        <p className="text-lg">{project.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Budget Range</Label>
                        <p className="text-lg">{formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                        <p className="text-lg">{project.timeline || "Not specified"}</p>
                      </div>
                    </div>

                    {project.skills && project.skills.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Required Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.requirements && project.requirements.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Requirements</Label>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {project.requirements.map((req: string, index: number) => (
                            <li key={index} className="text-gray-700">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.deliverables && project.deliverables.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Deliverables</Label>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {project.deliverables.map((del: string, index: number) => (
                            <li key={index} className="text-gray-700">{del}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progress */}
                {project.status === "IN_PROGRESS" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-3" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{project.completedMilestones || 0} of {project.totalMilestones || 0} milestones completed</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="milestones" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Milestones</CardTitle>
                    <CardDescription>
                      Track and manage project milestones
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <Badge variant="outline">
                        Company {milestoneApprovalState.companyApproved ? "✓" : "✗"} · 
                        Provider {milestoneApprovalState.providerApproved ? "✓" : "✗"}
                        {milestoneApprovalState.milestonesLocked && " · LOCKED"}
                      </Badge>
                      {!milestoneApprovalState.milestonesLocked && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMilestoneEditorOpen(true)}
                          >
                            Edit Milestones
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleApproveProjectMilestones}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.milestones && project.milestones.length > 0 ? (
                        project.milestones.map((milestone: any, index: number) => (
                          <div key={milestone.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                  {milestone.order}
                                </div>
                                <div>
                                  <h4 className="font-medium">{milestone.title}</h4>
                                  <p className="text-sm text-gray-600">{milestone.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={getMilestoneStatusColor(milestone.status)}>
                                  {getMilestoneStatusText(milestone.status)}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {formatCurrency(milestone.amount)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>Due: {formatDate(milestone.dueDate)}</span>
                              <div className="flex items-center gap-2">
                                {milestone.status === "PAID" && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-sm font-medium">Paid</span>
                                  </div>
                                )}
                                {milestone.status === "LOCKED" && project.status === "IN_PROGRESS" && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedMilestone(milestone)
                                      setIsMilestoneDialogOpen(true)
                                    }}
                                  >
                                    Start Work
                                  </Button>
                                )}
                                {milestone.status === "IN_PROGRESS" && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedMilestone(milestone)
                                      setIsMilestoneDialogOpen(true)
                                    }}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-8">No milestones found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Messages</CardTitle>
                    <CardDescription>
                      Communicate with your client
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {project.messages && project.messages.length > 0 ? (
                      <div className="space-y-4">
                        {project.messages.map((message: any, index: number) => (
                          <div key={message.id} className="flex gap-3">
                            <Avatar>
                              <AvatarImage src={message.sender?.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{message.sender?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{message.sender?.name}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(message.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">No messages yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={project.customer?.customerProfile?.logoUrl || "/placeholder.svg"} />
                    <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.customer?.name}</p>
                    <p className="text-sm text-gray-600">{project.customer?.email}</p>
                  </div>
                </div>
                
                {project.customer?.customerProfile && (
                  <div className="space-y-2 text-sm">
                    {project.customer.customerProfile.industry && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{project.customer.customerProfile.industry}</span>
                      </div>
                    )}
                    {project.customer.customerProfile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{project.customer.customerProfile.location}</span>
                      </div>
                    )}
                    {project.customer.customerProfile.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a 
                          href={project.customer.customerProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Milestones</span>
                  <span className="font-medium">{project.totalMilestones || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">{project.completedMilestones || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(project.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Project Status</DialogTitle>
              <DialogDescription>
                Update the current status of this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Mark as Completed
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate("DISPUTED")}
                  disabled={updating}
                  variant="destructive"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                  Report Dispute
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Milestone Update Dialog */}
        <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedMilestone?.status === "LOCKED" ? "Start Milestone Work" : "Submit Milestone"}
              </DialogTitle>
              <DialogDescription>
                {selectedMilestone?.status === "LOCKED" 
                  ? "Start working on this milestone" 
                  : "Submit your work for this milestone"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deliverables">Deliverables / Notes</Label>
                <Textarea
                  id="deliverables"
                  placeholder="Describe what you've completed or any notes..."
                  value={milestoneDeliverables}
                  onChange={(e) => setMilestoneDeliverables(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMilestoneDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleMilestoneUpdate(selectedMilestone?.status === "LOCKED" ? "IN_PROGRESS" : "SUBMITTED")}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {selectedMilestone?.status === "LOCKED" ? "Start Work" : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Milestone Editor Dialog */}
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
                        <Label className="text-sm font-medium">Seq</Label>
                        <Input type="number" value={i + 1} disabled />
                      </div>
                      <div className="md:col-span-4">
                        <Label className="text-sm font-medium">Title</Label>
                        <Input
                          value={m.title}
                          onChange={(e) =>
                            updateProjectMilestone(i, { title: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-sm font-medium">Amount</Label>
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
                        <Label className="text-sm font-medium">Due Date</Label>
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
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        rows={2}
                        value={m.description || ""}
                        onChange={(e) =>
                          updateProjectMilestone(i, { description: e.target.value })
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
                  <Button onClick={handleApproveProjectMilestones}>Approve</Button>
                </div>
              </div>
            </div>

            <DialogFooter />
          </DialogContent>
        </Dialog>
      </div>
    </ProviderLayout>
  )
}
