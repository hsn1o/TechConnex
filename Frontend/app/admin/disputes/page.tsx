"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Ban,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminDisputes,
  getAdminDisputeStats,
  getAdminDisputeById,
  simulateDisputePayout,
  redoMilestone,
  resolveDispute,
} from "@/lib/api"
import Link from "next/link"

export default function AdminDisputesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [disputes, setDisputes] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [releaseAmount, setReleaseAmount] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)

  useEffect(() => {
    loadDisputes()
    loadStats()
  }, [statusFilter])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery || statusFilter !== "all") {
        loadDisputes()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadDisputes = async () => {
    try {
      setLoading(true)
      const response = await getAdminDisputes({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      })
      if (response.success) {
        setDisputes(response.data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load disputes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await getAdminDisputeStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error: any) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleViewDispute = async (disputeId: string) => {
    try {
      const response = await getAdminDisputeById(disputeId)
      if (response.success) {
        setSelectedDispute(response.data)
        setViewDialogOpen(true)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dispute details",
        variant: "destructive",
      })
    }
  }

  const handleResolve = async (action: "refund" | "release" | "partial" | "redo" | "cancel") => {
    if (!selectedDispute) return

    try {
      setActionLoading(true)

      if (action === "refund") {
        const amount = selectedDispute.payment?.amount || selectedDispute.contestedAmount || 0
        await simulateDisputePayout(selectedDispute.id, amount, 0, resolutionNotes || undefined)
        toast({
          title: "Success",
          description: `Refund of RM${amount} processed successfully`,
        })
      } else if (action === "release") {
        const amount = selectedDispute.payment?.amount || selectedDispute.contestedAmount || 0
        await simulateDisputePayout(selectedDispute.id, 0, amount, resolutionNotes || undefined)
        toast({
          title: "Success",
          description: `Release of RM${amount} processed successfully`,
        })
      } else if (action === "partial") {
        const refund = parseFloat(refundAmount) || 0
        const release = parseFloat(releaseAmount) || 0
        if (refund === 0 && release === 0) {
          toast({
            title: "Error",
            description: "Please specify refund or release amount",
            variant: "destructive",
          })
          return
        }
        await simulateDisputePayout(selectedDispute.id, refund, release, resolutionNotes || undefined)
        toast({
          title: "Success",
          description: `Partial payout processed: Refund RM${refund}, Release RM${release}`,
        })
      } else if (action === "redo") {
        await redoMilestone(selectedDispute.id, resolutionNotes || undefined)
        toast({
          title: "Success",
          description: "Milestone returned to IN_PROGRESS",
        })
      } else if (action === "cancel") {
        await resolveDispute(selectedDispute.id, "REJECTED", resolutionNotes || "Dispute rejected")
        toast({
          title: "Success",
          description: "Dispute rejected",
        })
      }

      setViewDialogOpen(false)
      setPayoutDialogOpen(false)
      setSelectedDispute(null)
      setResolutionNotes("")
      setRefundAmount("")
      setReleaseAmount("")
      loadDisputes()
      loadStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process action",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "bg-red-100 text-red-800"
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      case "REJECTED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDisputes = disputes // Backend handles filtering now

  const disputeAmount = (dispute: any) => {
    return dispute.payment?.amount || dispute.contestedAmount || dispute.milestone?.amount || 0
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
            <p className="text-gray-600">Resolve conflicts between customers and providers</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDisputes || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                    <p className="text-2xl font-bold text-red-600">{stats.openDisputes || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.inReviewDisputes || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolvedDisputes || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-purple-600">
                      RM{((stats.totalAmount || 0) / 1000).toFixed(0)}K
                    </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search disputes, customers, or providers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="UNDER_REVIEW">In Review</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadDisputes}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disputes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes ({filteredDisputes.length})</CardTitle>
            <CardDescription>Review and resolve platform disputes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute</TableHead>
                    <TableHead>Project</TableHead>
                  <TableHead>Participants</TableHead>
                    <TableHead>Raised By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredDisputes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        No disputes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div>
                            <p className="font-medium">{dispute.reason}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{dispute.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dispute.project?.title || "N/A"}</p>
                            <Link href={`/admin/projects/${dispute.projectId}`}>
                              <Button variant="link" size="sm" className="p-0 h-auto">
                                View Project
                              </Button>
                            </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                                <AvatarFallback>
                                  {dispute.project?.customer?.name?.charAt(0) || "C"}
                                </AvatarFallback>
                          </Avatar>
                              <span className="text-sm">{dispute.project?.customer?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                                <AvatarFallback>
                                  {dispute.project?.provider?.name?.charAt(0) || "P"}
                                </AvatarFallback>
                          </Avatar>
                              <span className="text-sm">{dispute.project?.provider?.name || "N/A"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback>{dispute.raisedBy?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{dispute.raisedBy?.name || "N/A"}</span>
                          </div>
                    </TableCell>
                    <TableCell>
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                          <p className="font-medium">RM{disputeAmount(dispute).toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                            <p className="text-sm">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              Updated: {new Date(dispute.updatedAt).toLocaleDateString()}
                            </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDispute(dispute.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Dispute Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
              <DialogTitle>Dispute Review - {selectedDispute?.reason}</DialogTitle>
                            <DialogDescription>Review dispute details and provide resolution</DialogDescription>
                          </DialogHeader>

                          {selectedDispute && (
                            <div className="space-y-6">
                              {/* Dispute Overview */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Dispute Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                        <p className="font-medium">{selectedDispute.reason}</p>
                        <p className="text-sm text-gray-500">Project: {selectedDispute.project?.title}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge className={getStatusColor(selectedDispute.status)}>
                          {selectedDispute.status?.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <p>
                                        <span className="font-medium">Amount:</span> RM
                          {disputeAmount(selectedDispute).toLocaleString()}
                                      </p>
                                      <p>
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(selectedDispute.createdAt).toLocaleDateString()}
                        </p>
                        {selectedDispute.contestedAmount && (
                          <p>
                            <span className="font-medium">Contested Amount:</span> RM
                            {selectedDispute.contestedAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="font-medium mb-3">Description & Updates:</p>
                        <div className="space-y-4">
                          {(() => {
                            // Parse description to show original and updates separately
                            const description = selectedDispute.description || "";
                            const parts = description.split(/\n---\n/);
                            const originalDescription = parts[0]?.trim() || "";
                            const updates = parts.slice(1);

                            return (
                              <>
                                {/* Original Description */}
                                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback>
                                        {selectedDispute.raisedBy?.name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {selectedDispute.raisedBy?.name || "Unknown User"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Original dispute • {new Date(selectedDispute.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                                    {originalDescription}
                                  </p>
                                </div>

                                {/* Updates */}
                                {updates.map((update: string, idx: number) => {
                                  // Parse update format: [Update by Name on Date]: content
                                  // Also handle old format: [Update by userId]: content
                                  let match = update.match(/^\[Update by (.+?) on (.+?)\]:\s*([\s\S]+)$/);
                                  let userName = "";
                                  let updateDate = "";
                                  let updateContent = "";
                                  
                                  if (match) {
                                    [, userName, updateDate, updateContent] = match;
                                  } else {
                                    // Try old format: [Update by userId]: content
                                    const oldMatch = update.match(/^\[Update by (.+?)\]:\s*([\s\S]+)$/);
                                    if (oldMatch) {
                                      const [, userIdOrName, content] = oldMatch;
                                      // Check if it's a UUID (old format)
                                      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                                      if (uuidRegex.test(userIdOrName)) {
                                        // It's a UUID, try to match with customer or provider
                                        if (selectedDispute.project?.customer?.id === userIdOrName) {
                                          userName = selectedDispute.project?.customer?.name || "Customer";
                                        } else if (selectedDispute.project?.provider?.id === userIdOrName) {
                                          userName = selectedDispute.project?.provider?.name || "Provider";
                                        } else if (selectedDispute.raisedBy?.id === userIdOrName) {
                                          userName = selectedDispute.raisedBy?.name || "Unknown User";
                                        } else {
                                          userName = "Unknown User";
                                        }
                                        updateDate = "Unknown Date";
                                        updateContent = content;
                                      } else {
                                        userName = userIdOrName;
                                        updateDate = "Unknown Date";
                                        updateContent = content;
                                      }
                                    } else {
                                      // Fallback: treat entire update as content
                                      updateContent = update;
                                      userName = "Unknown User";
                                      updateDate = "Unknown Date";
                                    }
                                  }
                                  
                                  // Determine if update is from customer or provider
                                  const isCustomer = selectedDispute.project?.customer?.name === userName;
                                  const isProvider = selectedDispute.project?.provider?.name === userName;
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className={`p-4 rounded-lg border-l-4 ${
                                        isCustomer
                                          ? "bg-blue-50 border-blue-400"
                                          : isProvider
                                          ? "bg-green-50 border-green-400"
                                          : "bg-yellow-50 border-yellow-400"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarFallback>
                                            {userName.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-900">
                                              {userName}
                                            </p>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {isCustomer
                                                ? "Customer"
                                                : isProvider
                                                ? "Provider"
                                                : "User"}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            Update #{idx + 1} • {updateDate}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                                        {updateContent.trim()}
                                      </p>
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      {selectedDispute.suggestedResolution && (
                        <div className="mt-3">
                          <p className="font-medium mb-2">Suggested Resolution:</p>
                          <p className="text-sm text-gray-700">{selectedDispute.suggestedResolution}</p>
                        </div>
                      )}
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Participants</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                                      <Avatar>
                          <AvatarFallback>
                            {selectedDispute.project?.customer?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                                      </Avatar>
                                      <div>
                          <p className="font-medium">{selectedDispute.project?.customer?.name || "N/A"}</p>
                                        <p className="text-sm text-gray-500">Customer</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                                      <Avatar>
                          <AvatarFallback>
                            {selectedDispute.project?.provider?.name?.charAt(0) || "P"}
                          </AvatarFallback>
                                      </Avatar>
                                      <div>
                          <p className="font-medium">{selectedDispute.project?.provider?.name || "N/A"}</p>
                                        <p className="text-sm text-gray-500">Provider</p>
                                      </div>
                                    </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar>
                          <AvatarFallback>{selectedDispute.raisedBy?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDispute.raisedBy?.name || "N/A"}</p>
                          <p className="text-sm text-gray-500">Raised By</p>
                        </div>
                      </div>
                      <Link href={`/admin/projects/${selectedDispute.projectId}`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Project Details
                        </Button>
                      </Link>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Evidence */}
                {selectedDispute.attachments && selectedDispute.attachments.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Evidence & Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid md:grid-cols-2 gap-4">
                        {selectedDispute.attachments.map((url: string, index: number) => {
                          // Extract filename from path
                          const normalized = url.replace(/\\/g, "/");
                          const filename = normalized.split("/").pop() || `Attachment ${index + 1}`;
                          // Remove timestamp prefix if present (format: timestamp_filename.ext)
                          const cleanFilename = filename.replace(/^\d+_/, "");
                          
                          // Try to find attachment metadata in description
                          const attachmentMetadataMatch = selectedDispute.description?.match(
                            new RegExp(`\\[Attachment: (.+?) uploaded by (.+?) on (.+?)\\]`, "g")
                          );
                          let uploadedBy = "Unknown User";
                          let uploadedAt = "Unknown Date";
                          
                          if (attachmentMetadataMatch) {
                            // Find matching metadata for this file
                            for (const meta of attachmentMetadataMatch) {
                              const metaMatch = meta.match(/\[Attachment: (.+?) uploaded by (.+?) on (.+?)\]/);
                              if (metaMatch && metaMatch[1] === filename) {
                                uploadedBy = metaMatch[2];
                                uploadedAt = metaMatch[3];
                                break;
                              }
                            }
                          }
                          
                          // Also check if it's from the original dispute creator
                          if (uploadedBy === "Unknown User" && index === 0 && selectedDispute.attachments.length === 1) {
                            uploadedBy = selectedDispute.raisedBy?.name || "Unknown User";
                            uploadedAt = new Date(selectedDispute.createdAt).toLocaleString();
                          }
                          
                          return (
                                      <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">
                                      {cleanFilename}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Uploaded by {uploadedBy} • {uploadedAt}
                                    </p>
                                  </div>
                                </div>
                                        </div>
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${url.startsWith("/") ? url : `/${url}`}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                                          <Eye className="w-4 h-4 mr-2" />
                                          View
                                        </Button>
                              </a>
                                      </div>
                          );
                        })}
                                  </div>
                                </CardContent>
                              </Card>
                )}

                              {/* Resolution Notes */}
                {selectedDispute.resolutionNotes && Array.isArray(selectedDispute.resolutionNotes) && selectedDispute.resolutionNotes.length > 0 && (
                                <Card className="border-purple-200 bg-purple-50">
                                  <CardHeader>
                                    <CardTitle className="text-lg text-purple-800">Admin Resolution Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {selectedDispute.resolutionNotes.map((note: any, index: number) => {
                                      // Check if note contains "--- Admin Note ---" separator
                                      const noteParts = note.note?.split(/\n--- Admin Note ---\n/) || [];
                                      const hasAdminNote = noteParts.length > 1;
                                      const resolutionResult = noteParts[0] || note.note;
                                      const adminNote = noteParts[1];
                                      
                                      return (
                                        <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Avatar className="w-6 h-6">
                                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                                {note.adminName?.charAt(0) || "A"}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="text-sm font-semibold text-gray-900">
                                                Resolution Note #{index + 1}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                By {note.adminName || "Admin"} • {new Date(note.createdAt).toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="space-y-3 mt-2">
                                            {/* Resolution Result */}
                                            <div>
                                              <p className="text-xs font-semibold text-gray-500 mb-1">Resolution Result:</p>
                                              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                                {resolutionResult}
                                              </p>
                                            </div>
                                            {/* Admin Note (if exists) */}
                                            {hasAdminNote && adminNote && (
                                              <div>
                                                <p className="text-xs font-semibold text-purple-600 mb-1">Admin Note:</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 p-2 rounded border-l-2 border-purple-300">
                                                  {adminNote}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </CardContent>
                                </Card>
                              )}
                              
                              {/* Legacy Resolution (for backward compatibility) */}
                {selectedDispute.status === "RESOLVED" && selectedDispute.resolution && (!selectedDispute.resolutionNotes || !Array.isArray(selectedDispute.resolutionNotes) || selectedDispute.resolutionNotes.length === 0) && (
                                <Card className="border-green-200 bg-green-50">
                                  <CardHeader>
                                    <CardTitle className="text-lg text-green-800">Resolution</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-green-700">{selectedDispute.resolution}</p>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Resolution Form */}
                {selectedDispute.status !== "RESOLVED" && selectedDispute.status !== "CLOSED" && (
                                <Card>
                                  <CardHeader>
                      <CardTitle className="text-lg">Resolution Actions</CardTitle>
                                  </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => handleResolve("refund")}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-700"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Refund (Company Wins)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleResolve("release")}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Release (Provider Wins)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPayoutDialogOpen(true)}
                          disabled={actionLoading}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Partial Split
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleResolve("redo")}
                          disabled={actionLoading}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Redo Milestone
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resolution-notes">Resolution Notes (Optional)</Label>
                                    <Textarea
                          id="resolution-notes"
                          placeholder="Enter resolution notes..."
                                      value={resolutionNotes}
                                      onChange={(e) => setResolutionNotes(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleResolve("cancel")}
                        disabled={actionLoading}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Reject Dispute
                      </Button>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}

                          <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
                                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Partial Payout Dialog */}
        <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Partial Payout</DialogTitle>
              <DialogDescription>Specify refund and release amounts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Refund Amount (RM)</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release-amount">Release Amount (RM)</Label>
                <Input
                  id="release-amount"
                  type="number"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payout-resolution-notes">Resolution Notes (Optional)</Label>
                <Textarea
                  id="payout-resolution-notes"
                  placeholder="Enter resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                Cancel
                                </Button>
              <Button onClick={() => handleResolve("partial")} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Payout"
                )}
              </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
      </div>
    </AdminLayout>
  )
}
