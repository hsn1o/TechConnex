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
              <AvatarImage src={value.customerProfile.logoUrl || "/placeholder.svg?height=96&width=96"} />
              <AvatarFallback className="text-lg">
                {value.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CO'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={value.name}
                disabled={!isEditing}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={value.customerProfile.description}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile, 
                    description: e.target.value 
                  } 
                })}
                placeholder="Tell us about your company..."
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
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="location"
                className="pl-10"
                value={value.customerProfile.location}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile, 
                    location: e.target.value 
                  } 
                })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
