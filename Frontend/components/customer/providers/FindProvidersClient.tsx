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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find ICT Professionals</h1>
          <p className="text-gray-600">Discover and hire top-rated ICT experts for your projects</p>
        </div>
        <div className="flex gap-3">
          <Link href="/customer/providers/saved">
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Saved Providers
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters (Search + Rating + Verified) */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, skills..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger><SelectValue placeholder="All Ratings" /></SelectTrigger>
              <SelectContent>
                {ratings.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger><SelectValue placeholder="Verification Status" /></SelectTrigger>
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
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{filteredProviders.length} providers found</p>
        <Select defaultValue="rating">
          <SelectTrigger className="w-48"><SelectValue placeholder="Sort by" /></SelectTrigger>
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
        <p>Loading providers...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}