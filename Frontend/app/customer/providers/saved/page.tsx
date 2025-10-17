"use client";

import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/customer-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, MapPin, Star, Trash2 } from "lucide-react";

type SavedProvider = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  location: string;
  bio?: string;
  hourlyRate: number;
  availability: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  skills: string[];
  verified?: boolean;
  topRated?: boolean;
  savedAt?: string;
};

export default function SavedProvidersPage() {
  const [providers, setProviders] = useState<SavedProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    const userJson =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    try {
      return userJson ? JSON.parse(userJson)?.id || "" : "";
    } catch {
      return "";
    }
  };
  const token = localStorage.getItem("token") || "";

  const fetchSaved = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setProviders([]);
        setLoading(false);
        return;
      }
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/providers/users/${encodeURIComponent(userId)}/saved-providers`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ token added here
          },
        }
      );
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (e) {
      console.error("Failed to fetch saved providers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const unsave = async (providerId: string) => {
    try {
      const userId = getUserId();
      if (!userId) return;
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
        }/providers/${providerId}/save?userId=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ token added here
          },
        }
      );
      if (!res.ok) throw new Error("Failed to unsave");
      setProviders((prev) => prev.filter((p) => p.id !== providerId));
    } catch (e) {
      console.error(e);
      alert("Failed to remove saved provider");
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Saved Providers
            </h1>
            <p className="text-gray-600">Providers you have bookmarked</p>
          </div>
        </div>

        {loading ? (
          <p>Loading saved providers...</p>
        ) : providers.length === 0 ? (
          <p className="text-gray-600">You have no saved providers yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={provider.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
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
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" /> {provider.location}
                      </div>
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
                    <div className="text-sm text-gray-500">
                      RM{provider.hourlyRate}/hr
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {provider.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {provider.skills.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/customer/providers/${provider.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" /> View Profile
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => unsave(provider.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
