"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  MapPin,
  MessageSquare,
  Heart,
  Eye,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { CustomerLayout } from "@/components/customer-layout";

type Provider = {
  name: string;
  email: string;
  providerProfile: {
    location: string;
    bio: string;
    hourlyRate: number | null;
    availability: string | null;
    rating: string;
    totalReviews: number;
    totalProjects: number;
    responseTime: number;
    skills: string[];
  };
};
export default function CustomerProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch providers:", err);
        setLoading(false);
      });
  }, []);

  const mappedProviders = providers.map((p) => ({
    id: p.id, // Use real unique id from backend
    name: p.name,
    title: "", // You can add logic to extract or default this
    company: "",
    rating: parseFloat(p.providerProfile.rating || "0"),
    reviewCount: p.providerProfile.totalReviews,
    completedJobs: p.providerProfile.totalProjects,
    hourlyRate: p.providerProfile.hourlyRate || 0,
    location: p.providerProfile.location,
    avatar: "/placeholder.svg",
    skills: p.providerProfile.skills,
    specialties: [], // Optional - if your backend includes specialties, map them here
    description: p.providerProfile.bio,
    availability: p.providerProfile.availability || "Unknown",
    responseTime: `${p.providerProfile.responseTime} hours`,
    languages: [],
    verified: true,
    topRated: false,
  }));

  const filteredProviders = mappedProviders.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      provider.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" ||
      provider.specialties.some((specialty) =>
        specialty.toLowerCase().includes(categoryFilter.toLowerCase())
      );

    const matchesLocation =
      locationFilter === "all" ||
      provider.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "4.5+" && provider.rating >= 4.5) ||
      (ratingFilter === "4.0+" && provider.rating >= 4.0);

    return matchesSearch && matchesCategory && matchesLocation && matchesRating;
  });

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Find ICT Professionals
            </h1>
            <p className="text-gray-600">
              Discover and hire top-rated ICT experts for your projects
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Saved Providers
            </Button>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, skills..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="cloud">Cloud Services</SelectItem>
                  <SelectItem value="data">Data Analytics</SelectItem>
                  <SelectItem value="ui">UI/UX Design</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kuala lumpur">Kuala Lumpur</SelectItem>
                  <SelectItem value="selangor">Selangor</SelectItem>
                  <SelectItem value="penang">Penang</SelectItem>
                  <SelectItem value="johor">Johor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredProviders.length} providers found
          </p>
          <Select defaultValue="rating">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <p>Loading providers...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={provider.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {provider.name.charAt(0)}
                        </AvatarFallback>
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
                      <p className="text-sm text-gray-600 mb-1">
                        {provider.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {provider.company}
                      </p>
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

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {provider.description}
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
                    {provider.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{provider.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Hourly Rate</p>
                      <p className="font-semibold">
                        RM{provider.hourlyRate}/hr
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Completed Jobs</p>
                      <p className="font-semibold">{provider.completedJobs}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          provider.availability === "Available"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-gray-600">
                        {provider.availability}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      Responds in {provider.responseTime}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Link href={`/customer/providers/${provider.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
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
