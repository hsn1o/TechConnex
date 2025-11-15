"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, MapPin, Calendar, Award, Eye, Edit, Plus, Trash2, Upload, ExternalLink, CheckCircle, Loader2, X, Globe, Camera, AlertCircle } from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"
import { getProviderProfile, upsertProviderProfile, getProviderProfileStats, getProviderProfileCompletion, uploadProviderProfileImage, getProviderPortfolio, getMyCertifications, createCertification, updateCertification, deleteCertification } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRef } from "react"

export default function ProviderProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    phone: string;
    bio: string;
    location: string;
    hourlyRate: number;
    website: string;
    profileVideoUrl: string;
    profileImageUrl: string;
    languages: string[];
    availability: string;
    skills: string[];
    yearsExperience: number;
    minimumProjectBudget: number;
    maximumProjectBudget: number;
    preferredProjectDuration: string;
    workPreference: string;
    teamSize: number;
  }>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    hourlyRate: 0,
    website: "",
    profileVideoUrl: "",
    profileImageUrl: "",
    languages: [],
    availability: "available",
    skills: [],
    yearsExperience: 0,
    minimumProjectBudget: 0,
    maximumProjectBudget: 0,
    preferredProjectDuration: "",
    workPreference: "remote",
    teamSize: 1,
  })
  const [profileStats, setProfileStats] = useState({
    rating: 0,
    totalReviews: 0,
    totalProjects: 0,
    totalEarnings: 0,
    viewsCount: 0,
    successRate: 0,
    responseTime: 0,
    completion: 0,
  })
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [completionSuggestions, setCompletionSuggestions] = useState<string[]>([])
  const { toast } = useToast()
  
  // State for input fields (similar to registration form)
  const [customSkill, setCustomSkill] = useState("")
  const [customLanguage, setCustomLanguage] = useState("")
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("")
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])
  
  // State for portfolio projects
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(false)
  
  // State for certifications
  const [certifications, setCertifications] = useState<any[]>([])
  const [loadingCertifications, setLoadingCertifications] = useState(false)
  const [showCertDialog, setShowCertDialog] = useState(false)
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null)
  const [certFormData, setCertFormData] = useState({
    name: "",
    issuer: "",
    issuedDate: "",
    serialNumber: "",
    sourceUrl: "",
  })
  const [certFormErrors, setCertFormErrors] = useState<{
    name?: string;
    issuer?: string;
    issuedDate?: string;
    serialNumber?: string;
    sourceUrl?: string;
  }>({})

  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true)
        const [profileResponse, statsResponse, completionResponse] = await Promise.all([
          getProviderProfile(),
          getProviderProfileStats(),
          getProviderProfileCompletion()
        ])

        if (profileResponse.success) {
          const profile = profileResponse.data
          setProfileData({
            name: profile.user?.name || "",
            email: profile.user?.email || "",
            phone: profile.user?.phone || "",
            bio: profile.bio || "",
            location: profile.location || "",
            hourlyRate: profile.hourlyRate || 0,
            website: profile.website || "",
            profileVideoUrl: profile.profileVideoUrl || "",
            profileImageUrl: profile.profileImageUrl || "",
            languages: profile.languages || [],
            availability: profile.availability || "available",
            skills: profile.skills || [],
            yearsExperience: profile.yearsExperience || 0,
            minimumProjectBudget: profile.minimumProjectBudget || 0,
            maximumProjectBudget: profile.maximumProjectBudget || 0,
            preferredProjectDuration: profile.preferredProjectDuration || "",
            workPreference: profile.workPreference || "remote",
            teamSize: profile.teamSize || 1,
          })
          
          // Load portfolio URLs if available
          if (profile.portfolioUrls) {
            setPortfolioUrls(profile.portfolioUrls)
          } else if (profile.portfolio && Array.isArray(profile.portfolio)) {
            // Fallback for portfolio array structure
            setPortfolioUrls(profile.portfolio)
          }
        }

        if (statsResponse.success) {
          setProfileStats(statsResponse.data)
        }

        if (completionResponse.success) {
          setProfileCompletion(completionResponse.data.completion || 0)
          setCompletionSuggestions(completionResponse.data.suggestions || [])
        }
      } catch (error) {
        console.error("Error loading profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [toast])

  // Load portfolio projects
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoadingPortfolio(true);
        const response = await getProviderPortfolio();
        if (response.success && response.data) {
          setPortfolioProjects(response.data);
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
        toast({
          title: "Error",
          description: "Failed to load portfolio projects",
          variant: "destructive",
        });
      } finally {
        setLoadingPortfolio(false);
      }
    };

    loadPortfolio();
  }, [toast]);

  // Load certifications
  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoadingCertifications(true);
        const response = await getMyCertifications();
        if (response.success && response.data) {
          setCertifications(response.data);
        }
      } catch (error) {
        console.error("Error loading certifications:", error);
        toast({
          title: "Error",
          description: "Failed to load certifications",
          variant: "destructive",
        });
      } finally {
        setLoadingCertifications(false);
      }
    };

    loadCertifications();
  }, [toast]);

  // Save profile data
  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      const response = await upsertProviderProfile({
        bio: profileData.bio,
        location: profileData.location,
        hourlyRate: profileData.hourlyRate,
        availability: profileData.availability,
        languages: profileData.languages,
        website: profileData.website,
        profileVideoUrl: profileData.profileVideoUrl,
        skills: profileData.skills,
        portfolioUrls: portfolioUrls,
        yearsExperience: profileData.yearsExperience,
        minimumProjectBudget: profileData.minimumProjectBudget,
        maximumProjectBudget: profileData.maximumProjectBudget,
        preferredProjectDuration: profileData.preferredProjectDuration,
        workPreference: profileData.workPreference,
        teamSize: profileData.teamSize,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        setIsEditing(false)
        // Reload completion percentage and suggestions
        const completionResponse = await getProviderProfileCompletion()
        if (completionResponse.success) {
          setProfileCompletion(completionResponse.data.completion || 0)
          setCompletionSuggestions(completionResponse.data.suggestions || [])
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle skills array changes
  const handleSkillsChange = (skills: string[]) => {
    setProfileData(prev => ({
      ...prev,
      skills
    }))
  }

  // Handle languages array changes
  const handleLanguagesChange = (languages: string[]) => {
    setProfileData(prev => ({
      ...prev,
      languages
    }))
  }

  // Popular skills and languages (same as registration form)
  const popularSkills = [
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "PHP",
    "Mobile Development",
    "iOS",
    "Android",
    "Flutter",
    "React Native",
    "Cloud Computing",
    "AWS",
    "Azure",
    "Google Cloud",
    "DevOps",
    "Database",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "UI/UX Design",
    "Figma",
    "Adobe XD",
    "Photoshop",
    "Cybersecurity",
    "Blockchain",
    "IoT",
    "AI/ML",
    "Data Science",
  ]

  const commonLanguages = [
    "English",
    "Bahasa Malaysia",
    "Mandarin",
    "Tamil",
    "Cantonese",
    "Hokkien",
    "Hindi",
    "Arabic",
    "Japanese",
    "Korean",
    "French",
    "German",
  ]

  // Handler functions for adding/removing items
  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !profileData.skills.includes(customSkill.trim())) {
      handleSkillsChange([...profileData.skills, customSkill.trim()])
      setCustomSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    handleSkillsChange(profileData.skills.filter(s => s !== skill))
  }

  const handleSkillToggle = (skill: string) => {
    if (profileData.skills.includes(skill)) {
      handleRemoveSkill(skill)
    } else {
      handleSkillsChange([...profileData.skills, skill])
    }
  }

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim() && !profileData.languages.includes(customLanguage.trim())) {
      handleLanguagesChange([...profileData.languages, customLanguage.trim()])
      setCustomLanguage("")
    }
  }

  const handleRemoveLanguage = (language: string) => {
    handleLanguagesChange(profileData.languages.filter(l => l !== language))
  }

  const handleLanguageToggle = (language: string) => {
    if (profileData.languages.includes(language)) {
      handleRemoveLanguage(language)
    } else {
      handleLanguagesChange([...profileData.languages, language])
    }
  }

  const handleAddPortfolioUrl = () => {
    if (newPortfolioUrl.trim() && !portfolioUrls.includes(newPortfolioUrl.trim())) {
      setPortfolioUrls([...portfolioUrls, newPortfolioUrl.trim()])
      setNewPortfolioUrl("")
    }
  }

  const handleRemovePortfolioUrl = (url: string) => {
    setPortfolioUrls(portfolioUrls.filter(u => u !== url))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    try {
      const result = await uploadProviderProfileImage(file)
      setProfileData(prev => ({
        ...prev,
        profileImageUrl: result.data.profileImageUrl,
      }))
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      })
      // Reload completion percentage and suggestions
      const completionResponse = await getProviderProfileCompletion()
      if (completionResponse.success) {
        setProfileCompletion(completionResponse.data.completion || 0)
        setCompletionSuggestions(completionResponse.data.suggestions || [])
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </ProviderLayout>
    )
  }

  // Certification handlers
  const handleAddCertification = () => {
    setEditingCertIndex(null);
    setCertFormData({
      name: "",
      issuer: "",
      issuedDate: "",
      serialNumber: "",
      sourceUrl: "",
    });
    setCertFormErrors({});
    setShowCertDialog(true);
  };

  const handleEditCertification = (index: number) => {
    const cert = certifications[index];
    setEditingCertIndex(index);
    setCertFormData({
      name: cert.name || "",
      issuer: cert.issuer || "",
      issuedDate: cert.issuedDate ? new Date(cert.issuedDate).toISOString().split('T')[0] : "",
      serialNumber: cert.serialNumber || "",
      sourceUrl: cert.sourceUrl || "",
    });
    setCertFormErrors({});
    setShowCertDialog(true);
  };

  const validateCertification = () => {
    const errors: typeof certFormErrors = {};
    
    if (!certFormData.name.trim()) {
      errors.name = "Certification name is required";
    }
    
    if (!certFormData.issuer.trim()) {
      errors.issuer = "Issuing organization is required";
    }
    
    if (!certFormData.issuedDate) {
      errors.issuedDate = "Issue date is required";
    }
    
    // At least one of serialNumber or sourceUrl must be provided
    if (!certFormData.serialNumber?.trim() && !certFormData.sourceUrl?.trim()) {
      errors.serialNumber = "At least one of serial number or verification link is required";
      errors.sourceUrl = "At least one of serial number or verification link is required";
    }

    setCertFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCertification = async () => {
    if (!validateCertification()) {
      return;
    }

    try {
      setSaving(true);
      const certData = {
        name: certFormData.name.trim(),
        issuer: certFormData.issuer.trim(),
        issuedDate: certFormData.issuedDate,
        serialNumber: certFormData.serialNumber?.trim() || undefined,
        sourceUrl: certFormData.sourceUrl?.trim() || undefined,
      };

      if (editingCertIndex !== null) {
        // Update existing certification
        const certId = certifications[editingCertIndex].id;
        const response = await updateCertification(certId, certData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Certification updated successfully",
          });
          // Reload certifications
          const certsResponse = await getMyCertifications();
          if (certsResponse.success && certsResponse.data) {
            setCertifications(certsResponse.data);
          }
          // Reload completion percentage and suggestions
          const completionResponse = await getProviderProfileCompletion()
          if (completionResponse.success) {
            setProfileCompletion(completionResponse.data.completion || 0)
            setCompletionSuggestions(completionResponse.data.suggestions || [])
          }
        }
      } else {
        // Create new certification
        const response = await createCertification(certData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Certification added successfully",
          });
          // Reload certifications
          const certsResponse = await getMyCertifications();
          if (certsResponse.success && certsResponse.data) {
            setCertifications(certsResponse.data);
          }
          // Reload completion percentage and suggestions
          const completionResponse = await getProviderProfileCompletion()
          if (completionResponse.success) {
            setProfileCompletion(completionResponse.data.completion || 0)
            setCompletionSuggestions(completionResponse.data.suggestions || [])
          }
        }
      }

      setShowCertDialog(false);
      setCertFormData({
        name: "",
        issuer: "",
        issuedDate: "",
        serialNumber: "",
        sourceUrl: "",
      });
      setEditingCertIndex(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save certification",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCertification = async (index: number) => {
    const cert = certifications[index];
    if (!cert.id) return;

    if (!confirm("Are you sure you want to delete this certification?")) {
      return;
    }

    try {
      setSaving(true);
      const response = await deleteCertification(cert.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Certification deleted successfully",
        });
        // Reload certifications
        const certsResponse = await getMyCertifications();
        if (certsResponse.success && certsResponse.data) {
          setCertifications(certsResponse.data);
        }
        // Reload completion percentage and suggestions
        const completionResponse = await getProviderProfileCompletion()
        if (completionResponse.success) {
          setProfileCompletion(completionResponse.data.completion || 0)
          setCompletionSuggestions(completionResponse.data.suggestions || [])
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete certification",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const reviews = [
    {
      id: 1,
      client: "John Doe",
      company: "TechStart Sdn Bhd",
      rating: 5,
      comment:
        "Ahmad delivered exceptional work on our e-commerce platform. His technical expertise and attention to detail exceeded our expectations.",
      project: "E-commerce Platform Development",
      date: "2024-01-20",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      client: "Sarah Chen",
      company: "Digital Solutions",
      rating: 5,
      comment: "Outstanding developer! The mobile app was delivered on time and works flawlessly. Highly recommended!",
      project: "Mobile Banking App",
      date: "2023-12-25",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      client: "Mike Johnson",
      company: "Manufacturing Corp",
      rating: 4,
      comment: "Great work on the cloud infrastructure. Ahmad is very knowledgeable and professional.",
      project: "Cloud Infrastructure Setup",
      date: "2023-12-05",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your professional profile and showcase your expertise</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview Profile
            </Button>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
                Edit Profile
            </Button>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-blue-900">Profile Completion</h3>
                <p className="text-sm text-blue-700">Complete your profile to attract more clients</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{profileCompletion}%</p>
              </div>
            </div>
            <Progress value={profileCompletion} className="h-2 mb-4" />
            {completionSuggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-blue-900 mb-2">To complete your profile:</p>
                <ul className="space-y-1">
                  {completionSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profileCompletion === 100 && (
              <div className="mt-4 flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Your profile is complete! 🎉</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage 
                            src={
                              profileData.profileImageUrl
                                ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${profileData.profileImageUrl.startsWith("/") ? "" : "/"}${profileData.profileImageUrl}`
                                : "/placeholder.svg?height=96&width=96"
                            }
                          />
                          <AvatarFallback className="text-lg">
                            {profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'PR'}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <Button 
                              size="sm" 
                              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                              onClick={handleImageClick}
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Camera className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        {isEditing ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  value={profileData.name}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={profileData.email}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  value={profileData.phone}
                                  onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                  id="location"
                                  value={profileData.location}
                                  onChange={(e) => handleInputChange('location', e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea
                                id="bio"
                                value={profileData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                placeholder="Tell clients about your experience and expertise..."
                                rows={4}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                              <p className="text-lg text-gray-600">{profileData.email}</p>
                              <p className="text-gray-500">{profileData.phone}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {profileData.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                {profileStats.rating} ({profileStats.totalReviews} reviews)
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Joined Jan 2023
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className={`w-4 h-4 ${
                                  profileData.availability === "available" 
                                    ? "text-green-500" 
                                    : profileData.availability === "busy" 
                                    ? "text-yellow-500" 
                                    : "text-gray-400"
                                }`} />
                                <span className="capitalize">{profileData.availability || "available"}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                    <div>
                        <Label>Professional Bio</Label>
                        <p className="text-gray-600 mt-2">{profileData.bio || "No bio provided"}</p>
                    </div>
                    )}

                    {isEditing && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate (RM)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            value={profileData.hourlyRate}
                            onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="availability">Availability</Label>
                          <Select
                            value={profileData.availability}
                            onValueChange={(value) => handleInputChange('availability', value)}
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
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certifications
                      </CardTitle>
                      {isEditing && (
                        <Button size="sm" onClick={handleAddCertification}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Certification
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingCertifications ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading certifications...</span>
                      </div>
                    ) : certifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No certifications added yet</p>
                        {isEditing && (
                          <p className="text-sm mt-2">
                            Click "Add Certification" to add your professional certifications
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {certifications.map((cert, index) => (
                          <div key={cert.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{cert.name}</p>
                                  {cert.verified && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-gray-600">{cert.issuer}</p>
                                <p className="text-xs text-gray-500">
                                  Issued: {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : "N/A"}
                                </p>
                                {cert.serialNumber && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Serial: {cert.serialNumber}
                                  </p>
                                )}
                                {cert.sourceUrl && (
                                  <a
                                    href={cert.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                  >
                                    Verify Certificate ↗
                                  </a>
                                )}
                              </div>
                            </div>
                            {isEditing && (
                              <div className="flex gap-2 ml-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditCertification(index)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteCertification(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* 
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Projects</span>
                      <span className="font-semibold">{profileStats.totalProjects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-semibold">{profileStats.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="font-semibold">RM {profileStats.totalEarnings}</span>
                    </div>
                  </CardContent>
                </Card>
                */}

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="sidebar-email">Email</Label>
                          <Input
                            id="sidebar-email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sidebar-phone">Phone</Label>
                          <Input
                            id="sidebar-phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sidebar-website">Website</Label>
                          <Input
                            id="sidebar-website"
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label>Languages *</Label>
                          <p className="text-sm text-gray-600">
                            Add languages you can communicate in
                          </p>
                          
                          <div className="flex gap-2">
                          <Input
                              value={customLanguage}
                              onChange={(e) => setCustomLanguage(e.target.value)}
                              placeholder="Type a language and press Add"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), handleAddCustomLanguage())
                              }
                            />
                            <Button
                              type="button"
                              onClick={handleAddCustomLanguage}
                              variant="outline"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {profileData.languages.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Selected Languages ({profileData.languages.length})
                              </Label>
                              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                                {profileData.languages.map((language) => (
                                  <Badge
                                    key={language}
                                    className="bg-green-600 hover:bg-green-700 text-white pr-1"
                                  >
                                    {language}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveLanguage(language)}
                                      className="ml-1 hover:bg-green-800 rounded-full p-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Common Languages (click to add)
                            </Label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                              {commonLanguages
                                .filter((language) => !profileData.languages.includes(language))
                                .map((language) => (
                                  <Badge
                                    key={language}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                    onClick={() => handleLanguageToggle(language)}
                                  >
                                    {language}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{profileData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{profileData.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          {profileData.website ? (
                          <a
                            href={profileData.website}
                            className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {profileData.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          ) : (
                            <p className="font-medium text-gray-500">No website provided</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Languages</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profileData.languages.map((language, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                            {profileData.languages.length === 0 && (
                              <p className="text-gray-500 text-sm">No languages specified</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio URLs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio URLs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <p className="text-sm text-gray-600">
                          Add links to your GitHub, LinkedIn, or other professional profiles
                        </p>
                        <div className="flex gap-2">
                          <Input
                            value={newPortfolioUrl}
                            onChange={(e) => setNewPortfolioUrl(e.target.value)}
                            placeholder="https://github.com/yourusername"
                            type="url"
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), handleAddPortfolioUrl())
                            }
                          />
                          <Button
                            type="button"
                            onClick={handleAddPortfolioUrl}
                            variant="outline"
                          >
                            <Plus className="w-4 h-4" />
                        </Button>
                        </div>

                        {portfolioUrls.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Portfolio Links ({portfolioUrls.length})
                            </Label>
                            <div className="space-y-2">
                              {portfolioUrls.map((url, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg"
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-sm truncate flex-1"
                                  >
                                    {url}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePortfolioUrl(url)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {portfolioUrls.length === 0 && (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No portfolio links added yet</p>
                            <p className="text-sm">
                              Add links to showcase your work and professional profiles
                            </p>
                    </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-2">
                        {portfolioUrls.length > 0 ? (
                          portfolioUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              {url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No portfolio links added</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio */}
          <TabsContent value="portfolio">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Portfolio</h2>
                  <p className="text-gray-600">Showcase your completed projects</p>
                </div>
              </div>

              {loadingPortfolio ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading portfolio...</span>
                </div>
              ) : portfolioProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed projects yet</h3>
                    <p className="text-gray-600">
                      Your completed projects will appear here automatically once you finish working on them.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 h-48 flex items-center justify-center rounded-t-lg">
                        <div className="text-center p-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Award className="w-8 h-8 text-blue-600" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {project.category || "Project"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description || "No description provided"}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies.slice(0, 6).map((tech: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 6 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.technologies.length - 6} more
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span className="font-medium">{project.client}</span>
                          {project.completedDate && (
                            <span>{new Date(project.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {project.approvedPrice && (
                          <div className="text-sm text-green-600 font-semibold">
                            RM {Number(project.approvedPrice).toLocaleString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Skills & Expertise</h2>
                  <p className="text-gray-600">Showcase your technical skills and expertise</p>
                </div>
                {isEditing && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
                )}
              </div>

              {isEditing ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <Label>Technical Skills *</Label>
                        <p className="text-sm text-gray-600">
                          Add your technical skills and expertise
                        </p>
                        
                        <div className="flex gap-2">
                        <Input
                            value={customSkill}
                            onChange={(e) => setCustomSkill(e.target.value)}
                            placeholder="Type a skill and press Add"
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), handleAddCustomSkill())
                            }
                          />
                          <Button
                            type="button"
                            onClick={handleAddCustomSkill}
                            variant="outline"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {profileData.skills.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Selected Skills ({profileData.skills.length})
                            </Label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                              {profileData.skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  className="bg-blue-600 hover:bg-blue-700 text-white pr-1"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="ml-1 hover:bg-blue-800 rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Popular Skills (click to add)
                          </Label>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-gray-50">
                            {popularSkills
                              .filter((skill) => !profileData.skills.includes(skill))
                              .map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                  onClick={() => handleSkillToggle(skill)}
                                >
                                  {skill}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <Input
                            id="yearsExperience"
                            type="number"
                            value={profileData.yearsExperience}
                            onChange={(e) => handleInputChange('yearsExperience', Number(e.target.value))}
                          />
                      </div>
                        <div>
                          <Label htmlFor="workPreference">Work Preference</Label>
                          <Select
                            value={profileData.workPreference}
                            onValueChange={(value) => handleInputChange('workPreference', value)}
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
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minimumProjectBudget">Minimum Project Budget (RM)</Label>
                          <Input
                            id="minimumProjectBudget"
                            type="number"
                            value={profileData.minimumProjectBudget}
                            onChange={(e) => handleInputChange('minimumProjectBudget', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maximumProjectBudget">Maximum Project Budget (RM)</Label>
                          <Input
                            id="maximumProjectBudget"
                            type="number"
                            value={profileData.maximumProjectBudget}
                            onChange={(e) => handleInputChange('maximumProjectBudget', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="preferredProjectDuration">Preferred Project Duration</Label>
                          <Input
                            id="preferredProjectDuration"
                            value={profileData.preferredProjectDuration}
                            onChange={(e) => handleInputChange('preferredProjectDuration', e.target.value)}
                            placeholder="e.g., 1-3 months, 3-6 months..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="teamSize">Team Size</Label>
                          <Input
                            id="teamSize"
                            type="number"
                            value={profileData.teamSize}
                            onChange={(e) => handleInputChange('teamSize', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                        {profileData.skills.length === 0 && (
                          <p className="text-gray-500">No skills added yet</p>
                        )}
              </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Experience & Preferences</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Years of Experience</p>
                            <p className="font-medium">{profileData.yearsExperience} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Work Preference</p>
                            <p className="font-medium capitalize">{profileData.workPreference}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Team Size</p>
                            <p className="font-medium">{profileData.teamSize} person(s)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Project Preferences</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Budget Range</p>
                            <p className="font-medium">
                              RM {profileData.minimumProjectBudget} - RM {profileData.maximumProjectBudget}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Preferred Duration</p>
                            <p className="font-medium">{profileData.preferredProjectDuration || "Not specified"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Client Reviews</h2>
                  <p className="text-gray-600">What clients say about working with you</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold">{profileStats.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500">{profileStats.totalReviews} reviews</p>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{review.client.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.client}</p>
                              <p className="text-sm text-gray-600">{review.company}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{review.project}</span>
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

        </Tabs>

        {/* Certification Dialog */}
        <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCertIndex !== null ? "Edit Certification" : "Add Certification"}
              </DialogTitle>
              <DialogDescription>
                Add your professional certifications to showcase your expertise
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Why add certifications?
                    </p>
                    <p className="text-sm text-blue-700">
                      Certifications help build trust with clients and showcase your expertise in specific technologies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certName">Certification Name *</Label>
                  <Input
                    id="certName"
                    placeholder="e.g., AWS Certified Solutions Architect"
                    value={certFormData.name}
                    onChange={(e) => setCertFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  {certFormErrors.name && (
                    <p className="text-xs text-red-600">{certFormErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certIssuer">Issuing Organization *</Label>
                  <Input
                    id="certIssuer"
                    placeholder="e.g., Amazon Web Services"
                    value={certFormData.issuer}
                    onChange={(e) => setCertFormData(prev => ({ ...prev, issuer: e.target.value }))}
                  />
                  {certFormErrors.issuer && (
                    <p className="text-xs text-red-600">{certFormErrors.issuer}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certDate">Issue Date *</Label>
                <Input
                  id="certDate"
                  type="date"
                  value={certFormData.issuedDate}
                  onChange={(e) => setCertFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                />
                {certFormErrors.issuedDate && (
                  <p className="text-xs text-red-600">{certFormErrors.issuedDate}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certSerial">
                    Serial Number (optional*)
                  </Label>
                  <Input
                    id="certSerial"
                    placeholder="e.g. ABC-123-XYZ"
                    value={certFormData.serialNumber}
                    onChange={(e) => setCertFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                  {certFormErrors.serialNumber && (
                    <p className="text-xs text-red-600">{certFormErrors.serialNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certLink">
                    Verification Link (optional*)
                  </Label>
                  <Input
                    id="certLink"
                    type="url"
                    placeholder="https://verify.issuer.com/cert/ABC-123"
                    value={certFormData.sourceUrl}
                    onChange={(e) => setCertFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  />
                  {certFormErrors.sourceUrl && (
                    <p className="text-xs text-red-600">{certFormErrors.sourceUrl}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    *At least one of Serial Number or Verification Link is required.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCertDialog(false);
                  setCertFormData({
                    name: "",
                    issuer: "",
                    issuedDate: "",
                    serialNumber: "",
                    sourceUrl: "",
                  });
                  setEditingCertIndex(null);
                  setCertFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCertification}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    {editingCertIndex !== null ? "Update Certification" : "Add Certification"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProviderLayout>
  )
}
