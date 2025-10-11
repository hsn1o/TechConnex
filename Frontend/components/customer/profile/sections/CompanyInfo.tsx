"use client";

import { Building, Globe, Linkedin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileData } from "../types";

type Props = {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
  isEditing: boolean;
};

export default function CompanyInfo({ value, onChange, isEditing }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Details about your organization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Industry</Label>
            <Select
              value={value.customerProfile.industry}
              onValueChange={(v) => onChange({ 
                ...value, 
                customerProfile: { 
                  ...value.customerProfile, 
                  industry: v 
                } 
              })}
              disabled={!isEditing}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Technology","Finance","Healthcare","Education","Manufacturing","Retail","Government","Consulting","Real Estate","Other"].map(i=>(
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Company Size</Label>
            <Select
              value={value.customerProfile.companySize}
              onValueChange={(v) => onChange({ 
                ...value, 
                customerProfile: { 
                  ...value.customerProfile, 
                  companySize: v 
                } 
              })}
              disabled={!isEditing}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10 employees">Startup (1-10 employees)</SelectItem>
                <SelectItem value="11-50 employees">Small (11-50 employees)</SelectItem>
                <SelectItem value="51-200 employees">Medium (51-200 employees)</SelectItem>
                <SelectItem value="201-1000 employees">Large (201-1000 employees)</SelectItem>
                <SelectItem value="1000+ employees">Enterprise (1000+ employees)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="website"
                className="pl-10"
                value={value.customerProfile.website}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile, 
                    website: e.target.value 
                  } 
                })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
          <div>
            <Label>Employee Count</Label>
            <Input
              type="number"
              value={value.customerProfile.employeeCount}
              disabled={!isEditing}
              onChange={(e) => onChange({ 
                ...value, 
                customerProfile: { 
                  ...value.customerProfile, 
                  employeeCount: parseInt(e.target.value) || 0 
                } 
              })}
            />
          </div>
          <div>
            <Label>Established Year</Label>
            <Input
              type="number"
              value={value.customerProfile.establishedYear}
              disabled={!isEditing}
              onChange={(e) => onChange({ 
                ...value, 
                customerProfile: { 
                  ...value.customerProfile, 
                  establishedYear: parseInt(e.target.value) || 0 
                } 
              })}
            />
          </div>
          <div>
            <Label>Annual Revenue</Label>
            <Input
              value={value.customerProfile.annualRevenue}
              disabled={!isEditing}
              onChange={(e) => onChange({ 
                ...value, 
                customerProfile: { 
                  ...value.customerProfile, 
                  annualRevenue: e.target.value 
                } 
              })}
              placeholder="5000000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

