"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, Building2, Search } from "lucide-react";
import CompanyCard from "./sections/CompanyCard";
import type { Company, Option } from "./types";

/** Props come from the server page */
export default function FindCompaniesClient({
  industries,
  locations,
  companySizes,
  ratings,
}: {
  industries: Option[];
  locations: Option[];
  companySizes: Option[];
  ratings: Option[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState(industries[0]?.value ?? "all");
  const [locationFilter, setLocationFilter] = useState(locations[0]?.value ?? "all");
  const [companySizeFilter, setCompanySizeFilter] = useState(companySizes[0]?.value ?? "all");
  const [ratingFilter, setRatingFilter] = useState(ratings[0]?.value ?? "all");
  const [companies, setCompanies] = useState<Company[]>([]);
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
    if (industryFilter !== "all") params.append("industry", industryFilter);
    if (locationFilter !== "all") params.append("location", locationFilter);
    if (companySizeFilter !== "all") params.append("companySize", companySizeFilter);
    if (ratingFilter !== "all") params.append("rating", ratingFilter);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/companies?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Transform avatar URLs
          const transformedCompanies = (data.companies || []).map((company: Company) => ({
            ...company,
            avatar: company.avatar && company.avatar !== "/placeholder.svg"
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${company.avatar.startsWith("/") ? "" : "/"}${company.avatar}`
              : "/placeholder.svg?height=40&width=40",
          }));
          setCompanies(transformedCompanies);
        } else {
          console.error("API error:", data.message);
          setCompanies([]);
        }
      })
      .catch((err) => console.error("Failed to fetch companies:", err))
      .finally(() => setLoading(false));
  }, [searchQuery, industryFilter, locationFilter, companySizeFilter, ratingFilter]);

  const filteredCompanies = companies; // backend handles filtering

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Companies</h1>
          <p className="text-gray-600">Discover companies looking for ICT professionals</p>
        </div>
        <div className="flex gap-3">
          <Link href="/provider/companies/saved">
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Saved Companies
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, industry..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger><SelectValue placeholder="All Industries" /></SelectTrigger>
              <SelectContent>
                {industries.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
              <SelectTrigger><SelectValue placeholder="All Sizes" /></SelectTrigger>
              <SelectContent>
                {companySizes.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        </CardContent>
      </Card>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{filteredCompanies.length} companies found</p>
        <Select defaultValue="rating">
          <SelectTrigger className="w-48"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="projects">Most Projects</SelectItem>
            <SelectItem value="spend">Highest Spender</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      )}
    </div>
  );
}

