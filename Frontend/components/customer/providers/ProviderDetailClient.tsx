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
} from "lucide-react";
import type { Provider, PortfolioItem, Review } from "./types";
import PortfolioGrid from "./sections/PortfolioGrid";
import ReviewsList from "./sections/ReviewsList";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Update saved state when provider prop changes (e.g., after refresh)
  useEffect(() => {
    setSaved(!!provider.saved);
  }, [provider.saved]);

  const handleContact = (provider: any) => {
    router.push(
      `/customer/messages?userId=${provider.id}&name=${encodeURIComponent(
        provider.name
      )}&avatar=${encodeURIComponent(provider.avatar || "")}`
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
        <Link href="/customer/providers">
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
              <AvatarImage src={provider.avatar || "/placeholder.svg"} />
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
                <span>Responds in {provider.responseTime}</span>
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
        </div>
      </div>
    </div>
  );
}
