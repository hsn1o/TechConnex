"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, Briefcase, Search } from "lucide-react";
import ProviderCard from "./sections/ProviderCard";
import type { Provider, Option } from "./types";

/** Props come from the server page */
export default function FindProvidersClient({
  ratings,
}: {
  ratings: Option[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(ratings[0]?.value ?? "all");
  const [verifiedFilter, setVerifiedFilter] = useState("all"); // all | verified | unverified
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userId = (() => {
      try {
        return userJson ? JSON.parse(userJson)?.id || "" : "";
      } catch {
        return "";
      }
    })();

    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (searchQuery) params.append("search", searchQuery);
    if (ratingFilter !== "all") params.append("rating", ratingFilter);
    if (verifiedFilter === "verified") params.append("verified", "true");
    if (verifiedFilter === "unverified") params.append("verified", "false");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/providers?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProviders(data.providers || []);
        } else {
          console.error("API error:", data.message);
          setProviders([]);
        }
      })
      .catch((err) => console.error("Failed to fetch providers:", err))
      .finally(() => setLoading(false));
  }, [searchQuery, ratingFilter, verifiedFilter]);

  const filteredProviders = providers; // backend handles filtering

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find ICT Professionals</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Discover and hire top-rated ICT experts for your projects</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href="/customer/providers/saved" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Saved Providers
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters (Search + Rating + Verified) */}
      <Card>
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, skills..."
                className="pl-10 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="text-sm sm:text-base w-full"><SelectValue placeholder="All Ratings" /></SelectTrigger>
              <SelectContent>
                {ratings.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="text-sm sm:text-base w-full"><SelectValue placeholder="Verification Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <p className="text-sm sm:text-base text-gray-600">{filteredProviders.length} providers found</p>
        <Select defaultValue="rating">
          <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-sm sm:text-base text-gray-600 text-center py-8">Loading providers...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {filteredProviders.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}