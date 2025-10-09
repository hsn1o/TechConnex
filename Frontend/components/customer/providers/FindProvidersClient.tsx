"use client";

import { useEffect, useMemo, useState } from "react";
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
  categories,
  locations,
  ratings,
}: {
  categories: Option[];
  locations: Option[];
  ratings: Option[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(categories[0]?.value ?? "all");
  const [locationFilter, setLocationFilter] = useState(locations[0]?.value ?? "all");
  const [ratingFilter, setRatingFilter] = useState(ratings[0]?.value ?? "all");
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

    // Build query parameters
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (searchQuery) params.append('search', searchQuery);
    if (categoryFilter !== 'all') params.append('category', categoryFilter);
    if (locationFilter !== 'all') params.append('location', locationFilter);
    if (ratingFilter !== 'all') params.append('rating', ratingFilter);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/providers?${params.toString()}`)
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
  }, [searchQuery, categoryFilter, locationFilter, ratingFilter]);

  // No need for client-side filtering since backend handles it
  const filteredProviders = providers;

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
          <Link href="/customer/projects/new">
            <Button>
              <Briefcase className="w-4 h-4 mr-2" />
              Post Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, skills..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger><SelectValue placeholder="All Ratings" /></SelectTrigger>
              <SelectContent>
                {ratings.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
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
