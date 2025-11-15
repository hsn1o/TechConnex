"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, MessageSquare, Star, Heart } from "lucide-react";
import type { Provider } from "../types";
import { useRouter } from "next/navigation";

export default function ProviderCard({ provider }: { provider: Provider }) {
  const router = useRouter();
  const [saved, setSaved] = useState<boolean>(!!provider.saved);

  // Update saved state when provider prop changes (e.g., after refresh)
  useEffect(() => {
    setSaved(!!provider.saved);
  }, [provider.saved]);

  const handleContact = () => {
    // Navigate to chat with this provider
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={
                  provider.avatar && 
                  provider.avatar !== "/placeholder.svg" &&
                  !provider.avatar.includes("/placeholder.svg")
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${provider.avatar.startsWith("/") ? "" : "/"}${provider.avatar}`
                    : "/placeholder.svg"
                } 
              />
              <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {provider.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {provider.name}
              </h3>
              {provider.topRated && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  Top Rated
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{provider.title}</p>
            <p className="text-xs text-gray-500">{provider.company}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium">{provider.rating}</span>
            <span className="text-sm text-gray-500">
              ({provider.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            {provider.location}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">{provider.bio}</p>

        <div className="flex flex-wrap gap-1">
          {provider.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {provider.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{provider.skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Hourly Rate</p>
            <p className="font-semibold">RM{provider.hourlyRate}/hr</p>
          </div>
          <div>
            <p className="text-gray-500">Completed Jobs</p>
            <p className="font-semibold">{provider.completedJobs}</p>
          </div>
          {provider.yearsExperience && provider.yearsExperience > 0 && (
            <div>
              <p className="text-gray-500">Experience</p>
              <p className="font-semibold">{provider.yearsExperience} years</p>
            </div>
          )}
          {provider.certificationsCount && provider.certificationsCount > 0 && (
            <div>
              <p className="text-gray-500">Certifications</p>
              <p className="font-semibold">{provider.certificationsCount}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                provider.availability === "Available" || provider.availability === "available"
                  ? "bg-green-500"
                  : provider.availability === "busy"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-gray-600 capitalize">{provider.availability}</span>
          </div>
          {provider.workPreference && (
            <span className="text-gray-500 capitalize">{provider.workPreference}</span>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={handleContact}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact
          </Button>
          <Button
            size="sm"
            variant={saved ? "default" : "outline"}
            onClick={handleSaveToggle}
            className={saved ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </Button>
          <Link href={`/customer/providers/${provider.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
