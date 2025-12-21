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
  getProfileImageUrl,
  getAttachmentUrl,
  getR2DownloadUrl,
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
import { MarkdownViewer } from "@/components/markdown/MarkdownViewer"
import { Globe, MapPin, Star } from "lucide-react"

export default function AdminProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { toast: toastHook } = useToast()

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
    // Handle requirements and deliverables (can be string or array)
    const requirements = typeof projectData.requirements === "string"
      ? projectData.requirements
      : Array.isArray(projectData.requirements)
      ? projectData.requirements.map((r: any) => `- ${r}`).join("\n")
      : ""
    
    const deliverables = typeof projectData.deliverables === "string"
      ? projectData.deliverables
      : Array.isArray(projectData.deliverables)
      ? projectData.deliverables.map((d: any) => `- ${d}`).join("\n")
      : ""

    setFormData({
      title: projectData.title || "",
      description: projectData.description || "",
      category: projectData.category || "",
      budgetMin: projectData.budgetMin || 0,
      budgetMax: projectData.budgetMax || 0,
      timeline: projectData.timeline || projectData.originalTimeline || "",
      priority: projectData.priority || "medium",
      status: projectData.status || "IN_PROGRESS",
      requirements: requirements,
      deliverables: deliverables,
      skills: Array.isArray(projectData.skills) ? projectData.skills.join(", ") : "",
    })
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData || !project) return

    try {
      setSaving(true)
      
      const isServiceRequest = project.type === "serviceRequest"
      
      // Prepare update data
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        timeline: formData.timeline,
        priority: formData.priority,
      }

      // Only include status for Projects (not ServiceRequests)
      if (!isServiceRequest && formData.status) {
        updateData.status = formData.status
      }

      // Convert skills from comma-separated string to array
      if (formData.skills) {
        const skillsArray = formData.skills
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        if (skillsArray.length > 0) {
          updateData.skills = skillsArray
        }
      }

      // Include requirements and deliverables as markdown strings
      if (formData.requirements !== undefined) {
        updateData.requirements = formData.requirements.trim() || null
      }
      if (formData.deliverables !== undefined) {
        updateData.deliverables = formData.deliverables.trim() || null
      }

      const response = await updateAdminProject(projectId, updateData)
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

  const getStatusColor = (status: string, type?: string) => {
    // ServiceRequests (unmatched opportunities)
    if (type === "serviceRequest") {
      return "bg-yellow-100 text-yellow-800"
    }
    
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

  const getStatusText = (status: string, type?: string) => {
    if (type === "serviceRequest") {
      return "Open Opportunity"
    }
    return status?.replace("_", " ") || status
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

  const isServiceRequest = project.type === "serviceRequest"
  const completedMilestones = project.milestones?.filter(
    (m: any) => m.status === "APPROVED" || m.status === "PAID"
  ).length || 0
  const totalMilestones = project.milestones?.length || 0
  const progress = isServiceRequest ? 0 : (totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0)
  
  // Calculate approved price (sum of all milestone amounts)
  const approvedPrice = project.milestones?.reduce((sum: number, m: any) => sum + (m.amount || 0), 0) || 0
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `RM${amount.toLocaleString()}`
  }
  
  // Get skills array
  const skills = Array.isArray(project.skills) ? project.skills : []
  
  // Get requirements and deliverables (handle both string and array formats)
  const requirements = typeof project.requirements === "string" 
    ? project.requirements 
    : Array.isArray(project.requirements)
    ? project.requirements.map((r: any) => `- ${r}`).join("\n")
    : ""
  
  const deliverables = typeof project.deliverables === "string"
    ? project.deliverables
    : Array.isArray(project.deliverables)
    ? project.deliverables.map((d: any) => `- ${d}`).join("\n")
    : ""

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
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isServiceRequest ? "Edit Opportunity" : "Edit Project"}
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex gap-4">
          <Badge className={getStatusColor(project.status, project.type)}>
            {getStatusText(project.status, project.type)}
          </Badge>
          {isServiceRequest && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Opportunity
            </Badge>
          )}
          {disputes.length > 0 && !isServiceRequest && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {disputes.length} Dispute(s)
            </Badge>
          )}
          {isServiceRequest && project.proposalsCount > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {project.proposalsCount} {project.proposalsCount === 1 ? "proposal" : "proposals"}
            </Badge>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isServiceRequest ? (
              <TabsTrigger value="proposals">Proposals ({project.proposalsCount || project.proposals?.length || 0})</TabsTrigger>
            ) : (
              <>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="proposals">Proposals ({project.proposalsCount || project.proposals?.length || 0})</TabsTrigger>
              </>
            )}
            <TabsTrigger value="files">Files</TabsTrigger>
            {disputes.length > 0 && !isServiceRequest && <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>}
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
                    {isEditing ? (
                      <Input
                        value={formData?.category || ""}
                        onChange={(e) => handleFieldChange("category", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg mt-1">{project.category}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <div className="mt-1">
                      {isEditing && !isServiceRequest ? (
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
                        <Badge className={getStatusColor(project.status, project.type)}>
                          {getStatusText(project.status, project.type)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Budget Range
                    </Label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Input
                          type="number"
                          value={formData?.budgetMin || 0}
                          onChange={(e) => handleFieldChange("budgetMin", parseFloat(e.target.value) || 0)}
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          value={formData?.budgetMax || 0}
                          onChange={(e) => handleFieldChange("budgetMax", parseFloat(e.target.value) || 0)}
                          placeholder="Max"
                        />
                      </div>
                    ) : (
                      <p className="text-lg mt-1">
                        {formatCurrency(project.budgetMin || 0)} - {formatCurrency(project.budgetMax || 0)}
                      </p>
                    )}
                  </div>
                  {!isServiceRequest && approvedPrice > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Approved Price
                      </Label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {formatCurrency(approvedPrice)}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Timeline
                    </Label>
                    <div className="space-y-2 mt-1">
                      {project.originalTimeline && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Original Timeline (Company):
                          </p>
                          {isEditing ? (
                            <Input
                              value={formData?.timeline || ""}
                              onChange={(e) => handleFieldChange("timeline", e.target.value)}
                            />
                          ) : (
                            <p className="text-sm text-gray-900 font-medium">
                              {formatTimeline(project.originalTimeline)}
                            </p>
                          )}
                        </div>
                      )}
                      {project.providerProposedTimeline && !isServiceRequest && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Provider Proposed Timeline:
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {formatTimeline(project.providerProposedTimeline, "day")}
                          </p>
                        </div>
                      )}
                      {!project.originalTimeline && !project.providerProposedTimeline && (
                        <p className="text-sm text-gray-600">
                          {isEditing ? (
                            <Input
                              value={formData?.timeline || ""}
                              onChange={(e) => handleFieldChange("timeline", e.target.value)}
                              placeholder="Enter timeline"
                            />
                          ) : (
                            "Not specified"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Priority
                    </Label>
                    <div className="mt-1">
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
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Required Skills
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData?.skills || skills.join(", ")}
                      onChange={(e) => handleFieldChange("skills", e.target.value)}
                      placeholder="Enter skills separated by commas"
                      className="mt-1"
                    />
                  ) : skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No skills specified</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Requirements
                  </Label>
                  <div className="mt-2">
                    {isEditing ? (
                      <Textarea
                        value={formData?.requirements || requirements}
                        onChange={(e) => handleFieldChange("requirements", e.target.value)}
                        rows={6}
                        placeholder="Enter requirements (Markdown supported)"
                      />
                    ) : requirements ? (
                      <div className="prose max-w-none text-gray-700">
                        <MarkdownViewer
                          content={requirements}
                          className="prose max-w-none text-gray-700"
                          emptyMessage="No requirements specified"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No requirements specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Deliverables
                  </Label>
                  <div className="mt-2">
                    {isEditing ? (
                      <Textarea
                        value={formData?.deliverables || deliverables}
                        onChange={(e) => handleFieldChange("deliverables", e.target.value)}
                        rows={6}
                        placeholder="Enter deliverables (Markdown supported)"
                      />
                    ) : deliverables ? (
                      <div className="prose max-w-none text-gray-700">
                        <MarkdownViewer
                          content={deliverables}
                          className="prose max-w-none text-gray-700"
                          emptyMessage="No deliverables specified"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No deliverables specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Description
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={formData?.description || ""}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows={6}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={getProfileImageUrl(project.customer?.customerProfile?.profileImageUrl)}
                    />
                    <AvatarFallback>{project.customer?.name?.charAt(0) || "C"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-semibold text-lg">{project.customer?.name || "N/A"}</p>
                      <p className="text-sm text-gray-600">{project.customer?.email || ""}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {project.customer?.customerProfile?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{project.customer.customerProfile.location}</span>
                        </div>
                      )}
                      {project.customer?.customerProfile?.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a
                            href={project.customer.customerProfile.website.startsWith("http") ? project.customer.customerProfile.website : `https://${project.customer.customerProfile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {project.customer.customerProfile.website}
                          </a>
                        </div>
                      )}
                      {project.customer?.customerProfile?.industry && (
                        <div>
                          <span className="text-gray-500">Industry: </span>
                          <span className="text-gray-700">{project.customer.customerProfile.industry}</span>
                        </div>
                      )}
                      {project.customer?.customerProfile?.companySize && (
                        <div>
                          <span className="text-gray-500">Company Size: </span>
                          <span className="text-gray-700">{project.customer.customerProfile.companySize}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/admin/users/${project.customer?.id}`}>
                      <Button variant="outline" size="sm">
                        View Full Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Information */}
            {!isServiceRequest && project.provider && (
              <Card>
                <CardHeader>
                  <CardTitle>Provider Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={getProfileImageUrl(project.provider?.providerProfile?.profileImageUrl)}
                      />
                      <AvatarFallback>{project.provider?.name?.charAt(0) || "P"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-semibold text-lg">{project.provider?.name || "N/A"}</p>
                        <p className="text-sm text-gray-600">{project.provider?.email || ""}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {project.provider?.providerProfile?.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{project.provider.providerProfile.location}</span>
                          </div>
                        )}
                        {project.provider?.providerProfile?.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a
                              href={project.provider.providerProfile.website.startsWith("http") ? project.provider.providerProfile.website : `https://${project.provider.providerProfile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {project.provider.providerProfile.website}
                            </a>
                          </div>
                        )}
                        {project.provider?.providerProfile?.rating !== undefined && project.provider.providerProfile.rating !== null && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-700">
                              {Number(project.provider.providerProfile.rating).toFixed(1)} Rating
                            </span>
                          </div>
                        )}
                        {project.provider?.providerProfile?.totalProjects !== undefined && (
                          <div>
                            <span className="text-gray-500">Projects: </span>
                            <span className="text-gray-700">{project.provider.providerProfile.totalProjects}</span>
                          </div>
                        )}
                      </div>
                      <Link href={`/admin/users/${project.provider?.id}`}>
                        <Button variant="outline" size="sm">
                          View Full Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isServiceRequest && (
              <Card>
                <CardHeader>
                  <CardTitle>Provider Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Awaiting Provider Match</p>
                      {project.proposalsCount > 0 && (
                        <p className="text-sm text-blue-600 mt-1">
                          {project.proposalsCount} {project.proposalsCount === 1 ? "proposal" : "proposals"} received
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            {!isServiceRequest && (
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
            )}
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

          {/* Proposals Tab (for both Projects and ServiceRequests) */}
          <TabsContent value="proposals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proposals</CardTitle>
                  <CardDescription>
                    {isServiceRequest
                      ? "Proposals submitted by providers for this opportunity"
                      : "All proposals submitted for this project (including accepted, rejected, and pending)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.proposals && project.proposals.length > 0 ? (
                    <div className="space-y-4">
                      {project.proposals.map((proposal: any) => (
                        <div key={proposal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {proposal.provider?.name?.charAt(0) || "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{proposal.provider?.name || "N/A"}</p>
                                <p className="text-sm text-gray-600">{proposal.provider?.email || ""}</p>
                                {proposal.provider?.providerProfile?.location && (
                                  <p className="text-xs text-gray-500">
                                    {proposal.provider.providerProfile.location}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={
                                proposal.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : proposal.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {proposal.status}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Bid Amount</p>
                              <p className="text-lg font-semibold">
                                RM{proposal.bidAmount?.toLocaleString() || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Delivery Time</p>
                              <p className="text-lg font-semibold">
                                {proposal.deliveryTime ? `${proposal.deliveryTime} days` : "N/A"}
                              </p>
                            </div>
                          </div>
                          {proposal.coverLetter && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter</p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {proposal.coverLetter}
                              </p>
                            </div>
                          )}
                          {proposal.milestones && proposal.milestones.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Proposed Milestones ({proposal.milestones.length})
                              </p>
                              <div className="space-y-2">
                                {proposal.milestones.map((milestone: any, idx: number) => (
                                  <div key={milestone.id || idx} className="p-2 bg-gray-50 rounded text-sm">
                                    <p className="font-medium">{milestone.title}</p>
                                    <p className="text-gray-600">
                                      RM{milestone.amount?.toLocaleString() || 0}
                                      {milestone.dueDate &&
                                        ` • Due: ${new Date(milestone.dueDate).toLocaleDateString()}`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {proposal.attachmentUrls && proposal.attachmentUrls.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                              <div className="space-y-2">
                                {proposal.attachmentUrls.map((url: string, idx: number) => {
                                  const normalized = url.replace(/\\/g, "/")
                                  const fileName = normalized.split("/").pop() || `file-${idx + 1}`
                                  const attachmentUrl = getAttachmentUrl(url)
                                  const isR2Key = attachmentUrl === "#" || (!attachmentUrl.startsWith("http") && !attachmentUrl.startsWith("/uploads/") && !attachmentUrl.includes(process.env.NEXT_PUBLIC_API_URL || "localhost"))
                                  
                                  return (
                                    <a
                                      key={idx}
                                      href={attachmentUrl === "#" ? undefined : attachmentUrl}
                                      download={fileName}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={isR2Key ? async (e) => {
                                        e.preventDefault()
                                        try {
                                          const downloadUrl = await getR2DownloadUrl(url) // Use original URL/key
                                          window.open(downloadUrl.downloadUrl, "_blank")
                                        } catch (error) {
                                          console.error("Failed to get download URL:", error)
                                          toastHook({
                                            title: "Error",
                                            description: "Failed to download attachment",
                                            variant: "destructive",
                                          })
                                        }
                                      } : undefined}
                                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                      {fileName}
                                    </a>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(proposal.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No proposals received yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          <TabsContent value="files" className="space-y-6">
            {/* Proposal Attachments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Attachments</CardTitle>
                <CardDescription>
                  {isServiceRequest
                    ? "Files attached to all proposals"
                    : "Files attached to accepted proposals"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const proposalAttachments: string[] = []
                  
                  // For ServiceRequests, collect attachments from all proposals
                  if (isServiceRequest && project.proposals) {
                    project.proposals.forEach((proposal: any) => {
                      if (proposal.attachmentUrls && Array.isArray(proposal.attachmentUrls)) {
                        proposalAttachments.push(...proposal.attachmentUrls)
                      }
                    })
                  }
                  // For Projects, use accepted proposal attachments
                  else if (
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
            {!isServiceRequest && (
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
            )}

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

