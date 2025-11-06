"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminProjectById,
  updateAdminProject,
  getDisputesByProject,
} from "@/lib/api"
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Paperclip,
  Download,
} from "lucide-react"
import Link from "next/link"
import { formatTimeline } from "@/lib/timeline-utils"

export default function AdminProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [disputes, setDisputes] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    loadProject()
    loadDisputes()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const response = await getAdminProjectById(projectId)
      if (response.success) {
        setProject(response.data)
        initializeFormData(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDisputes = async () => {
    try {
      const response = await getDisputesByProject(projectId)
      if (response.success) {
        setDisputes(response.data || [])
      }
    } catch (error: any) {
      console.error("Failed to load disputes:", error)
    }
  }

  const initializeFormData = (projectData: any) => {
    setFormData({
      title: projectData.title || "",
      description: projectData.description || "",
      category: projectData.category || "",
      budgetMin: projectData.budgetMin || 0,
      budgetMax: projectData.budgetMax || 0,
      timeline: projectData.timeline || "",
      priority: projectData.priority || "medium",
      status: projectData.status || "IN_PROGRESS",
    })
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setSaving(true)
      const response = await updateAdminProject(projectId, formData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
        setIsEditing(false)
        loadProject()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (project) {
      initializeFormData(project)
      setIsEditing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
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

  const getMilestoneStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
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
      case "DISPUTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
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
      case "DISPUTED":
        return "Disputed"
      default:
        return status
    }
  }

  const getMilestoneStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "SUBMITTED":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "LOCKED":
        return <CheckCircle className="w-5 h-5 text-purple-600" />
      case "PENDING":
      case "DRAFT":
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
      case "DISPUTED":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
          <Link href="/admin/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const completedMilestones = project.milestones?.filter(
    (m: any) => m.status === "APPROVED" || m.status === "PAID"
  ).length || 0
  const totalMilestones = project.milestones?.length || 0
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/projects">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600">{project.category}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex gap-4">
          <Badge className={getStatusColor(project.status)}>
            {project.status?.replace("_", " ")}
          </Badge>
          {disputes.length > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {disputes.length} Dispute(s)
            </Badge>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            {disputes.length > 0 && <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    {isEditing ? (
                      <Input
                        id="title"
                        value={formData?.title || ""}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{project.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {isEditing ? (
                      <Input
                        id="category"
                        value={formData?.category || ""}
                        onChange={(e) => handleFieldChange("category", e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{project.category}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Budget Min (RM)</Label>
                    {isEditing ? (
                      <Input
                        id="budgetMin"
                        type="number"
                        value={formData?.budgetMin || 0}
                        onChange={(e) => handleFieldChange("budgetMin", parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="font-medium">RM{project.budgetMin?.toLocaleString() || 0}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Budget Max (RM)</Label>
                    {isEditing ? (
                      <Input
                        id="budgetMax"
                        type="number"
                        value={formData?.budgetMax || 0}
                        onChange={(e) => handleFieldChange("budgetMax", parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="font-medium">RM{project.budgetMax?.toLocaleString() || 0}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    {isEditing ? (
                      <Input
                        id="timeline"
                        value={formData?.timeline || ""}
                        onChange={(e) => handleFieldChange("timeline", e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{project.timeline || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.priority || "medium"}
                        onValueChange={(value) => handleFieldChange("priority", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge>{project.priority || "medium"}</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.status || "IN_PROGRESS"}
                        onValueChange={(value) => handleFieldChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="DISPUTED">Disputed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(project.status)}>
                        {project.status?.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={formData?.description || ""}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows={6}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{project.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Customer</p>
                      <p className="text-sm text-gray-600">{project.customer?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">{project.customer?.email || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{project.provider?.name?.charAt(0) || "P"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Provider</p>
                      <p className="text-sm text-gray-600">{project.provider?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">{project.provider?.email || ""}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {completedMilestones} of {totalMilestones} milestones completed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Detailed milestone information and submission history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.milestones && project.milestones.length > 0 ? (
                    project.milestones.map((milestone: any, index: number) => (
                      <div key={milestone.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getMilestoneStatusIcon(milestone.status)}
                          {index < project.milestones.length - 1 && (
                            <div className="w-px h-16 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={getMilestoneStatusColor(milestone.status)}>
                                {getMilestoneStatusText(milestone.status)}
                              </Badge>
                              <span className="text-sm font-medium">
                                RM{milestone.amount?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "—"}
                            </div>
                            {milestone.completedAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Show start deliverables if available */}
                          {milestone.startDeliverables && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-900 mb-1">
                                📋 Plan / Deliverables (When Starting Work):
                              </p>
                              <p className="text-sm text-green-800 whitespace-pre-wrap">
                                {typeof milestone.startDeliverables === "object" &&
                                milestone.startDeliverables.description
                                  ? milestone.startDeliverables.description
                                  : JSON.stringify(milestone.startDeliverables)}
                              </p>
                            </div>
                          )}

                          {/* Show submit deliverables if available */}
                          {milestone.submitDeliverables && (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-sm font-medium text-purple-900 mb-1">
                                ✅ Deliverables / Completion Notes (When Submitting):
                              </p>
                              <p className="text-sm text-purple-800 whitespace-pre-wrap">
                                {typeof milestone.submitDeliverables === "object" &&
                                milestone.submitDeliverables.description
                                  ? milestone.submitDeliverables.description
                                  : JSON.stringify(milestone.submitDeliverables)}
                              </p>
                            </div>
                          )}

                          {/* Show submission note if available */}
                          {milestone.submissionNote && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                📝 Submission Note:
                              </p>
                              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                {milestone.submissionNote}
                              </p>
                            </div>
                          )}

                          {/* Show latest requested changes reason if available */}
                          {milestone.submissionHistory &&
                            Array.isArray(milestone.submissionHistory) &&
                            milestone.submissionHistory.length > 0 &&
                            (() => {
                              const latestRequest =
                                milestone.submissionHistory[milestone.submissionHistory.length - 1]
                              if (latestRequest?.requestedChangesReason) {
                                return (
                                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-sm font-medium text-orange-900 mb-1">
                                      🔄 Latest Request for Changes (Revision #
                                      {latestRequest.revisionNumber || milestone.submissionHistory.length}):
                                    </p>
                                    <p className="text-sm text-orange-800 whitespace-pre-wrap">
                                      {latestRequest.requestedChangesReason}
                                    </p>
                                    {latestRequest.requestedChangesAt && (
                                      <p className="text-xs text-orange-600 mt-2">
                                        Requested on:{" "}
                                        {new Date(latestRequest.requestedChangesAt).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                )
                              }
                              return null
                            })()}

                          {/* Show attachment if available */}
                          {milestone.submissionAttachmentUrl && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Paperclip className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  📎 Submission Attachment
                                </span>
                              </div>
                              <a
                                href={`${
                                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
                                }/${milestone.submissionAttachmentUrl
                                  .replace(/\\/g, "/")
                                  .replace(/^\//, "")}`}
                                download={(() => {
                                  const normalized = milestone.submissionAttachmentUrl.replace(/\\/g, "/")
                                  return normalized.split("/").pop() || "attachment"
                                })()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 hover:shadow-sm transition"
                              >
                                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-xs font-medium">
                                  PDF
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium text-gray-900 break-all leading-snug">
                                    {(() => {
                                      const normalized = milestone.submissionAttachmentUrl.replace(/\\/g, "/")
                                      return normalized.split("/").pop() || "attachment"
                                    })()}
                                  </span>
                                  <span className="text-xs text-gray-500 leading-snug">
                                    Click to preview / download
                                  </span>
                                </div>
                                <div className="ml-auto flex items-center text-gray-500 hover:text-gray-700">
                                  <Download className="w-4 h-4" />
                                </div>
                              </a>
                            </div>
                          )}

                          {/* Show submission history if available */}
                          {milestone.submissionHistory &&
                            Array.isArray(milestone.submissionHistory) &&
                            milestone.submissionHistory.length > 0 && (
                              <div className="mt-4 border-t pt-4">
                                <p className="text-sm font-semibold text-gray-900 mb-3">
                                  📚 Previous Submission History:
                                </p>
                                <div className="space-y-3">
                                  {milestone.submissionHistory.map((history: any, idx: number) => {
                                    const revisionNumber =
                                      history.revisionNumber !== undefined &&
                                      history.revisionNumber !== null
                                        ? history.revisionNumber
                                        : idx + 1

                                    return (
                                      <div
                                        key={idx}
                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <p className="text-sm font-medium text-gray-900">
                                            Revision #{revisionNumber}
                                          </p>
                                          {history.requestedChangesAt && (
                                            <span className="text-xs text-gray-500">
                                              Changes requested:{" "}
                                              {new Date(history.requestedChangesAt).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>

                                        {history.requestedChangesReason && (
                                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="text-xs font-medium text-red-900 mb-1">
                                              Reason for Changes:
                                            </p>
                                            <p className="text-xs text-red-800">
                                              {history.requestedChangesReason}
                                            </p>
                                          </div>
                                        )}

                                        {history.submitDeliverables && (
                                          <div className="mb-2">
                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                              Deliverables:
                                            </p>
                                            <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                              {typeof history.submitDeliverables === "object" &&
                                              history.submitDeliverables.description
                                                ? history.submitDeliverables.description
                                                : JSON.stringify(history.submitDeliverables)}
                                            </p>
                                          </div>
                                        )}

                                        {history.submissionNote && (
                                          <div className="mb-2">
                                            <p className="text-xs font-medium text-gray-700 mb-1">Note:</p>
                                            <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                              {history.submissionNote}
                                            </p>
                                          </div>
                                        )}

                                        {history.submissionAttachmentUrl && (
                                          <div>
                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                              Attachment:
                                            </p>
                                            <a
                                              href={`${
                                                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
                                              }/${history.submissionAttachmentUrl
                                                .replace(/\\/g, "/")
                                                .replace(/^\//, "")}`}
                                              download
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                                            >
                                              {(() => {
                                                const normalized = history.submissionAttachmentUrl.replace(
                                                  /\\/g,
                                                  "/"
                                                )
                                                return normalized.split("/").pop() || "attachment"
                                              })()}
                                            </a>
                                          </div>
                                        )}

                                        {history.submittedAt && (
                                          <p className="text-xs text-gray-500 mt-2">
                                            Submitted: {new Date(history.submittedAt).toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No milestones found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            {/* Proposal Attachments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Attachments</CardTitle>
                <CardDescription>Files attached to accepted proposals</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const proposalAttachments: string[] = []
                  if (
                    project?.proposal?.attachmentUrls &&
                    Array.isArray(project.proposal.attachmentUrls)
                  ) {
                    proposalAttachments.push(...project.proposal.attachmentUrls)
                  }

                  if (proposalAttachments.length === 0) {
                    return (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No proposal attachments found
                      </p>
                    )
                  }

                  return (
                    <div className="space-y-2">
                      {proposalAttachments.map((url, idx) => {
                        const normalized = url.replace(/\\/g, "/")
                        const fileName = normalized.split("/").pop() || `file-${idx + 1}`
                        const fullUrl = `${
                          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
                        }/${normalized.replace(/^\//, "")}`

                        return (
                          <a
                            key={idx}
                            href={fullUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 hover:shadow-sm transition"
                          >
                            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-xs font-medium">
                              PDF
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-gray-900 break-all leading-snug">
                                {fileName}
                              </span>
                              <span className="text-xs text-gray-500 leading-snug">
                                From accepted proposal
                                {project?.proposal?.createdAt &&
                                  ` • Submitted: ${new Date(project.proposal.createdAt).toLocaleDateString()}`}
                                <span className="block mt-0.5">Click to preview / download</span>
                              </span>
                            </div>
                            <div className="ml-auto flex items-center text-gray-500 hover:text-gray-700">
                              <Download className="w-4 h-4" />
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Milestone Attachments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Milestone Attachments</CardTitle>
                <CardDescription>Files attached to milestone submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const milestoneAttachments: Array<{
                    url: string
                    milestoneTitle: string
                    milestoneId: string
                    submittedAt?: string
                  }> = []

                  project.milestones?.forEach((milestone: any) => {
                    if (milestone.submissionAttachmentUrl) {
                      milestoneAttachments.push({
                        url: milestone.submissionAttachmentUrl,
                        milestoneTitle: milestone.title,
                        milestoneId: milestone.id,
                        submittedAt: milestone.submittedAt,
                      })
                    }

                    if (
                      milestone.submissionHistory &&
                      Array.isArray(milestone.submissionHistory)
                    ) {
                      milestone.submissionHistory.forEach((history: any) => {
                        if (history.submissionAttachmentUrl) {
                          milestoneAttachments.push({
                            url: history.submissionAttachmentUrl,
                            milestoneTitle: `${milestone.title} (Revision ${
                              history.revisionNumber || "N/A"
                            })`,
                            milestoneId: milestone.id,
                            submittedAt: history.submittedAt,
                          })
                        }
                      })
                    }
                  })

                  if (milestoneAttachments.length === 0) {
                    return (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No milestone attachments found
                      </p>
                    )
                  }

                  return (
                    <div className="space-y-2">
                      {milestoneAttachments.map((attachment, idx) => {
                        const normalized = attachment.url.replace(/\\/g, "/")
                        const fileName = normalized.split("/").pop() || `file-${idx + 1}`
                        const fullUrl = `${
                          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
                        }/${normalized.replace(/^\//, "")}`

                        return (
                          <a
                            key={idx}
                            href={fullUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 hover:shadow-sm transition"
                          >
                            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-xs font-medium">
                              PDF
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-gray-900 break-all leading-snug">
                                {fileName}
                              </span>
                              <span className="text-xs text-gray-500 leading-snug">
                                From: {attachment.milestoneTitle}
                                {attachment.submittedAt &&
                                  ` • Submitted: ${new Date(attachment.submittedAt).toLocaleDateString()}`}
                                <span className="block mt-0.5">Click to preview / download</span>
                              </span>
                            </div>
                            <div className="ml-auto flex items-center text-gray-500 hover:text-gray-700">
                              <Download className="w-4 h-4" />
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Message Attachments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Message Attachments</CardTitle>
                <CardDescription>Files attached to project messages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 text-center py-8">
                  Message attachments will be available here once implemented
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {disputes.length > 0 && (
            <TabsContent value="disputes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Related Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {disputes.map((dispute: any) => (
                      <div key={dispute.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{dispute.reason}</p>
                            <p className="text-sm text-gray-600">{dispute.description}</p>
                          </div>
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">
                            Raised by: {dispute.raisedBy?.name || "N/A"}
                          </span>
                          <Link href={`/admin/disputes`}>
                            <Button variant="outline" size="sm">
                              View Dispute
                            </Button>
                          </Link>
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
    </AdminLayout>
  )
}

