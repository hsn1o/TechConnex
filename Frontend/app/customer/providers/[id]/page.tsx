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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  CheckCircle,
  Clock,
  Award,
  Globe,
  GraduationCap,
  Shield,
} from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { useParams } from "next/navigation";

export default function ProviderProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProvider() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/${id}`);
        if (!res.ok) throw new Error("Failed to fetch provider");
        const data = await res.json();
        setProvider(data);
      } catch (err) {
        setProvider(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProvider();
  }, [id]);

  if (loading)
    return <div className="p-8 text-center">Loading provider...</div>;
  if (!provider)
    return (
      <div className="p-8 text-center text-red-500">Provider not found.</div>
    );

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-100 text-green-800";
      case "Advanced":
        return "bg-blue-100 text-blue-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>

        {/* Profile Header */}
        <div className="relative -mt-24 px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={provider.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {provider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {provider.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {provider.name}
                    </h1>
                    {provider.isTopRated && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        Top Rated
                      </Badge>
                    )}
                    {provider.isVerified && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mb-2">{provider.title}</p>
                  <p className="text-gray-500 mb-3">{provider.company}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{provider.rating}</span>
                      <span>({provider.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Responds in {provider.responseTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since {new Date(provider.joinedDate).getFullYear()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsSaved(!isSaved)}
                    className={isSaved ? "text-red-600 border-red-600" : ""}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isSaved ? "fill-current" : ""
                      }`}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {provider.completedJobs}
              </div>
              <div className="text-sm text-gray-500">Jobs Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                RM{provider.hourlyRate}
              </div>
              <div className="text-sm text-gray-500">Per Hour</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {provider.successRate}%
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {provider.onTimeDelivery}%
              </div>
              <div className="text-sm text-gray-500">On-Time Delivery</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {provider.bio}
                    </p>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {provider.skills?.map((skill: any) => (
                        <div
                          key={skill.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{skill.name}</span>
                            <Badge
                              className={getSkillLevelColor(skill.level)}
                              variant="secondary"
                            >
                              {skill.level}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {skill.years} years
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Portfolio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Work</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {provider.portfolio?.slice(0, 2).map((project: any) => (
                        <div
                          key={project.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          <img
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold mb-1">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {project.technologies
                                ?.slice(0, 2)
                                .map((tech: any) => (
                                  <Badge
                                    key={tech}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              {project.technologies?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Availability</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">
                          {provider.availability}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Response Time</span>
                      <span className="text-sm font-medium">
                        {provider.responseTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last Active</span>
                      <span className="text-sm font-medium">
                        {new Date(provider.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Repeat Clients</span>
                      <span className="text-sm font-medium">
                        {provider.repeatClients}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {provider.languages?.map((language: any) => (
                        <div key={language} className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{language}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Specialties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties?.map((specialty: any) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio ({provider.portfolio?.length})</CardTitle>
                <CardDescription>
                  Showcase of completed projects and work samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {provider.portfolio?.map((project: any) => (
                    <div
                      key={project.id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {project.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(project.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies?.map((tech: any) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews ({provider.reviewCount})</CardTitle>
                <CardDescription>
                  Feedback from previous clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {provider.reviews?.map((review: any) => (
                    <div
                      key={review.id}
                      className="border-b pb-6 last:border-b-0"
                    >
                      <div className="flex items-start gap-4">
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
                              <h4 className="font-semibold">{review.client}</h4>
                              <p className="text-sm text-gray-500">
                                {review.project}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
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
                              <p className="text-xs text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{review.comment}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <button className="hover:text-gray-700">
                              👍 Helpful ({review.helpful})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provider.servicePackages?.map((pkg: any) => (
                <Card
                  key={pkg.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        RM{pkg.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.deliveryTime} {pkg.deliveryUnit} delivery
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {pkg.features?.map((feature: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full">Order Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.education?.map((edu: any, index: any) => (
                    <div key={index} className="flex gap-3">
                      <GraduationCap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-sm text-gray-600">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {edu.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.certifications?.map((cert: any, index: any) => (
                    <div key={index} className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}
