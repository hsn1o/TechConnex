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
  Building2,
  Globe,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { Company, Review } from "./types";
import { useRouter } from "next/navigation";

export default function CompanyDetailClient({
  company,
  reviews,
}: {
  company: Company;
  reviews: Review[];
}) {
  const [saved, setSaved] = useState<boolean>(!!company.saved);
  const router = useRouter();

  // Update saved state when company prop changes (e.g., after refresh)
  useEffect(() => {
    setSaved(!!company.saved);
  }, [company.saved]);

  const handleContact = () => {
    const avatarUrl = company.avatar && 
      company.avatar !== "/placeholder.svg" &&
      !company.avatar.includes("/placeholder.svg")
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${company.avatar.startsWith("/") ? "" : "/"}${company.avatar}`
        : "";
    router.push(
      `/provider/messages?userId=${company.id}&name=${encodeURIComponent(
        company.name
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
        alert("Please login to save companies");
        return;
      }

      const method = saved ? "DELETE" : "POST";
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
        }/companies/${company.id}/save?userId=${encodeURIComponent(userId)}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        <Link href="/provider/companies">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to results
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant={saved ? "default" : "outline"}
            onClick={handleSaveToggle}
            className={saved ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
          </Button>

          <Button onClick={handleContact}>
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
                  company.avatar && 
                  company.avatar !== "/placeholder.svg" &&
                  company.avatar !== "/placeholder.svg?height=40&width=40" &&
                  !company.avatar.includes("/placeholder.svg")
                    ? (company.avatar.startsWith("http") 
                        ? company.avatar 
                        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${company.avatar.startsWith("/") ? "" : "/"}${company.avatar}`)
                    : "/placeholder.svg"
                } 
              />
              <AvatarFallback>
                <Building2 className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">
                {company.industry} • {company.companySize}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <b>{company.rating}</b> ({company.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  RM{company.totalSpend.toLocaleString()} total spent
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {company.projectsPosted} projects posted
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {company.memberSince}
                </span>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-gray-800">{company.description}</p>
          {company.website && (
            <div className="mt-4">
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Globe className="w-4 h-4" />
                {company.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Details & Reviews */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.mission && (
                <div>
                  <h4 className="font-semibold mb-2">Mission</h4>
                  <p className="text-gray-700">{company.mission}</p>
                </div>
              )}
              {company.values && company.values.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.values.map((value) => (
                      <Badge key={value} variant="secondary">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {company.categoriesHiringFor && company.categoriesHiringFor.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Categories Hiring For</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.categoriesHiringFor.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {company.employeeCount && (
                <div>
                  <h4 className="font-semibold mb-2">Employee Count</h4>
                  <p className="text-gray-700">{company.employeeCount} employees</p>
                </div>
              )}
              {company.establishedYear && (
                <div>
                  <h4 className="font-semibold mb-2">Established</h4>
                  <p className="text-gray-700">{company.establishedYear}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Reviews given by this company</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{review.author}</p>
                          {review.provider && (
                            <p className="text-sm text-gray-500">
                              {review.provider.location} • Rating: {review.provider.rating}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                      <p className="text-xs text-gray-500 mt-2">{review.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Projects Posted</span>
                <span className="font-semibold">{company.projectsPosted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold text-green-600">
                  RM{company.totalSpend.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-semibold">
                  {company.rating} ({company.reviewCount} reviews)
                </span>
              </div>
            </CardContent>
          </Card>

          {company.preferredContractTypes && company.preferredContractTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preferred Contract Types</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {company.preferredContractTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {company.languages && company.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {company.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

