"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import type { ProfileData, Stats } from "../types";

interface Props {
  isEditing: boolean;
  profileData: ProfileData;
  onProfileChange: (patch: Partial<ProfileData>) => void;
  stats: Stats;
  onChangeAvatar?: () => void;
}

export default function ProfileTab({
  isEditing,
  profileData,
  onProfileChange,
  stats,
  onChangeAvatar,
}: Props) {
  const initials = useMemo(
    () => `${profileData.firstName?.[0] ?? ""}${profileData.lastName?.[0] ?? ""}`,
    [profileData.firstName, profileData.lastName]
  );

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Basic Info */}
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={onChangeAvatar}
                >
                  {/* simple camera glyph using emoji or your own icon */}
                  📷
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => onProfileChange({ firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => onProfileChange({ lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => onProfileChange({ bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => onProfileChange({ email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => onProfileChange({ phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => onProfileChange({ address: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => onProfileChange({ city: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={profileData.state}
                  onValueChange={(value) => onProfileChange({ state: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      "Kuala Lumpur","Selangor","Penang","Johor","Perak","Kedah",
                      "Kelantan","Terengganu","Pahang","Negeri Sembilan","Melaka",
                      "Perlis","Sabah","Sarawak",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={profileData.postalCode}
                  onChange={(e) => onProfileChange({ postalCode: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Statistics</CardTitle>
          <CardDescription>Your activity and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Stat label="Projects Posted" value={stats.projectsPosted} className="text-blue-600" />
            <Stat label="Active Projects" value={stats.activeProjects} className="text-green-600" />
            <Stat label="Completed" value={stats.completedProjects} className="text-purple-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                RM{stats.totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-yellow-600">{stats.averageRating}</span>
              </div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <Stat label="Response Time" value={stats.responseTime} className="text-indigo-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.successRate}%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-gray-600">{stats.memberSince}</div>
              <div className="text-sm text-gray-500">Member Since</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${className ?? ""}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
