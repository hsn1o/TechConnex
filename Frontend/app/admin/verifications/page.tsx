"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  User,
  Building,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { getAttachmentUrl, getR2DownloadUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ===== Types that match /api/admin/kyc (see backend adminKycRoutes.js) =====
export type KycDocStatus = "uploaded" | "verified" | "rejected";
export type KycStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_verification";
export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export interface KycDoc {
  id: string;
  type: "PROVIDER_ID" | "COMPANY_REG" | "COMPANY_DIRECTOR_ID" | "OTHER";
  fileUrl: string;
  filename: string;
  mimeType?: string;
  status: KycDocStatus;
  uploadedAt?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface KycUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  kycStatus: KycStatus;
  createdAt: string;
  documents: KycDoc[];
  profile?: any; // ✅ add profile (can type later as ProviderProfile | CustomerProfile)
}

// Map backend KycStatus -> UI status pills
function uiDocStatus(s: KycDocStatus): "verified" | "rejected" | "uploaded" {
  switch (s) {
    case "verified":
      return "verified"; // verified = verified
    case "rejected":
      return "rejected"; // rejected = rejected
    case "uploaded":
    default:
      return "uploaded"; // uploaded = pending review
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-800";
    case "uploaded":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "under_review":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getDocumentStatusColor(status: string) {
  switch (status) {
    case "verified":
      return "text-green-600";
    case "uploaded":
      return "text-blue-600";
    case "rejected":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export default function AdminVerificationsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const { toast } = useToast();

  // ===== UI state =====
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | uploaded | verified | rejected
  const [typeFilter, setTypeFilter] = useState("all"); // all | provider | customer
  const [selectedUser, setSelectedUser] = useState<KycUser | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // ===== Data state =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<KycUser[]>([]);
  const token = localStorage.getItem("token");

  async function fetchKyc() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/kyc/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to fetch KYC list (${res.status})`);

      const rawData = await res.json();

      // Group docs by userId
      const grouped: Record<string, KycUser> = {};

      rawData.forEach((item: any) => {
        const u = item.user;
        if (!grouped[u.id]) {
          grouped[u.id] = {
            id: u.id,
            name: u.name || "Unnamed",
            email: u.email,
            role: Array.isArray(u.role) ? u.role[0] : u.role,
            kycStatus: u.kycStatus,
            createdAt: u.createdAt,
            profile: u.profile, // ✅ Add this line
            documents: [],
          };
        }

        // Push this KYC doc
        grouped[u.id].documents.push({
          id: item.id,
          type: item.type,
          fileUrl: item.fileUrl,
          filename: item.filename,
          mimeType: item.mimeType,
          status: item.status,
          uploadedAt: item.uploadedAt,
          reviewNotes: item.reviewNotes,
          reviewedBy: item.reviewedBy,
          reviewedAt: item.reviewedAt,
        });
      });

      // Convert to array
      const formattedData = Object.values(grouped);
      setUsers(formattedData);
    } catch (e: any) {
      console.error("❌ KYC fetch error:", e);
      setError(e?.message || "Failed to fetch KYC list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKyc();
  }, []);

  // ===== Derived =====
  const rows = useMemo(() => {
    return users
      .map((u) => {
        // Get latest uploaded document
        const latestDoc = u.documents?.slice().sort((a, b) => {
          const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return dateB - dateA;
        })[0];

        // ✅ Get the latest reviewed document
        const latestReviewed = u.documents
          ?.filter((d) => d.reviewedBy)
          ?.sort((a, b) => {
            const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
            const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
            return dateB - dateA;
          })[0];

        return {
          ...u,
          submittedDate: latestDoc?.uploadedAt
            ? new Date(latestDoc.uploadedAt).toLocaleDateString("en-MY", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",

          // Main status (latest upload)
          _uiStatus: latestDoc ? uiDocStatus(latestDoc.status) : "uploaded",

          // Type role mapping
          _uiType:
            u.role === "PROVIDER"
              ? "provider"
              : u.role === "CUSTOMER"
              ? "customer"
              : "admin",

          // ✅ Reviewed document info
          reviewedDocName:
            latestReviewed?.filename || latestReviewed?.type || "—",
          reviewedDocStatus: latestReviewed?.status || "—",
        };
      })
      .filter((u) => {
        const matchesSearch =
          !searchQuery ||
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || u._uiStatus === statusFilter;

        const matchesType =
          typeFilter === "all" ||
          (typeFilter === "provider"
            ? u._uiType === "provider"
            : u._uiType === "customer");

        return matchesSearch && matchesStatus && matchesType;
      });
  }, [users, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    let pending = 0,
      approved = 0,
      rejected = 0;

    users.forEach((u) => {
      const latestDoc = u.documents?.slice().sort((a, b) => {
        const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return dateB - dateA;
      })[0];
      const s = latestDoc ? uiDocStatus(latestDoc.status) : "uploaded";

      if (s === "uploaded") pending++;
      if (s === "verified") approved++;
      if (s === "rejected") rejected++;
    });

    return { total, pending, approved, rejected };
  }, [users]);

  // ===== Actions =====
  async function decide(userId: string, approve: boolean) {
    try {
      const res = await fetch(`${API_URL}/kyc/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approve, notes: reviewNotes || undefined }),
      });
      if (!res.ok)
        throw new Error(
          `Failed to ${approve ? "approve" : "reject"} (${res.status})`
        );
      // Option A: replace updated user in-place
      const updated: KycUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSelectedUser(null);
      setReviewNotes("");
    } catch (e: any) {
      alert(e?.message || "Operation failed");
    }
  }

  const canReviewUser = (user: KycUser | null) => {
    if (!user || !user.documents?.length) return false;
    // Return true only if ALL docs are not in "uploaded" state
    return user.documents.every((doc) => doc.status !== "uploaded");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Verifications
            </h1>
            <p className="text-gray-600">
              Review and approve user verification requests
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fetchKyc()}
              disabled={loading}
            >
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
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
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
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
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
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
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
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
                  <SelectItem value="uploaded">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Verifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests ({rows.length})</CardTitle>
            <CardDescription>
              Review user verification documents and approve or reject requests
            </CardDescription>
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
                          <AvatarFallback>
                            {u.name?.charAt(0) || "U"}
                          </AvatarFallback>
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
                        <Badge
                          className={
                            u._uiType === "provider"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        >
                          {u._uiType.charAt(0).toUpperCase() +
                            u._uiType.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(u._uiStatus)}>
                        {u._uiStatus.charAt(0).toUpperCase() +
                          u._uiStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[260px]">
                        {u.documents?.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <FileText
                              className={`w-3 h-3 ${getDocumentStatusColor(
                                doc.status
                              )}`}
                            />
                            <a
                              className="truncate underline decoration-dotted cursor-pointer"
                              href={undefined}
                              onClick={async (e) => {
                                e.preventDefault();
                                try {
                                  const attachmentUrl = getAttachmentUrl(doc.fileUrl);
                                  const isR2Key = attachmentUrl === "#";
                                  
                                  if (isR2Key) {
                                    const downloadData = await getR2DownloadUrl(doc.fileUrl);
                                    window.open(downloadData.downloadUrl, "_blank");
                                  } else {
                                    window.open(attachmentUrl, "_blank");
                                  }
                                } catch (error: any) {
                                  console.error("Failed to open document:", error);
                                  toast({
                                    title: "Error",
                                    description: error.message || "Failed to open document",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              title={doc.filename}
                            >
                              {doc.type}
                            </a>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getDocumentStatusColor(
                                doc.status
                              )}`}
                            >
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedUser(u as unknown as KycUser)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Verification Review - {selectedUser?.name}
                            </DialogTitle>
                            <DialogDescription>
                              Review all submitted documents and user
                              information
                            </DialogDescription>
                          </DialogHeader>

                          {selectedUser && (
                            <div className="space-y-6">
                              {/* User Info */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      User Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-12 h-12">
                                        <AvatarImage src={"/placeholder.svg"} />
                                        <AvatarFallback>
                                          {selectedUser.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">
                                          {selectedUser.name || "Unnamed"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {selectedUser.email}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <span className="font-medium">
                                          Role:
                                        </span>{" "}
                                        {selectedUser.role}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          KYC Status:
                                        </span>{" "}
                                        {selectedUser.kycStatus}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Joined:
                                        </span>{" "}
                                        {new Date(
                                          selectedUser.profile.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      Verification Status
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={getStatusColor(
                                          uiDocStatus(
                                            selectedUser.documents[0].status
                                          )
                                        )}
                                      >
                                        {uiDocStatus(
                                          selectedUser.documents[0].status
                                        ).replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <p>
                                        <span className="font-medium">
                                          Latest Upload:
                                        </span>{" "}
                                        {selectedUser.documents?.[0]?.uploadedAt
                                          ? new Date(
                                              selectedUser.documents[0].uploadedAt
                                            ).toLocaleDateString("en-MY", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })
                                          : "—"}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                              {/* ✅ Show list of reviewed documents if available */}
                              {u.documents.some((doc) => doc.reviewedBy) && (
                                <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-3">
                                  <h3 className="font-semibold text-gray-800">
                                    Review History
                                  </h3>

                                  <div className="divide-y">
                                    {u.documents
                                      .filter((doc) => doc.reviewedBy)
                                      .map((doc) => (
                                        <div key={doc.id} className="pt-2">
                                          <p>
                                            <span className="font-medium text-gray-700">
                                              📄 Document:
                                            </span>{" "}
                                            {doc.filename || doc.type}
                                          </p>
                                          <p>
                                            <span className="font-medium text-gray-700">
                                              🗂 Status:
                                            </span>{" "}
                                            <Badge
                                              variant="outline"
                                              className={getDocumentStatusColor(
                                                doc.status
                                              )}
                                            >
                                              {doc.status}
                                            </Badge>
                                          </p>
                                          <p>
                                            <span className="font-medium text-gray-700">
                                              📝 Review Notes:
                                            </span>{" "}
                                            {doc.reviewNotes || "—"}
                                          </p>
                                          <p>
                                            <span className="font-medium text-gray-700">
                                              👤 Reviewed By:
                                            </span>{" "}
                                            {doc.reviewedBy || "—"}
                                          </p>
                                          <p>
                                            <span className="font-medium text-gray-700">
                                              📅 Reviewed At:
                                            </span>{" "}
                                            {doc.reviewedAt
                                              ? new Date(
                                                  doc.reviewedAt
                                                ).toLocaleString("en-MY", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })
                                              : "—"}
                                          </p>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    Submitted Documents
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {selectedUser.documents?.map((doc) => (
                                      <div
                                        key={doc.id}
                                        className="border rounded-lg p-4"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <FileText
                                              className={`w-4 h-4 ${getDocumentStatusColor(
                                                doc.status
                                              )}`}
                                            />
                                            <span className="font-medium">
                                              {doc.type}
                                            </span>
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className={getDocumentStatusColor(
                                              doc.status
                                            )}
                                          >
                                            {doc.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">
                                          Filename: {doc.filename}
                                        </p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full bg-transparent"
                                          onClick={async () => {
                                            try {
                                              const attachmentUrl = getAttachmentUrl(doc.fileUrl);
                                              const isR2Key = attachmentUrl === "#";
                                              
                                              if (isR2Key) {
                                                const downloadData = await getR2DownloadUrl(doc.fileUrl);
                                                window.open(downloadData.downloadUrl, "_blank");
                                              } else {
                                                window.open(attachmentUrl, "_blank");
                                              }
                                            } catch (error: any) {
                                              console.error("Failed to download document:", error);
                                              toast({
                                                title: "Error",
                                                description: error.message || "Failed to download document",
                                                variant: "destructive",
                                              });
                                            }
                                          }}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                              {/* Profile Details */}
                              {selectedUser?.profile && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      {selectedUser.role === "PROVIDER"
                                        ? "Provider Profile Details"
                                        : "Customer Profile Details"}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3 text-sm">
                                    {selectedUser.role === "PROVIDER" ? (
                                      <>
                                        <p>
                                          <span className="font-medium">
                                            Bio:
                                          </span>{" "}
                                          {selectedUser.profile.bio}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Location:
                                          </span>{" "}
                                          {selectedUser.profile.location}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Website:
                                          </span>{" "}
                                          {selectedUser.profile.website}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Years of Experience:
                                          </span>{" "}
                                          {selectedUser.profile.yearsExperience}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Hourly Rate:
                                          </span>{" "}
                                          ${selectedUser.profile.hourlyRate}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Languages:
                                          </span>{" "}
                                          {selectedUser.profile.languages?.join(
                                            ", "
                                          ) || "—"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Skills:
                                          </span>{" "}
                                          {selectedUser.profile.skills?.join(
                                            ", "
                                          ) || "—"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Work Preference:
                                          </span>{" "}
                                          {selectedUser.profile.workPreference}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Team Size:
                                          </span>{" "}
                                          {selectedUser.profile.teamSize}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Rating:
                                          </span>{" "}
                                          {selectedUser.profile.rating} ⭐
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p>
                                          <span className="font-medium">
                                            Description:
                                          </span>{" "}
                                          {selectedUser.profile.description}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Industry:
                                          </span>{" "}
                                          {selectedUser.profile.industry}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Location:
                                          </span>{" "}
                                          {selectedUser.profile.location}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Website:
                                          </span>{" "}
                                          {selectedUser.profile.website}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Company Size:
                                          </span>{" "}
                                          {selectedUser.profile.companySize}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Established Year:
                                          </span>{" "}
                                          {selectedUser.profile.establishedYear}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Annual Revenue:
                                          </span>{" "}
                                          {selectedUser.profile.annualRevenue}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Funding Stage:
                                          </span>{" "}
                                          {selectedUser.profile.fundingStage}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Preferred Contracts:
                                          </span>{" "}
                                          {selectedUser.profile.preferredContractTypes?.join(
                                            ", "
                                          )}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Hiring Categories:
                                          </span>{" "}
                                          {selectedUser.profile.categoriesHiringFor?.join(
                                            ", "
                                          )}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Mission:
                                          </span>{" "}
                                          {selectedUser.profile.mission}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Values:
                                          </span>{" "}
                                          {selectedUser.profile.values?.join(
                                            ", "
                                          )}
                                        </p>
                                      </>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                              {/* Review Notes */}
                              {selectedUser &&
                                selectedUser.documents?.some(
                                  (doc) => doc.status === "uploaded"
                                ) && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">
                                        Review Notes
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Textarea
                                        placeholder="Add your review notes here..."
                                        value={reviewNotes}
                                        onChange={(e) =>
                                          setReviewNotes(e.target.value)
                                        }
                                        className="min-h-[100px]"
                                      />
                                    </CardContent>
                                  </Card>
                                )}
                            </div>
                          )}

                          <DialogFooter>
                            {selectedUser &&
                              selectedUser.documents?.some(
                                (doc) => doc.status === "uploaded"
                              ) && (
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      decide(selectedUser.id, false)
                                    }
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      decide(selectedUser.id, true)
                                    }
                                    className="bg-green-600 hover:bg-green-700"
                                  >
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
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-gray-500 py-12"
                    >
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
  );
}
