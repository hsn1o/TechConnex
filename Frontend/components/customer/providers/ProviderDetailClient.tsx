"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Star,
  CheckCircle2,
  MessageSquare,
  Heart,
  ArrowLeft,
  Award,
  Loader2,
  Globe,
} from "lucide-react";
import type { Provider, PortfolioItem, Review } from "./types";
import PortfolioGrid from "./sections/PortfolioGrid";
import ReviewsList from "./sections/ReviewsList";
import { useRouter } from "next/navigation";
import { getProviderCompletedProjects } from "@/lib/api";

export default function ProviderDetailClient({
  provider,
  portfolio,
  reviews,
}: {
  provider: Provider;
  portfolio: PortfolioItem[];
  reviews: Review[];
}) {
  const [saved, setSaved] = useState<boolean>(!!provider.saved);
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const router = useRouter();

  // Update saved state when provider prop changes (e.g., after refresh)
  useEffect(() => {
    setSaved(!!provider.saved);
  }, [provider.saved]);

  // Load completed projects
  useEffect(() => {
    const loadCompletedProjects = async () => {
      try {
        setLoadingPortfolio(true);
        const response = await getProviderCompletedProjects(provider.id);
        if (response.success && response.data) {
          setPortfolioProjects(response.data);
        }
      } catch (error) {
        console.error("Failed to load completed projects:", error);
      } finally {
        setLoadingPortfolio(false);
      }
    };

    loadCompletedProjects();
  }, [provider.id]);

  const handleContact = (provider: any) => {
    const avatarUrl = provider.avatar && 
      provider.avatar !== "/placeholder.svg" &&
      !provider.avatar.includes("/placeholder.svg")
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${provider.avatar.startsWith("/") ? "" : "/"}${provider.avatar}`
        : "";
    router.push(
      `/customer/messages?userId=${provider.id}&name=${encodeURIComponent(
        provider.name
      )}&avatar=${encodeURIComponent(avatarUrl)}`
    );
  };
  const getUserAndToken = () => {
    if (typeof window === "undefined") return { userId: "", token: "" };
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token") || "";
      return { userId: user?.id || "", token };
    } catch {
      return { userId: "", token: "" };
    }
  };

  const handleSaveToggle = async () => {
    try {
      const { userId, token } = getUserAndToken();
      if (!userId || !token) {
        alert("Please login to save providers");
        return;
      }

      const method = saved ? "DELETE" : "POST";
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
        }/providers/${provider.id}/save?userId=${encodeURIComponent(userId)}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ token added here
          },
        }
      );

      if (response.ok) {
        setSaved(!saved);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update saved status");
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
      alert("Failed to update saved status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={saved ? "default" : "outline"}
            onClick={handleSaveToggle}
            className={saved ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
          </Button>

          <Button
            onClick={(e) => {
              e.preventDefault(); // prevents Link from triggering navigation
              handleContact(provider);
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </div>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={
                  provider.avatar && 
                  provider.avatar !== "/placeholder.svg" &&
                  !provider.avatar.includes("/placeholder.svg")
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${provider.avatar.startsWith("/") ? "" : "/"}${provider.avatar}`
                    : "/placeholder.svg"
                } 
              />
              <AvatarFallback>{provider.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                {provider.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                )}
                {provider.topRated && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Top Rated
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">
                {provider.title} • {provider.company}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <b>{provider.rating}</b> ({provider.reviewCount})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {provider.location}
                </span>
                <span>RM{provider.hourlyRate}/hr</span>
                <span>{provider.completedJobs} completed jobs</span>
                {provider.yearsExperience && provider.yearsExperience > 0 && (
                  <span>{provider.yearsExperience} years experience</span>
                )}
                <span className="flex items-center gap-2">
                  {provider.languages?.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs">
                      {l}
                    </Badge>
                  ))}
                </span>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-gray-800">{provider.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {provider.skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio & Reviews */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Recent work and case studies</CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioGrid items={portfolio} />
            </CardContent>
          </Card>

          {/* Completed Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
              <CardDescription>Showcase of completed work</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPortfolio ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading projects...</span>
                </div>
              ) : portfolioProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed projects yet</h3>
                  <p className="text-gray-600">
                    Completed projects will appear here automatically once the provider finishes working on them.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
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
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="font-medium">{project.client}</span>
                          {project.completedDate && (
                            <span>{new Date(project.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>What clients say</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewsList reviews={reviews} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hire {provider.name.split(" ")[0]}</CardTitle>
              <CardDescription>
                Start a project or send a message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/customer/requests/new?providerId=${encodeURIComponent(
                  provider.id
                )}`}
              >
                <Button className="w-full">Request a Proposal</Button>
              </Link>
              <Link
                href={`/customer/messages/new?to=${encodeURIComponent(
                  provider.id
                )}`}
              >
                <Button variant="outline" className="w-full">
                  Send Message
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
              <CardDescription>Best-fit project types</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {provider.specialties.map((sp) => (
                <Badge key={sp} variant="secondary" className="text-xs">
                  {sp}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Work preferences and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {provider.workPreference && (
                <div>
                  <p className="text-gray-500">Work Preference</p>
                  <p className="font-medium capitalize">{provider.workPreference}</p>
                </div>
              )}
              {provider.teamSize && provider.teamSize > 1 && (
                <div>
                  <p className="text-gray-500">Team Size</p>
                  <p className="font-medium">{provider.teamSize} members</p>
                </div>
              )}
              {(provider.minimumProjectBudget || provider.maximumProjectBudget) && (
                <div>
                  <p className="text-gray-500">Project Budget Range</p>
                  <p className="font-medium">
                    {provider.minimumProjectBudget && provider.maximumProjectBudget
                      ? `RM ${provider.minimumProjectBudget.toLocaleString()} - RM ${provider.maximumProjectBudget.toLocaleString()}`
                      : provider.minimumProjectBudget
                      ? `From RM ${provider.minimumProjectBudget.toLocaleString()}`
                      : provider.maximumProjectBudget
                      ? `Up to RM ${provider.maximumProjectBudget.toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              )}
              {provider.preferredProjectDuration && (
                <div>
                  <p className="text-gray-500">Preferred Project Duration</p>
                  <p className="font-medium">{provider.preferredProjectDuration}</p>
                </div>
              )}
              {provider.website && (
                <div>
                  <p className="text-gray-500">Website</p>
                  <a
                    href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {provider.website}
                  </a>
                </div>
              )}
              {provider.certificationsCount && provider.certificationsCount > 0 && (
                <div>
                  <p className="text-gray-500">Certifications</p>
                  <p className="font-medium">{provider.certificationsCount} certification{provider.certificationsCount !== 1 ? "s" : ""}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications List */}
          {provider.certifications && provider.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>Verified credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {provider.certifications.map((cert) => (
                  <div key={cert.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-500">{cert.issuer}</p>
                        <p className="text-xs text-gray-400">
                          Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      {cert.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
