"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  MapPin,
  Calendar,
  Award,
  Eye,
  Edit,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { ProviderLayout } from "@/components/provider-layout";

export default function ProviderProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // Performance state
  const [performance, setPerformance] = useState({
    totalProjects: 0,
    completionRate: 0,
    onTimeDelivery: 0,
    repeatClients: 0,
    responseRate: "0%",
  });
  const [performanceLoading, setPerformanceLoading] = useState(true);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    kycStatus: "",
    isVerified: false,
    createdAt: "",
    providerProfile: {
      location: "",
      bio: "",
      hourlyRate: null,
      availability: null,
      portfolioUrls: [],
      profileVideoUrl: "",
      languages: [],
      rating: "0",
      totalReviews: 0,
      totalProjects: 0,
      totalEarnings: "0",
      viewsCount: 0,
      successRate: "0",
      responseTime: 0,
      isFeatured: false,
      isVerified: false,
      skills: [],
      yearsExperience: 0,
      website: "",
      completion: 0,
      minimumProjectBudget: null,
      maximumProjectBudget: null,
      preferredProjectDuration: null,
      workPreference: "remote",
      teamSize: 1,
      companySize: null,
      certifications: [],
    },
    resume: {
      fileUrl: "",
      description: "",
      uploadedAt: "",
    },
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const skills = [
    { name: "React", level: 95, category: "Frontend" },
    { name: "Node.js", level: 90, category: "Backend" },
    { name: "TypeScript", level: 88, category: "Language" },
    { name: "AWS", level: 85, category: "Cloud" },
    { name: "MongoDB", level: 82, category: "Database" },
    { name: "Next.js", level: 90, category: "Framework" },
    { name: "Python", level: 75, category: "Language" },
    { name: "Docker", level: 80, category: "DevOps" },
  ];

  const portfolio = [
    {
      id: 1,
      title: "E-commerce Platform",
      description:
        "Full-stack e-commerce solution with payment integration and admin dashboard",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      url: "https://example-ecommerce.com",
      client: "TechStart Sdn Bhd",
      completedDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Mobile Banking App",
      description:
        "Secure mobile banking application with biometric authentication",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["React Native", "Firebase", "Node.js"],
      url: "https://example-banking.com",
      client: "Financial Corp",
      completedDate: "2023-12-20",
    },
    {
      id: 3,
      title: "Cloud Infrastructure",
      description:
        "Scalable cloud infrastructure setup with auto-scaling and monitoring",
      image: "/placeholder.svg?height=200&width=300",
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
      url: "https://example-cloud.com",
      client: "Manufacturing Corp",
      completedDate: "2023-11-30",
    },
  ];

  // Certifications will be fetched from userProfile.providerProfile.certifications

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
      comment:
        "Outstanding developer! The mobile app was delivered on time and works flawlessly. Highly recommended!",
      project: "Mobile Banking App",
      date: "2023-12-25",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      client: "Mike Johnson",
      company: "Manufacturing Corp",
      rating: 4,
      comment:
        "Great work on the cloud infrastructure. Ahmad is very knowledgeable and professional.",
      project: "Cloud Infrastructure Setup",
      date: "2023-12-05",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const stats = {
    totalProjects: 45,
    completedProjects: 43,
    rating: 4.9,
    reviewCount: 127,
    responseTime: "2 hours",
    completionRate: 98,
    onTimeDelivery: 94,
    repeatClients: 67,
  };

  const profileCompletion = 92;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

  useEffect(() => {
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    const userId = user?.id;

    if (!userId) {
      setProfileLoading(false);
      setPerformanceLoading(false);
      return;
    }

    // 1) fetch the user by id
    fetch(`${API_BASE}${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("User profile data:", data);
        setUserProfile(data);

        // 2) fetch performance by providerProfile.id (if available)
        const providerId = data?.providerProfile?.id;
        if (!providerId) {
          setPerformanceLoading(false);
          return;
        }
        return fetch(`${API_BASE}providers/${providerId}/performance`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then((perf) => {
            setPerformance({
              totalProjects: perf.totalProjects || 0,
              completionRate: perf.completionRate || 0,
              onTimeDelivery: perf.onTimeDelivery || 0,
              repeatClients: perf.repeatClients || 0,
              responseRate: perf.responseRate || "0%",
            });
          })
          .catch((err) => {
            console.error("Error fetching provider performance:", err);
            setPerformance({
              totalProjects: 0,
              completionRate: 0,
              onTimeDelivery: 0,
              repeatClients: 0,
              responseRate: "0%",
            });
          })
          .finally(() => setPerformanceLoading(false));
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        console.error("User ID:", userId);
        console.error("API URL:", `${API_BASE}${userId}`);
      })
      .finally(() => setProfileLoading(false));
  }, []);

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">
              Manage your professional profile and showcase your expertise
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled={profileLoading}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Profile
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              disabled={profileLoading}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {profileLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading */}
        {!profileLoading && (
          <>
            {/* Profile Completion */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Profile Completion
                    </h3>
                    <p className="text-sm text-blue-700">
                      Complete your profile to attract more clients
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {userProfile.providerProfile?.completion || 0}%
                    </p>
                  </div>
                </div>
                <Progress
                  value={userProfile.providerProfile?.completion || 0}
                  className="h-2"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    Add more portfolio items
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    Upload profile video
                  </Badge>
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
                              <AvatarFallback className="text-lg">
                                AR
                              </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                              <Button
                                size="sm"
                                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                              >
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
                                      value={userProfile.name}
                                      onChange={(e) =>
                                        setUserProfile({
                                          ...userProfile,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="title">
                                      Professional Title
                                    </Label>
                                    <Input
                                      id="title"
                                      value={
                                        userProfile.providerProfile
                                          ?.yearsExperience
                                          ? `${userProfile.providerProfile.yearsExperience} Years Experience`
                                          : "Developer"
                                      }
                                      onChange={(e) =>
                                        setUserProfile({
                                          ...userProfile,
                                          providerProfile: {
                                            ...userProfile.providerProfile,
                                            yearsExperience:
                                              parseInt(e.target.value) || 0,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                      id="company"
                                      value={
                                        userProfile.providerProfile
                                          ?.companySize || ""
                                      }
                                      onChange={(e) =>
                                        setUserProfile({
                                          ...userProfile,
                                          providerProfile: {
                                            ...userProfile.providerProfile,
                                            companySize: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Select
                                      value={
                                        userProfile.providerProfile?.location ||
                                        ""
                                      }
                                      onValueChange={(value) =>
                                        setUserProfile({
                                          ...userProfile,
                                          providerProfile: {
                                            ...userProfile.providerProfile,
                                            location: value,
                                          },
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Kuala Lumpur">
                                          Kuala Lumpur
                                        </SelectItem>
                                        <SelectItem value="Selangor">
                                          Selangor
                                        </SelectItem>
                                        <SelectItem value="Penang">
                                          Penang
                                        </SelectItem>
                                        <SelectItem value="Johor">
                                          Johor
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    {userProfile.name}
                                  </h2>
                                  <p className="text-lg text-gray-600">
                                    {userProfile.providerProfile
                                      ?.yearsExperience
                                      ? `${userProfile.providerProfile.yearsExperience} Years Experience`
                                      : "Developer"}
                                  </p>
                                  <p className="text-gray-500">
                                    {userProfile.providerProfile?.companySize ||
                                      "Freelancer"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {userProfile.providerProfile?.location ||
                                      "Not specified"}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    {userProfile.providerProfile.rating ||
                                      "Not specified"}{" "}
                                    ({userProfile.providerProfile.rating}{" "}
                                    reviews)
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined{" "}
                                    {userProfile.createdAt || "Not specified"}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bio">Professional Bio</Label>
                          {isEditing ? (
                            <Textarea
                              id="bio"
                              value={userProfile.providerProfile?.bio || ""}
                              onChange={(e) =>
                                setUserProfile({
                                  ...userProfile,
                                  providerProfile: {
                                    ...userProfile.providerProfile,
                                    bio: e.target.value,
                                  },
                                })
                              }
                              className="mt-2"
                              rows={4}
                            />
                          ) : (
                            <p className="text-gray-600 mt-2">
                              {userProfile.providerProfile?.bio ||
                                "No bio available"}
                            </p>
                          )}
                        </div>

                        {isEditing && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="hourlyRate">
                                Hourly Rate (RM)
                              </Label>
                              <Input
                                id="hourlyRate"
                                type="number"
                                value={
                                  userProfile.providerProfile?.hourlyRate || ""
                                }
                                onChange={(e) =>
                                  setUserProfile({
                                    ...userProfile,
                                    providerProfile: {
                                      ...userProfile.providerProfile,
                                      hourlyRate:
                                        Number.parseInt(e.target.value) || null,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="availability">Availability</Label>
                              <Select
                                value={
                                  userProfile.providerProfile?.availability ||
                                  "Available"
                                }
                                onValueChange={(value) =>
                                  setUserProfile({
                                    ...userProfile,
                                    providerProfile: {
                                      ...userProfile.providerProfile,
                                      availability: value,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Available">
                                    Available
                                  </SelectItem>
                                  <SelectItem value="Busy">Busy</SelectItem>
                                  <SelectItem value="Unavailable">
                                    Unavailable
                                  </SelectItem>
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
                          {profileLoading ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : Array.isArray(
                              userProfile.providerProfile?.certifications
                            ) &&
                            userProfile.providerProfile.certifications.length >
                              0 ? (
                            userProfile.providerProfile.certifications.map(
                              (cert, index) => (
                                <div
                                  key={cert.id || index}
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Award className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                          {cert.name || "No name"}
                                        </p>
                                        {cert.verified && (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {cert.issuer || "No issuer"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Issued:{" "}
                                        {cert.issuedDate
                                          ? new Date(
                                              cert.issuedDate
                                            ).toLocaleDateString() !==
                                            "Invalid Date"
                                            ? new Date(
                                                cert.issuedDate
                                              ).toLocaleDateString()
                                            : "Invalid Date"
                                          : "N/A"}
                                      </p>
                                      {cert.serialNumber && (
                                        <p className="text-xs text-gray-500">
                                          Serial:{" "}
                                          <span className="font-mono">
                                            {cert.serialNumber}
                                          </span>
                                        </p>
                                      )}
                                      {cert.sourceUrl && (
                                        <p className="text-xs">
                                          <a
                                            href={cert.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                          >
                                            Verify online
                                          </a>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {isEditing && (
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-center py-8">
                              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">
                                No certifications added yet
                              </p>
                              {isEditing && (
                                <Button size="sm" className="mt-2">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Certification
                                </Button>
                              )}
                            </div>
                          )}
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
                          <span className="text-sm text-gray-600">
                            Total Projects
                          </span>
                          <span className="font-semibold">
                            {performanceLoading ? (
                              <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                            ) : (
                              performance.totalProjects
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Completion Rate
                          </span>
                          <span className="font-semibold">
                            {performanceLoading ? (
                              <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                            ) : (
                              `${performance.completionRate}%`
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            On-time Delivery
                          </span>
                          <span className="font-semibold">
                            {performanceLoading ? (
                              <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                            ) : (
                              `${performance.onTimeDelivery}%`
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Response Rate
                          </span>
                          <span className="font-semibold">
                            {performanceLoading ? (
                              <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                            ) : (
                              performance.responseRate
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Repeat Clients
                          </span>
                          <span className="font-semibold">
                            {performanceLoading ? (
                              <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                            ) : (
                              `${performance.repeatClients}%`
                            )}
                          </span>
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
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={userProfile.email}
                                onChange={(e) =>
                                  setUserProfile({
                                    ...userProfile,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={userProfile.phone}
                                onChange={(e) =>
                                  setUserProfile({
                                    ...userProfile,
                                    phone: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                id="website"
                                value={
                                  userProfile.providerProfile?.website || ""
                                }
                                onChange={(e) =>
                                  setUserProfile({
                                    ...userProfile,
                                    providerProfile: {
                                      ...userProfile.providerProfile,
                                      website: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{userProfile.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium">{userProfile.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Website</p>
                              <a
                                href={
                                  userProfile.providerProfile?.website || "#"
                                }
                                className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {userProfile.providerProfile?.website ||
                                  "No website"}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Languages */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.providerProfile?.languages?.map(
                            (language, index) => (
                              <Badge key={index} variant="secondary">
                                {language}
                              </Badge>
                            )
                          ) || (
                            <p className="text-gray-500 text-sm">
                              No languages specified
                            </p>
                          )}
                          {isEditing && (
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Language
                            </Button>
                          )}
                        </div>
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
                      <p className="text-gray-600">
                        Showcase your best work and projects
                      </p>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((project) => (
                      <Card
                        key={project.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/90"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies.map((tech, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
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
                      <p className="text-gray-600">
                        Showcase your technical skills and proficiency levels
                      </p>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {skills.map((skill, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{skill.name}</h3>
                              <p className="text-sm text-gray-500">
                                {skill.category}
                              </p>
                            </div>
                            <span className="font-semibold text-blue-600">
                              {skill.level}%
                            </span>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Client Reviews</h2>
                      <p className="text-gray-600">
                        What clients say about working with you
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold">
                          {stats.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {stats.reviewCount} reviews
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={review.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {review.client.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold">
                                    {review.client}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {review.company}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">
                                {review.comment}
                              </p>
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
                    <p className="text-gray-600">
                      Manage your profile visibility and preferences
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Visibility</CardTitle>
                      <CardDescription>
                        Control who can see your profile and contact you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="visibility">Profile Visibility</Label>
                        <Select defaultValue="public">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              Public - Visible to all users
                            </SelectItem>
                            <SelectItem value="verified">
                              Verified Clients Only
                            </SelectItem>
                            <SelectItem value="private">
                              Private - Hidden from search
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="contact-preference">
                          Contact Preference
                        </Label>
                        <Select defaultValue="platform">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="platform">
                              Through Platform Only
                            </SelectItem>
                            <SelectItem value="direct">
                              Allow Direct Contact
                            </SelectItem>
                            <SelectItem value="verified">
                              Verified Clients Only
                            </SelectItem>
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
                            <SelectItem value="available">
                              Available for new projects
                            </SelectItem>
                            <SelectItem value="busy">
                              Busy - Limited availability
                            </SelectItem>
                            <SelectItem value="unavailable">
                              Unavailable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="response-time">
                          Expected Response Time
                        </Label>
                        <Select defaultValue="2-hours">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-hour">
                              Within 1 hour
                            </SelectItem>
                            <SelectItem value="2-hours">
                              Within 2 hours
                            </SelectItem>
                            <SelectItem value="4-hours">
                              Within 4 hours
                            </SelectItem>
                            <SelectItem value="24-hours">
                              Within 24 hours
                            </SelectItem>
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
          </>
        )}
      </div>
    </ProviderLayout>
  );
}
