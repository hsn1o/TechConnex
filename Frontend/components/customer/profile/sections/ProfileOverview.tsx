"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ProfileData } from "../types";

type Props = {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
  isEditing: boolean;
};

export default function ProfileOverview({ value, onChange, isEditing }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
        <CardDescription>Your public profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar & Basic */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="text-lg">
                {value.firstName?.[0]}{value.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={value.firstName}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ ...value, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={value.lastName}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ ...value, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={value.bio}
                disabled={!isEditing}
                onChange={(e) => onChange({ ...value, bio: e.target.value })}
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
                  className="pl-10"
                  value={value.email}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ ...value, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={value.phone}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ ...value, phone: e.target.value })}
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
                  className="pl-10"
                  value={value.address}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ ...value, address: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={value.city}
                disabled={!isEditing}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select
                value={value.state}
                onValueChange={(v) => onChange({ ...value, state: v })}
                disabled={!isEditing}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Kuala Lumpur","Selangor","Penang","Johor","Perak","Kedah","Kelantan","Terengganu","Pahang","Negeri Sembilan","Melaka","Perlis","Sabah","Sarawak"].map(s=>(
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={value.postalCode}
                disabled={!isEditing}
                onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
