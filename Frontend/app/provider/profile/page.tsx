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
import { Star, MapPin, Calendar, Award, Eye, Edit, Plus, Trash2, Upload, ExternalLink, CheckCircle, Loader2, X, Globe } from "lucide-react"
import { ProviderLayout } from "@/components/provider-layout"
import { getProviderProfile, upsertProviderProfile, getProviderProfileStats, getProviderProfileCompletion } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProviderProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    hourlyRate: 0,
    website: "",
    profileVideoUrl: "",
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
  const { toast } = useToast()
  
  // State for input fields (similar to registration form)
  const [customSkill, setCustomSkill] = useState("")
  const [customLanguage, setCustomLanguage] = useState("")
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("")
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])

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
          setProfileCompletion(completionResponse.data.completion)
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
        // Reload completion percentage
        const completionResponse = await getProviderProfileCompletion()
        if (completionResponse.success) {
          setProfileCompletion(completionResponse.data.completion)
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

  const portfolio = [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with payment integration and admin dashboard",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      url: "https://example-ecommerce.com",
      client: "TechStart Sdn Bhd",
      completedDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Mobile Banking App",
      description: "Secure mobile banking application with biometric authentication",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React Native", "Firebase", "Node.js"],
      url: "https://example-banking.com",
      client: "Financial Corp",
      completedDate: "2023-12-20",
    },
    {
      id: 3,
      title: "Cloud Infrastructure",
      description: "Scalable cloud infrastructure setup with auto-scaling and monitoring",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
      url: "https://example-cloud.com",
      client: "Manufacturing Corp",
      completedDate: "2023-11-30",
    },
  ]

  const certifications = [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-06-15",
      credentialId: "AWS-SA-2023-001",
      verified: true,
    },
    {
      name: "Google Cloud Professional Developer",
      issuer: "Google Cloud",
      date: "2023-03-20",
      credentialId: "GCP-PD-2023-002",
      verified: true,
    },
    {
      name: "MongoDB Certified Developer",
      issuer: "MongoDB University",
      date: "2022-12-10",
      credentialId: "MDB-DEV-2022-003",
      verified: true,
    },
  ]

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
            <Progress value={profileCompletion} className="h-2" />
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-blue-100 text-blue-800">Add more portfolio items</Badge>
              <Badge className="bg-blue-100 text-blue-800">Upload profile video</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                          <AvatarImage src="/placeholder.svg?height=96&width=96" />
                          <AvatarFallback className="text-lg">AR</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                            <Upload className="w-4 h-4" />
                          </Button>
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
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Certification
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {certifications.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{cert.name}</p>
                                {cert.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                              <p className="text-sm text-gray-600">{cert.issuer}</p>
                              <p className="text-xs text-gray-500">Issued: {cert.date}</p>
                            </div>
                          </div>
                          {isEditing && (
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats */}
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="font-semibold">{profileStats.responseTime} hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile Views</span>
                      <span className="font-semibold">{profileStats.viewsCount}</span>
                    </div>
                  </CardContent>
                </Card>

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
                  <p className="text-gray-600">Showcase your best work and projects</p>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Button variant="outline" size="sm" className="bg-white/90">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{project.client}</span>
                        <span>{project.completedDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

          {/* Settings */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-gray-600">Manage your profile visibility and preferences</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Visibility</CardTitle>
                  <CardDescription>Control who can see your profile and contact you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="visibility">Profile Visibility</Label>
                    <Select defaultValue="public">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Visible to all users</SelectItem>
                        <SelectItem value="verified">Verified Clients Only</SelectItem>
                        <SelectItem value="private">Private - Hidden from search</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contact-preference">Contact Preference</Label>
                    <Select defaultValue="platform">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">Through Platform Only</SelectItem>
                        <SelectItem value="direct">Allow Direct Contact</SelectItem>
                        <SelectItem value="verified">Verified Clients Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Current Status</Label>
                    <Select defaultValue="available">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available for new projects</SelectItem>
                        <SelectItem value="busy">Busy - Limited availability</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="response-time">Expected Response Time</Label>
                    <Select defaultValue="2-hours">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-hour">Within 1 hour</SelectItem>
                        <SelectItem value="2-hours">Within 2 hours</SelectItem>
                        <SelectItem value="4-hours">Within 4 hours</SelectItem>
                        <SelectItem value="24-hours">Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProviderLayout>
  )
}
