"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Upload,
  Calendar,
  User,
} from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"
import { useToast } from "@/hooks/use-toast"

export default function DocumentDetailPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Mock document data
  const document = {
    id: "1",
    name: "Business_Registration_Certificate.pdf",
    type: "Business Registration",
    size: "2.4 MB",
    uploadDate: "2024-01-15T10:30:00",
    status: "approved",
    reviewDate: "2024-01-16T14:20:00",
    reviewer: "Admin Team",
    version: "1.0",
    documentNumber: "DOC-2024-001",
    description: "Business registration certificate for Tech Innovations Sdn Bhd",
    metadata: {
      uploadedBy: "Ahmad Rahman",
      ipAddress: "103.xxx.xxx.xxx",
      fileHash: "sha256:abc123...",
      mimeType: "application/pdf",
    },
    verificationDetails: {
      documentType: "Business Registration (SSM)",
      issueDate: "2023-06-15",
      expiryDate: "2025-06-15",
      registrationNumber: "SSM-123456789",
      issuingAuthority: "Suruhanjaya Syarikat Malaysia (SSM)",
    },
    timeline: [
      {
        status: "uploaded",
        timestamp: "2024-01-15T10:30:00",
        description: "Document uploaded successfully",
        user: "Ahmad Rahman",
      },
      {
        status: "under_review",
        timestamp: "2024-01-15T11:00:00",
        description: "Document submitted for review",
        user: "System",
      },
      {
        status: "approved",
        timestamp: "2024-01-16T14:20:00",
        description: "Document verified and approved",
        user: "Admin Team",
      },
    ],
    notes: [
      {
        timestamp: "2024-01-16T14:20:00",
        user: "Admin Team",
        message: "Document verified successfully. All information is correct and matches our records.",
      },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleDownload = () => {
    toast({
      title: "Downloading Document",
      description: "Your document is being downloaded.",
    })
  }

  const handleDelete = () => {
    toast({
      title: "Document Deleted",
      description: "The document has been removed from your account.",
    })
    router.back()
  }

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Details</h1>
              <p className="text-gray-600">{document.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Document
            </Button>
            {document.status === "rejected" && (
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Reupload
              </Button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Document Status</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{document.status}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(document.uploadDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${getStatusColor(document.status)} text-lg px-4 py-2`}>
                  {getStatusIcon(document.status)}
                  <span className="ml-2 capitalize">{document.status}</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Document Overview</CardTitle>
                <CardDescription>Basic information about this document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Document Type</p>
                    <p className="font-medium">{document.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Document Number</p>
                    <p className="font-medium">{document.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Size</p>
                    <p className="font-medium">{document.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">{document.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upload Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{new Date(document.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reviewed Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{new Date(document.reviewDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{document.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Details */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Details</CardTitle>
                <CardDescription>Official document information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Document Type</p>
                    <p className="font-medium">{document.verificationDetails.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium">{document.verificationDetails.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">
                      {new Date(document.verificationDetails.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-medium">
                      {new Date(document.verificationDetails.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Issuing Authority</p>
                    <p className="font-medium">{document.verificationDetails.issuingAuthority}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Document Timeline</CardTitle>
                <CardDescription>History of document status changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {document.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.status === "approved"
                              ? "bg-green-100"
                              : event.status === "under_review"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                          }`}
                        >
                          {event.status === "approved" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : event.status === "under_review" ? (
                            <Clock className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Upload className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        {index < document.timeline.length - 1 && <div className="w-0.5 h-12 bg-gray-200 my-1" />}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">By: {event.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Notes */}
            {document.notes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Notes</CardTitle>
                  <CardDescription>Comments from the verification team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {document.notes.map((note, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-blue-900">{note.user}</p>
                            <p className="text-sm text-blue-600">{new Date(note.timestamp).toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-blue-800">{note.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Document Metadata</CardTitle>
                <CardDescription>Technical information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Uploaded By</p>
                  <p className="text-sm font-medium">{document.metadata.uploadedBy}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="text-sm font-medium">{document.metadata.ipAddress}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">MIME Type</p>
                  <p className="text-sm font-medium">{document.metadata.mimeType}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">File Hash</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{document.metadata.fileHash}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Document
                </Button>
                {document.status === "rejected" && (
                  <Button className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Reupload Document
                  </Button>
                )}
                <Separator className="my-2" />
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Document
                </Button>
              </CardContent>
            </Card>

            {/* Document Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Preview not available</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      View Full Document
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
