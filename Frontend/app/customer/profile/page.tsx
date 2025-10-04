"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Building,
  Mail,
  Phone,
  Star,
  Shield,
  Lock,
  Camera,
  Save,
  Edit,
  MapPin,
  Globe,
  Linkedin,
  User,
  CreditCard,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"
import { useToast } from "@/hooks/use-toast"

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
}

export default function CustomerProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [profileData, setProfileData] = useState({
    firstName: "Ahmad",
    lastName: "Rahman",
    email: "ahmad.rahman@email.com",
    phone: "+60123456789",
    company: "Tech Innovations Sdn Bhd",
    position: "IT Director",
    industry: "Technology",
    companySize: "medium",
    address: "Jalan Ampang, Kuala Lumpur",
    city: "Kuala Lumpur",
    state: "Kuala Lumpur",
    postalCode: "50450",
    bio: "Experienced IT professional with over 10 years in technology leadership. Passionate about digital transformation and innovative solutions.",
    website: "https://techinnovations.com.my",
    linkedin: "https://linkedin.com/in/ahmadrahman",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    projectUpdates: true,
    bidNotifications: true,
    messageNotifications: true,
    paymentNotifications: true,
    weeklyDigest: true,
    securityAlerts: true,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    {
      id: "1",
      name: "Business_Registration_Certificate.pdf",
      type: "Business Registration",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      status: "approved",
    },
    {
      id: "2",
      name: "Tax_Identification_Number.pdf",
      type: "Tax Document",
      size: "1.8 MB",
      uploadDate: "2024-01-15",
      status: "approved",
    },
    {
      id: "3",
      name: "Bank_Account_Statement.pdf",
      type: "Bank Statement",
      size: "3.2 MB",
      uploadDate: "2024-01-20",
      status: "pending",
    },
  ])

  const documentTypes = [
    { value: "business_registration", label: "Business Registration Certificate (SSM)" },
    { value: "tax_document", label: "Tax Identification Number" },
    { value: "bank_statement", label: "Bank Account Statement" },
    { value: "company_profile", label: "Company Profile/Brochure" },
    { value: "director_id", label: "Director's Identification (IC/Passport)" },
    { value: "authorization_letter", label: "Authorization Letter" },
    { value: "financial_statement", label: "Financial Statement" },
    { value: "other", label: "Other Documents" },
  ]

  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      })
      return
    }

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    })
  }

  const handleDeleteAccount = () => {
    if (confirmDelete !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted. You will receive an email confirmation.",
    })
    setDeleteAccountOpen(false)
    setConfirmDelete("")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPEG, or PNG file.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleDocumentUpload = () => {
    if (!selectedDocType || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please select a document type and file.",
        variant: "destructive",
      })
      return
    }

    const newDocument: UploadedDocument = {
      id: Date.now().toString(),
      name: selectedFile.name,
      type: documentTypes.find((t) => t.value === selectedDocType)?.label || selectedDocType,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setUploadedDocuments([...uploadedDocuments, newDocument])
    setUploadDialogOpen(false)
    setSelectedDocType("")
    setSelectedFile(null)

    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded and is pending verification.",
    })
  }

  const handleDeleteDocument = (id: string) => {
    setUploadedDocuments(uploadedDocuments.filter((doc) => doc.id !== id))
    toast({
      title: "Document Deleted",
      description: "The document has been removed from your account.",
    })
  }

  const getVerificationStatus = () => {
    const approvedDocs = uploadedDocuments.filter((doc) => doc.status === "approved").length
    const pendingDocs = uploadedDocuments.filter((doc) => doc.status === "pending").length
    const rejectedDocs = uploadedDocuments.filter((doc) => doc.status === "rejected").length

    if (approvedDocs >= 2 && pendingDocs === 0 && rejectedDocs === 0) {
      return { status: "verified", color: "green", icon: CheckCircle }
    } else if (pendingDocs > 0) {
      return { status: "pending", color: "yellow", icon: Clock }
    } else if (rejectedDocs > 0) {
      return { status: "action_required", color: "red", icon: AlertCircle }
    } else {
      return { status: "not_verified", color: "gray", icon: XCircle }
    }
  }

  const verificationStatus = getVerificationStatus()

  const stats = {
    projectsPosted: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalSpent: 85000,
    averageRating: 4.8,
    responseTime: "2 hours",
    memberSince: "January 2023",
    successRate: 95,
  }

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-lg">
                        {profileData.firstName.charAt(0)}
                        {profileData.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={profileData.state}
                        onValueChange={(value) => setProfileData({ ...profileData, state: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                          <SelectItem value="Selangor">Selangor</SelectItem>
                          <SelectItem value="Penang">Penang</SelectItem>
                          <SelectItem value="Johor">Johor</SelectItem>
                          <SelectItem value="Perak">Perak</SelectItem>
                          <SelectItem value="Kedah">Kedah</SelectItem>
                          <SelectItem value="Kelantan">Kelantan</SelectItem>
                          <SelectItem value="Terengganu">Terengganu</SelectItem>
                          <SelectItem value="Pahang">Pahang</SelectItem>
                          <SelectItem value="Negeri Sembilan">Negeri Sembilan</SelectItem>
                          <SelectItem value="Melaka">Melaka</SelectItem>
                          <SelectItem value="Perlis">Perlis</SelectItem>
                          <SelectItem value="Sabah">Sabah</SelectItem>
                          <SelectItem value="Sarawak">Sarawak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Statistics</CardTitle>
                <CardDescription>Your activity and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.projectsPosted}</div>
                    <div className="text-sm text-gray-500">Projects Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.activeProjects}</div>
                    <div className="text-sm text-gray-500">Active Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.completedProjects}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">RM{stats.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold text-yellow-600">{stats.averageRating}</span>
                    </div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{stats.responseTime}</div>
                    <div className="text-sm text-gray-500">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{stats.successRate}%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-600">{stats.memberSince}</div>
                    <div className="text-sm text-gray-500">Member Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Details about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="position">Your Position</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="position"
                        value={profileData.position}
                        onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={profileData.industry}
                      onValueChange={(value) => setProfileData({ ...profileData, industry: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={profileData.companySize}
                      onValueChange={(value) => setProfileData({ ...profileData, companySize: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                        <SelectItem value="small">Small (11-50 employees)</SelectItem>
                        <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                        <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="linkedin"
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            {/* Verification Status Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Company Verification Status</CardTitle>
                    <CardDescription>
                      Upload required documents to verify and authorize your company on the platform
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {verificationStatus.status === "verified" && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {verificationStatus.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="w-4 h-4 mr-1" />
                        Pending Review
                      </Badge>
                    )}
                    {verificationStatus.status === "action_required" && (
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Action Required
                      </Badge>
                    )}
                    {verificationStatus.status === "not_verified" && (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                        <XCircle className="w-4 h-4 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Banner */}
                {verificationStatus.status !== "verified" && (
                  <div
                    className={`p-4 rounded-lg border ${
                      verificationStatus.status === "action_required"
                        ? "bg-red-50 border-red-200"
                        : verificationStatus.status === "pending"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`w-5 h-5 mt-0.5 ${
                          verificationStatus.status === "action_required"
                            ? "text-red-600"
                            : verificationStatus.status === "pending"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">
                          {verificationStatus.status === "action_required"
                            ? "Action Required"
                            : verificationStatus.status === "pending"
                              ? "Documents Under Review"
                              : "Complete Your Verification"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {verificationStatus.status === "action_required"
                            ? "Some documents have been rejected. Please review and resubmit the required documents."
                            : verificationStatus.status === "pending"
                              ? "Your documents are currently being reviewed by our team. This typically takes 1-2 business days."
                              : "To access all platform features and start posting projects, please upload the required verification documents."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Documents Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Required Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Business Registration (SSM)</p>
                          <p className="text-xs text-gray-500">Required for company verification</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Tax Identification Number</p>
                          <p className="text-xs text-gray-500">Required for financial transactions</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Bank Account Statement</p>
                          <p className="text-xs text-gray-500">For payment verification</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Director's Identification</p>
                          <p className="text-xs text-gray-500">IC or Passport copy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Upload Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                    <p className="text-sm text-gray-500">Manage your verification documents</p>
                  </div>
                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload Verification Document</DialogTitle>
                        <DialogDescription>
                          Select the document type and upload your file. Accepted formats: PDF, JPEG, PNG (Max 10MB)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="docType">Document Type</Label>
                          <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fileUpload">Select File</Label>
                          <div className="mt-2">
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="fileUpload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                                </div>
                                <input
                                  id="fileUpload"
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={handleFileSelect}
                                />
                              </label>
                            </div>
                          </div>
                          {selectedFile && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleDocumentUpload} disabled={!selectedDocType || !selectedFile}>
                          Upload Document
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-3">
                  {uploadedDocuments.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-gray-50">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No documents uploaded yet</p>
                      <p className="text-sm text-gray-500">Upload your verification documents to get started</p>
                    </div>
                  ) : (
                    uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <FileText className="w-5 h-5 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{doc.name}</h4>
                                {doc.status === "approved" && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {doc.status === "pending" && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                                {doc.status === "rejected" && (
                                  <Badge className="bg-red-100 text-red-800">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{doc.type}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{doc.size}</span>
                                <span>Uploaded: {doc.uploadDate}</span>
                              </div>
                              {doc.status === "rejected" && doc.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  <strong>Reason:</strong> {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Process Info */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Process</CardTitle>
                <CardDescription>What to expect during the verification process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Upload Documents</h4>
                      <p className="text-sm text-gray-600">
                        Upload all required documents in the accepted formats (PDF, JPEG, PNG)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Document Review</h4>
                      <p className="text-sm text-gray-600">
                        Our team will review your documents within 1-2 business days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Verification Complete</h4>
                      <p className="text-sm text-gray-600">
                        Once approved, you'll receive a confirmation email and full platform access
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">General Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                      </div>
                      <Switch
                        checked={preferences.smsNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                      </div>
                      <Switch
                        checked={preferences.marketingEmails}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, marketingEmails: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Project Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Project Updates</Label>
                        <p className="text-sm text-gray-500">Updates on your active projects</p>
                      </div>
                      <Switch
                        checked={preferences.projectUpdates}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, projectUpdates: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Bid Notifications</Label>
                        <p className="text-sm text-gray-500">When providers bid on your projects</p>
                      </div>
                      <Switch
                        checked={preferences.bidNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, bidNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Message Notifications</Label>
                        <p className="text-sm text-gray-500">New messages from providers</p>
                      </div>
                      <Switch
                        checked={preferences.messageNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, messageNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Payment Notifications</Label>
                        <p className="text-sm text-gray-500">Payment confirmations and receipts</p>
                      </div>
                      <Switch
                        checked={preferences.paymentNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, paymentNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Additional Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Digest</Label>
                        <p className="text-sm text-gray-500">Weekly summary of your activity</p>
                      </div>
                      <Switch
                        checked={preferences.weeklyDigest}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyDigest: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Security Alerts</Label>
                        <p className="text-sm text-gray-500">Important security notifications</p>
                      </div>
                      <Switch
                        checked={preferences.securityAlerts}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, securityAlerts: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() =>
                      toast({
                        title: "Preferences Saved",
                        description: "Your notification preferences have been updated.",
                      })
                    }
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Email Verified</p>
                        <p className="text-sm text-gray-500">Your email address is verified</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Phone Verified</p>
                        <p className="text-sm text-gray-500">Your phone number is verified</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handlePasswordChange}>Update Password</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download Account Data
                    </Button>
                    <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all your
                            data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="confirmDelete">Type "DELETE" to confirm</Label>
                            <Input
                              id="confirmDelete"
                              value={confirmDelete}
                              onChange={(e) => setConfirmDelete(e.target.value)}
                              placeholder="DELETE"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={confirmDelete !== "DELETE"}
                          >
                            Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your payment methods and billing history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                          Remove
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      Add Payment Method
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Project Payment - E-commerce Website</p>
                        <p className="text-sm text-gray-500">January 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RM15,000.00</p>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Project Payment - Mobile App Design</p>
                        <p className="text-sm text-gray-500">December 28, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RM8,000.00</p>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Project Payment - Data Analytics Dashboard</p>
                        <p className="text-sm text-gray-500">December 10, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RM18,000.00</p>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Transactions
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Spending Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">RM{stats.totalSpent.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Spent</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">RM12,500</div>
                      <div className="text-sm text-gray-500">This Month</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">RM7,083</div>
                      <div className="text-sm text-gray-500">Average per Project</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  )
}
