"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/admin-layout"
import { getAdminUserById, suspendUser, activateUser, updateAdminUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Ban, CheckCircle, Building, Users, Star, DollarSign, FileText, Loader2, Edit, Save, X, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getResumeByUserId, getR2DownloadUrl } from "@/lib/api"

// Helper type for user data with property access
type UserData = Record<string, unknown> & {
  [key: string]: unknown;
};

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UserData | null>(null)
  const [resume, setResume] = useState<{ fileUrl: string; uploadedAt: string } | null>(null)
  const [loadingResume, setLoadingResume] = useState(false)

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAdminUserById(userId)
      if (response.success) {
        setUser(response.data as UserData)
        initializeFormData(response.data as UserData)
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  useEffect(() => {
    const loadResume = async () => {
      if (!user || !Array.isArray(user.role) || !user.role.includes("PROVIDER")) return;
      try {
        setLoadingResume(true);
        const response = await getResumeByUserId(user.id as string);
        if (response.success && response.data) {
          setResume(response.data);
        }
      } catch (error) {
        // Resume is optional
        console.error("Failed to load resume:", error);
      } finally {
        setLoadingResume(false);
      }
    };

    if (user) {
      loadResume();
    }
  }, [user])

  const handleDownloadResume = async () => {
    if (!resume?.fileUrl) return;

    try {
      const downloadUrl = await getR2DownloadUrl(resume.fileUrl);
      window.open(downloadUrl.downloadUrl, "_blank");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download resume",
        variant: "destructive",
      });
    }
  };

  const initializeFormData = (userData: UserData) => {
    const userRole = Array.isArray(userData.role) ? userData.role : []
    const isProvider = userRole.includes("PROVIDER")
    const profile = (isProvider ? userData.providerProfile : userData.customerProfile) as Record<string, unknown> | undefined
    
    setFormData({
      // User fields
      name: (userData.name as string) || "",
      email: (userData.email as string) || "",
      phone: (userData.phone as string) || "",
      isVerified: (userData.isVerified as boolean) || false,
      status: (userData.status as string) || "ACTIVE",
      kycStatus: (userData.kycStatus as string) || "pending_verification",
      // Profile fields (provider or customer)
      ...(isProvider && profile ? {
        providerProfile: {
          bio: (profile.bio as string) || "",
          location: (profile.location as string) || "",
          hourlyRate: (profile.hourlyRate as string) || "",
          availability: (profile.availability as string) || "",
          website: (profile.website as string) || "",
          skills: (Array.isArray(profile.skills) ? profile.skills : []) as string[],
          languages: (Array.isArray(profile.languages) ? profile.languages : []) as string[],
          yearsExperience: (profile.yearsExperience as string) || "",
          minimumProjectBudget: (profile.minimumProjectBudget as string) || "",
          maximumProjectBudget: (profile.maximumProjectBudget as string) || "",
          preferredProjectDuration: (profile.preferredProjectDuration as string) || "",
          workPreference: (profile.workPreference as string) || "remote",
          teamSize: (profile.teamSize as number) || 1,
        }
      } : {
        customerProfile: {
          description: (profile?.description as string) || "",
          industry: (profile?.industry as string) || "",
          location: (profile?.location as string) || "",
          website: (profile?.website as string) || "",
          socialLinks: (Array.isArray(profile?.socialLinks) ? profile.socialLinks : []) as string[],
          languages: (Array.isArray(profile?.languages) ? profile.languages : []) as string[],
          companySize: (profile?.companySize as string) || "",
          employeeCount: (profile?.employeeCount as string) || "",
          establishedYear: (profile?.establishedYear as string) || "",
          annualRevenue: (profile?.annualRevenue as string) || "",
          fundingStage: (profile?.fundingStage as string) || "",
          preferredContractTypes: (Array.isArray(profile?.preferredContractTypes) ? profile.preferredContractTypes : []) as string[],
          averageBudgetRange: (profile?.averageBudgetRange as string) || "",
          remotePolicy: (profile?.remotePolicy as string) || "",
          hiringFrequency: (profile?.hiringFrequency as string) || "",
          categoriesHiringFor: (Array.isArray(profile?.categoriesHiringFor) ? profile.categoriesHiringFor : []) as string[],
          mission: (profile?.mission as string) || "",
          values: (Array.isArray(profile?.values) ? profile.values : []) as string[],
          benefits: profile?.benefits || null,
          mediaGallery: (Array.isArray(profile?.mediaGallery) ? profile.mediaGallery : []) as string[],
        }
      }),
    })
  }

  const handleFieldChange = (field: string, value: unknown, isProfile = false) => {
    setFormData((prev) => {
      if (!prev) return prev;
      if (isProfile) {
        const profileKey = Array.isArray(user?.role) && user.role.includes("PROVIDER") ? "providerProfile" : "customerProfile"
        return {
          ...prev,
          [profileKey]: {
            ...((prev[profileKey] as Record<string, unknown>) || {}),
            [field]: value,
          },
        }
      }
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setSaving(true)
      const response = await updateAdminUser(userId, formData)
      if (response.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setIsEditing(false)
        loadUserData()
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      initializeFormData(user)
      setIsEditing(false)
    }
  }

  const handleArrayFieldChange = (field: string, value: string, action: "add" | "remove" | "update") => {
    setFormData((prev) => {
      if (!prev) return prev
      const profileKey = Array.isArray(user?.role) && user.role.includes("PROVIDER") ? "providerProfile" : "customerProfile"
      const profile = prev[profileKey] as Record<string, unknown> | undefined
      const currentArray = (Array.isArray(profile?.[field]) ? profile[field] : []) as string[]
      
      let newArray = [...currentArray]
      
      if (action === "add") {
        if (value.trim() && !newArray.includes(value.trim())) {
          newArray.push(value.trim())
        }
      } else if (action === "remove") {
        newArray = newArray.filter((item: string) => item !== value)
      }
      
      return {
        ...prev,
        [profileKey]: {
          ...(profile || {}),
          [field]: newArray,
        },
      }
    })
  }

  const handleSuspend = async () => {
    if (!confirm("Are you sure you want to suspend this user? They will not be able to login until activated.")) {
      return
    }

    try {
      setActionLoading(true)
      const response = await suspendUser(userId)
      if (response.success) {
        toast({
          title: "Success",
          description: "User suspended successfully",
        })
        loadUserData()
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivate = async () => {
    if (!confirm("Are you sure you want to activate this user?")) {
      return
    }

    try {
      setActionLoading(true)
      const response = await activateUser(userId)
      if (response.success) {
        toast({
          title: "Success",
          description: "User activated successfully",
        })
        loadUserData()
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to activate user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "SUSPENDED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string[]) => {
    if (role?.includes("PROVIDER")) return "bg-blue-100 text-blue-800"
    if (role?.includes("CUSTOMER")) return "bg-purple-100 text-purple-800"
    if (role?.includes("ADMIN")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading user data...</span>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
          <Link href="/admin/users">
            <Button className="mt-4">Back to Users</Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const userRole = Array.isArray(user?.role) ? user.role : []
  const isProvider = userRole.includes("PROVIDER")
  const isCustomer = userRole.includes("CUSTOMER")
  const profile = (isProvider ? user?.providerProfile : user?.customerProfile) as Record<string, unknown> | undefined

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/users">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name as string}</h1>
              <p className="text-gray-600">{user?.email as string}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
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
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    const avatar = isProvider 
                      ? user.providerProfile?.profileImageUrl 
                      : user.customerProfile?.profileImageUrl;
                    router.push(
                      `/admin/messages?userId=${user.id}&name=${encodeURIComponent(user.name || "")}&avatar=${encodeURIComponent(avatar || "")}`
                    );
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                {user.status === "ACTIVE" ? (
                  <Button
                    variant="destructive"
                    onClick={handleSuspend}
                    disabled={actionLoading}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    onClick={handleActivate}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate User
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status and Role Badges */}
        <div className="flex gap-4">
          <Badge className={getStatusColor(user?.status as string || "")}>
            {user?.status as string || ""}
          </Badge>
          {Array.isArray(user?.role) && (user.role as string[]).map((r: string) => (
            <Badge key={r} className={getRoleColor([r])}>
              {r}
            </Badge>
          ))}
          {(user?.isVerified as boolean) && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {Array.isArray(user?.KycDocument) && user.KycDocument.length > 0 && (
              <TabsTrigger value="documents">Documents</TabsTrigger>
            )}
            {((Array.isArray(user?.projectsAsProvider) && user.projectsAsProvider.length > 0) || (Array.isArray(user?.projectsAsCustomer) && user.projectsAsCustomer.length > 0)) && (
              <TabsTrigger value="projects">Projects</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData?.name || ""}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{user?.name as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={(formData?.email as string) || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{user?.email as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={(formData?.phone as string) || ""}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        placeholder="Optional"
                      />
                    ) : (
                      <p className="font-medium">{(user?.phone as string) || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>KYC Status</Label>
                    {isEditing ? (
                      <Select
                        value={(formData?.kycStatus as string) || "pending_verification"}
                        onValueChange={(value) => handleFieldChange("kycStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending_verification">Pending Verification</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{user.kycStatus}</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.status || "ACTIVE"}
                        onValueChange={(value) => handleFieldChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Verified</Label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="isVerified"
                          checked={formData?.isVerified || false}
                          onCheckedChange={(checked) => handleFieldChange("isVerified", checked)}
                        />
                        <Label htmlFor="isVerified" className="font-normal">
                          Verified Account
                        </Label>
                      </div>
                    ) : (
                      <div>
                        {(user?.isVerified as boolean) ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Verified</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Joined</Label>
                    <p className="font-medium">
                      {new Date(user?.createdAt as string).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Stats */}
            {isProvider && user?.providerProfile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Projects</p>
                        <p className="text-2xl font-bold">{((user.providerProfile as Record<string, unknown>).totalProjects as number) || 0}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Rating</p>
                        <p className="text-2xl font-bold">{Number((user.providerProfile as Record<string, unknown>).rating) || 0}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Earnings</p>
                        <p className="text-2xl font-bold">RM {Number((user.providerProfile as Record<string, unknown>).totalEarnings || 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {isCustomer && user?.customerProfile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Projects Posted</p>
                        <p className="text-2xl font-bold">{((user.customerProfile as Record<string, unknown>).projectsPosted as number) || 0}</p>
                      </div>
                      <Building className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold">RM {Number((user.customerProfile as Record<string, unknown>).totalSpend || 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {profile && formData && (
              <>
                {isProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Provider Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            value={((formData.providerProfile as Record<string, unknown>)?.bio as string) || ""}
                            onChange={(e) => handleFieldChange("bio", e.target.value, true)}
                            placeholder="Enter bio"
                            rows={4}
                          />
                        ) : (
                          <p>{(profile.bio as string) || "—"}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          {isEditing ? (
                            <Input
                              id="location"
                              value={formData.providerProfile?.location || ""}
                              onChange={(e) => handleFieldChange("location", e.target.value, true)}
                            />
                          ) : (
                            <p>{profile.location || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly Rate (RM)</Label>
                          {isEditing ? (
                            <Input
                              id="hourlyRate"
                              type="number"
                              value={formData.providerProfile?.hourlyRate || ""}
                              onChange={(e) => handleFieldChange("hourlyRate", e.target.value ? parseFloat(e.target.value) : null, true)}
                            />
                          ) : (
                            <p>{profile.hourlyRate ? `RM ${profile.hourlyRate}` : "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          {isEditing ? (
                            <Input
                              id="website"
                              type="url"
                              value={formData.providerProfile?.website || ""}
                              onChange={(e) => handleFieldChange("website", e.target.value, true)}
                              placeholder="https://..."
                            />
                          ) : (
                            <p>{profile.website || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years Experience</Label>
                          {isEditing ? (
                            <Input
                              id="yearsExperience"
                              type="number"
                              value={formData.providerProfile?.yearsExperience || ""}
                              onChange={(e) => handleFieldChange("yearsExperience", e.target.value ? parseInt(e.target.value) : null, true)}
                            />
                          ) : (
                            <p>{profile.yearsExperience || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="availability">Availability</Label>
                          {isEditing ? (
                            <Select
                              value={formData.providerProfile?.availability || "available"}
                              onValueChange={(value) => handleFieldChange("availability", value, true)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p>{profile.availability || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workPreference">Work Preference</Label>
                          {isEditing ? (
                            <Select
                              value={formData.providerProfile?.workPreference || "remote"}
                              onValueChange={(value) => handleFieldChange("workPreference", value, true)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="onsite">On-site</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p>{profile.workPreference || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teamSize">Team Size</Label>
                          {isEditing ? (
                            <Input
                              id="teamSize"
                              type="number"
                              value={formData.providerProfile?.teamSize || 1}
                              onChange={(e) => handleFieldChange("teamSize", e.target.value ? parseInt(e.target.value) : 1, true)}
                            />
                          ) : (
                            <p>{profile.teamSize || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minimumProjectBudget">Minimum Project Budget (RM)</Label>
                          {isEditing ? (
                            <Input
                              id="minimumProjectBudget"
                              type="number"
                              value={formData.providerProfile?.minimumProjectBudget || ""}
                              onChange={(e) => handleFieldChange("minimumProjectBudget", e.target.value ? parseFloat(e.target.value) : null, true)}
                            />
                          ) : (
                            <p>{profile.minimumProjectBudget ? `RM ${profile.minimumProjectBudget}` : "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maximumProjectBudget">Maximum Project Budget (RM)</Label>
                          {isEditing ? (
                            <Input
                              id="maximumProjectBudget"
                              type="number"
                              value={formData.providerProfile?.maximumProjectBudget || ""}
                              onChange={(e) => handleFieldChange("maximumProjectBudget", e.target.value ? parseFloat(e.target.value) : null, true)}
                            />
                          ) : (
                            <p>{profile.maximumProjectBudget ? `RM ${profile.maximumProjectBudget}` : "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferredProjectDuration">Preferred Project Duration</Label>
                          {isEditing ? (
                            <Input
                              id="preferredProjectDuration"
                              value={formData.providerProfile?.preferredProjectDuration || ""}
                              onChange={(e) => handleFieldChange("preferredProjectDuration", e.target.value, true)}
                              placeholder="e.g. 1-3 months"
                            />
                          ) : (
                            <p>{profile.preferredProjectDuration || "—"}</p>
                          )}
                        </div>
                        
                      </div>
                      <div className="space-y-2">
                        <Label>Skills</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add skill"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("skills", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.providerProfile?.skills?.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("skills", skill, "remove")}>
                                  {skill} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                              profile.skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No skills</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Languages</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add language"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("languages", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.providerProfile?.languages?.map((lang: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("languages", lang, "remove")}>
                                  {lang} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.languages && profile.languages.length > 0 ? (
                              profile.languages.map((lang: string, index: number) => (
                                <Badge key={index} variant="secondary">{lang}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No languages</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Resume Section for Providers */}
                {isProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingResume ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading resume...</span>
                        </div>
                      ) : resume ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium">Resume uploaded</p>
                              <p className="text-sm text-gray-500">
                                Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadResume}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No resume uploaded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {isCustomer && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        {isEditing ? (
                          <Textarea
                            id="description"
                            value={formData.customerProfile?.description || ""}
                            onChange={(e) => handleFieldChange("description", e.target.value, true)}
                            placeholder="Enter company description"
                            rows={4}
                          />
                        ) : (
                          <p>{profile.description || "—"}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          {isEditing ? (
                            <Input
                              id="industry"
                              value={formData.customerProfile?.industry || ""}
                              onChange={(e) => handleFieldChange("industry", e.target.value, true)}
                            />
                          ) : (
                            <p>{profile.industry || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          {isEditing ? (
                            <Input
                              id="location"
                              value={formData.customerProfile?.location || ""}
                              onChange={(e) => handleFieldChange("location", e.target.value, true)}
                            />
                          ) : (
                            <p>{profile.location || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companySize">Company Size</Label>
                          {isEditing ? (
                            <Input
                              id="companySize"
                              value={formData.customerProfile?.companySize || ""}
                              onChange={(e) => handleFieldChange("companySize", e.target.value, true)}
                            />
                          ) : (
                            <p>{profile.companySize || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeCount">Employee Count</Label>
                          {isEditing ? (
                            <Input
                              id="employeeCount"
                              type="number"
                              value={formData.customerProfile?.employeeCount || ""}
                              onChange={(e) => handleFieldChange("employeeCount", e.target.value ? parseInt(e.target.value) : null, true)}
                            />
                          ) : (
                            <p>{profile.employeeCount || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          {isEditing ? (
                            <Input
                              id="website"
                              type="url"
                              value={formData.customerProfile?.website || ""}
                              onChange={(e) => handleFieldChange("website", e.target.value, true)}
                              placeholder="https://..."
                            />
                          ) : (
                            <p>{profile.website ? (
                              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {profile.website}
                              </a>
                            ) : "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="annualRevenue">Annual Revenue</Label>
                          {isEditing ? (
                            <Input
                              id="annualRevenue"
                              value={formData.customerProfile?.annualRevenue || ""}
                              onChange={(e) => handleFieldChange("annualRevenue", e.target.value, true)}
                              placeholder="e.g. 500000"
                            />
                          ) : (
                            <p>{profile.annualRevenue || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="averageBudgetRange">Average Budget Range</Label>
                          {isEditing ? (
                            <Input
                              id="averageBudgetRange"
                              value={formData.customerProfile?.averageBudgetRange || ""}
                              onChange={(e) => handleFieldChange("averageBudgetRange", e.target.value, true)}
                              placeholder="e.g. 20000"
                            />
                          ) : (
                            <p>{profile.averageBudgetRange || "—"}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Preferred Contract Types</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add contract type"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("preferredContractTypes", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.customerProfile?.preferredContractTypes?.map((type: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("preferredContractTypes", type, "remove")}>
                                  {type} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.preferredContractTypes && profile.preferredContractTypes.length > 0 ? (
                              profile.preferredContractTypes.map((type: string, index: number) => (
                                <Badge key={index} variant="secondary">{type}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No contract types</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Social Links</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add social link (e.g. https://linkedin.com/company/example)"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("socialLinks", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.customerProfile?.socialLinks?.map((link: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("socialLinks", link, "remove")}>
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {link}
                                  </a> ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.socialLinks && profile.socialLinks.length > 0 ? (
                              profile.socialLinks.map((link: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {link}
                                  </a>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No social links</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="benefits">Benefits</Label>
                        {isEditing ? (
                          <Textarea
                            id="benefits"
                            value={formData.customerProfile?.benefits || ""}
                            onChange={(e) => handleFieldChange("benefits", e.target.value, true)}
                            placeholder="Enter company benefits"
                            rows={3}
                          />
                        ) : (
                          <p>{profile.benefits || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Languages</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add language"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("languages", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.customerProfile?.languages?.map((lang: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("languages", lang, "remove")}>
                                  {lang} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.languages && profile.languages.length > 0 ? (
                              profile.languages.map((lang: string, index: number) => (
                                <Badge key={index} variant="secondary">{lang}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No languages</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mission">Mission</Label>
                        {isEditing ? (
                          <Textarea
                            id="mission"
                            value={formData.customerProfile?.mission || ""}
                            onChange={(e) => handleFieldChange("mission", e.target.value, true)}
                            placeholder="Enter company mission"
                            rows={3}
                          />
                        ) : (
                          <p>{profile.mission || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Company Values</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add value"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("values", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.customerProfile?.values?.map((value: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("values", value, "remove")}>
                                  {value} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.values && profile.values.length > 0 ? (
                              profile.values.map((value: string, index: number) => (
                                <Badge key={index} variant="secondary">{value}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No values</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="establishedYear">Established Year</Label>
                          {isEditing ? (
                            <Input
                              id="establishedYear"
                              type="number"
                              value={formData.customerProfile?.establishedYear || ""}
                              onChange={(e) => handleFieldChange("establishedYear", e.target.value ? parseInt(e.target.value) : null, true)}
                            />
                          ) : (
                            <p>{profile.establishedYear || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fundingStage">Funding Stage</Label>
                          {isEditing ? (
                            <Input
                              id="fundingStage"
                              value={formData.customerProfile?.fundingStage || ""}
                              onChange={(e) => handleFieldChange("fundingStage", e.target.value, true)}
                              placeholder="e.g. Bootstrap, Seed, Series A"
                            />
                          ) : (
                            <p>{profile.fundingStage || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="remotePolicy">Remote Policy</Label>
                          {isEditing ? (
                            <Input
                              id="remotePolicy"
                              value={formData.customerProfile?.remotePolicy || ""}
                              onChange={(e) => handleFieldChange("remotePolicy", e.target.value, true)}
                              placeholder="On-site, Remote, Hybrid"
                            />
                          ) : (
                            <p>{profile.remotePolicy || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hiringFrequency">Hiring Frequency</Label>
                          {isEditing ? (
                            <Input
                              id="hiringFrequency"
                              value={formData.customerProfile?.hiringFrequency || ""}
                              onChange={(e) => handleFieldChange("hiringFrequency", e.target.value, true)}
                              placeholder="occasional, regular, enterprise"
                            />
                          ) : (
                            <p>{profile.hiringFrequency || "—"}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Categories Hiring For</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add category"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const value = (e.target as HTMLInputElement).value
                                    if (value.trim()) {
                                      handleArrayFieldChange("categoriesHiringFor", value, "add")
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.customerProfile?.categoriesHiringFor?.map((category: string, index: number) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayFieldChange("categoriesHiringFor", category, "remove")}>
                                  {category} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.categoriesHiringFor && profile.categoriesHiringFor.length > 0 ? (
                              profile.categoriesHiringFor.map((category: string, index: number) => (
                                <Badge key={index} variant="secondary">{category}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">No categories</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {user.KycDocument && user.KycDocument.length > 0 && (
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(user.KycDocument) && (user.KycDocument as Array<Record<string, unknown>>).map((doc) => (
                      <div key={doc.id as string} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{doc.filename as string}</p>
                            <p className="text-sm text-gray-500">{doc.type as string}</p>
                            <p className="text-xs text-gray-400">Status: {doc.status as string}</p>
                          </div>
                        </div>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${doc.fileUrl as string}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">View</Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {((user.projectsAsProvider && user.projectsAsProvider.length > 0) || (user.projectsAsCustomer && user.projectsAsCustomer.length > 0)) && (
            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isProvider ? "Projects as Provider" : isCustomer ? "Projects as Customer" : "Projects"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isProvider && Array.isArray(user.projectsAsProvider) && (user.projectsAsProvider as Array<Record<string, unknown>>).map((project) => (
                      <Link key={project.id as string} href={`/admin/projects/${project.id as string}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{project.title as string}</p>
                            {project.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description as string}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span>Status: <Badge variant="outline" className="ml-1">{project.status as string}</Badge></span>
                              {project.customer && (
                                <span>Customer: {(project.customer as Record<string, unknown>).name as string}</span>
                              )}
                              {project.budgetMin && project.budgetMax && (
                                <span>Budget: RM {Number(project.budgetMin).toLocaleString()} - RM {Number(project.budgetMax).toLocaleString()}</span>
                              )}
                              <span>Created: {new Date(project.createdAt as string).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </Link>
                    ))}
                    {isCustomer && Array.isArray(user.projectsAsCustomer) && (user.projectsAsCustomer as Array<Record<string, unknown>>).map((project) => (
                      <Link key={project.id as string} href={`/admin/projects/${project.id as string}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{project.title as string}</p>
                            {project.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description as string}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span>Status: <Badge variant="outline" className="ml-1">{project.status as string}</Badge></span>
                              {project.provider && (
                                <span>Provider: {(project.provider as Record<string, unknown>).name as string}</span>
                              )}
                              {project.budgetMin && project.budgetMax && (
                                <span>Budget: RM {Number(project.budgetMin).toLocaleString()} - RM {Number(project.budgetMax).toLocaleString()}</span>
                              )}
                              <span>Created: {new Date(project.createdAt as string).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </Link>
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

