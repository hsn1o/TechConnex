"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Download, User, Building, RefreshCw } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

// ===== Types that match /api/admin/kyc (see backend adminKycRoutes.js) =====
export type KycDocStatus = "uploaded" | "verified" | "rejected"
export type KycStatus = "active" | "inactive" | "suspended" | "pending_verification"
export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"

export interface KycDoc {
  id: string
  type: "PROVIDER_ID" | "COMPANY_REG" | "COMPANY_DIRECTOR_ID" | "OTHER"
  fileUrl: string
  filename: string
  mimeType?: string
  status: KycDocStatus
  uploadedAt?: string
}

export interface KycUser {
  id: string
  name: string
  email: string
  role: Role
  kycStatus: KycStatus
  createdAt: string
  documents: KycDoc[]
}

// Map backend KycStatus -> UI status pills
function uiStatus(s: KycStatus): "approved" | "rejected" | "pending" | "under_review" {
  switch (s) {
    case "active":
      return "approved"
    case "inactive":
      return "rejected"
    case "pending_verification":
      return "pending"
    case "suspended":
      return "under_review"
    default:
      return "pending"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "under_review":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getDocumentStatusColor(status: string) {
  switch (status) {
    case "verified":
      return "text-green-600"
    case "uploaded":
      return "text-blue-600"
    case "rejected":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export default function AdminVerificationsPage() {
  // ===== UI state =====
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // all | pending | approved | rejected | under_review
  const [typeFilter, setTypeFilter] = useState("all") // all | provider | customer
  const [selectedUser, setSelectedUser] = useState<KycUser | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  // ===== Data state =====
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<KycUser[]>([])

  async function fetchKyc() {
    setLoading(true)
    setError(null)
    try {
      // Fetch everyone who has any KYC docs, then we filter in the UI
      const res = await fetch("http://localhost:4000/api/admin/kyc?status=all", { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to fetch KYC list (${res.status})`)
      const data: KycUser[] = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message || "Failed to fetch KYC list")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKyc()
  }, [])

  // ===== Derived =====
  const rows = useMemo(() => {
    return users
      .map((u) => ({
        ...u,
        // latest upload date if available
        submittedDate: u.documents?.[0]?.uploadedAt || "—",
        // convenience fields for UI filtering
        _uiStatus: uiStatus(u.kycStatus),
        _uiType: u.role === "PROVIDER" ? "provider" : u.role === "CUSTOMER" ? "customer" : "admin",
      }))
      .filter((u) => {
        const matchesSearch =
          !searchQuery ||
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || u._uiStatus === statusFilter
        const matchesType =
          typeFilter === "all" || (typeFilter === "provider" ? u._uiType === "provider" : u._uiType === "customer")

        return matchesSearch && matchesStatus && matchesType
      })
  }, [users, searchQuery, statusFilter, typeFilter])

  const stats = useMemo(() => {
    const total = users.length
    let pending = 0,
      approved = 0,
      rejected = 0
    users.forEach((u) => {
      const s = uiStatus(u.kycStatus)
      if (s === "pending") pending++
      if (s === "approved") approved++
      if (s === "rejected") rejected++
    })
    return { total, pending, approved, rejected }
  }, [users])

  // ===== Actions =====
  async function decide(userId: string, approve: boolean) {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/kyc/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve, notes: reviewNotes || undefined }),
      })
      if (!res.ok) throw new Error(`Failed to ${approve ? "approve" : "reject"} (${res.status})`)
      // Option A: replace updated user in-place
      const updated: KycUser = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setSelectedUser(null)
      setReviewNotes("")
    } catch (e: any) {
      alert(e?.message || "Operation failed")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Verifications</h1>
            <p className="text-gray-600">Review and approve user verification requests</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchKyc()} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Verification Guidelines
            </Button>
          </div>
        </div>

        {/* Empty / Error states */}
        {error && (
          <Card>
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="provider">Providers</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Verifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests ({rows.length})</CardTitle>
            <CardDescription>Review user verification documents and approve or reject requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={"/placeholder.svg"} />
                          <AvatarFallback>{u.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name || "Unnamed"}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u._uiType === "provider" ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Building className="w-4 h-4 text-purple-600" />
                        )}
                        <Badge className={u._uiType === "provider" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                          {u._uiType.charAt(0).toUpperCase() + u._uiType.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(u._uiStatus)}>
                        {u._uiStatus.charAt(0).toUpperCase() + u._uiStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[260px]">
                        {u.documents?.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 text-sm">
                            <FileText className={`w-3 h-3 ${getDocumentStatusColor(doc.status)}`} />
                            <a
                              className="truncate underline decoration-dotted"
                              href={`http://localhost:4000/api/admin/kyc/doc/${doc.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              title={doc.filename}
                            >
                              {doc.type}
                            </a>
                            <Badge variant="outline" className={`text-xs ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{u.submittedDate}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(u as unknown as KycUser)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Verification Review - {selectedUser?.name}</DialogTitle>
                            <DialogDescription>Review all submitted documents and user information</DialogDescription>
                          </DialogHeader>

                          {selectedUser && (
                            <div className="space-y-6">
                              {/* User Info */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">User Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-12 h-12">
                                        <AvatarImage src={"/placeholder.svg"} />
                                        <AvatarFallback>{selectedUser.name?.charAt(0) || "U"}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{selectedUser.name || "Unnamed"}</p>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <span className="font-medium">Role:</span> {selectedUser.role}
                                      </p>
                                      <p>
                                        <span className="font-medium">KYC Status:</span> {selectedUser.kycStatus}
                                      </p>
                                      <p>
                                        <span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Verification Status</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getStatusColor(uiStatus(selectedUser.kycStatus))}>
                                        {uiStatus(selectedUser.kycStatus).replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <p>
                                        <span className="font-medium">Latest Upload:</span> {selectedUser.documents?.[0]?.uploadedAt || "—"}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Documents */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Submitted Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {selectedUser.documents?.map((doc) => (
                                      <div key={doc.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <FileText className={`w-4 h-4 ${getDocumentStatusColor(doc.status)}`} />
                                            <span className="font-medium">{doc.type}</span>
                                          </div>
                                          <Badge variant="outline" className={getDocumentStatusColor(doc.status)}>
                                            {doc.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">Filename: {doc.filename}</p>
                                        <a
                                          href={`http://localhost:4000/api/admin/kyc/doc/${doc.id}/download`}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                          </Button>
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Review Notes */}
                              {uiStatus(selectedUser.kycStatus) === "pending" && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Review Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Textarea
                                      placeholder="Add your review notes here..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}

                          <DialogFooter>
                            {selectedUser && uiStatus(selectedUser.kycStatus) === "pending" && (
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => decide(selectedUser.id, false)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                                <Button onClick={() => decide(selectedUser.id, true)} className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-12">
                      No verification requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
