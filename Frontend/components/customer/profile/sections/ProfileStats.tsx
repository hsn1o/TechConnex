"use client";

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Globe, Linkedin, User } from "lucide-react";
import type { ProfileData } from "../types";

interface Props {
  isEditing: boolean;
  profileData: ProfileData;
  onProfileChange: (patch: Partial<ProfileData>) => void;
}

export default function CompanyTab({ isEditing, profileData, onProfileChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Details about your organization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Company Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => onProfileChange({ company: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="position">Your Position</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="position"
                value={profileData.position}
                onChange={(e) => onProfileChange({ position: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={profileData.industry}
              onValueChange={(value) => onProfileChange({ industry: value })}
              disabled={!isEditing}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Technology","Finance","Healthcare","Education","Manufacturing","Retail","Government","Consulting","Real Estate","Other"]
                  .map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="companySize">Company Size</Label>
            <Select
              value={profileData.companySize}
              onValueChange={(value) => onProfileChange({ companySize: value })}
              disabled={!isEditing}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                <SelectItem value="small">Small (11-50 employees)</SelectItem>
                <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="website"
                type="url"
                value={profileData.website}
                onChange={(e) => onProfileChange({ website: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="linkedin"
                type="url"
                value={profileData.linkedin}
                onChange={(e) => onProfileChange({ linkedin: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
