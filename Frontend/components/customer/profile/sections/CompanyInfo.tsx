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
          <Field
            icon={<Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
            id="company"
            label="Company Name"
            value={value.company}
            disabled={!isEditing}
            onChange={(v) => onChange({ ...value, company: v })}
          />
          <Field
            id="position"
            label="Your Position"
            value={value.position}
            disabled={!isEditing}
            onChange={(v) => onChange({ ...value, position: v })}
          />
          <div>
            <Label>Industry</Label>
            <Select
              value={value.industry}
              onValueChange={(v) => onChange({ ...value, industry: v })}
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
              value={value.companySize}
              onValueChange={(v) => onChange({ ...value, companySize: v })}
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
          <Field
            icon={<Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
            id="website"
            label="Website"
            value={value.website}
            disabled={!isEditing}
            onChange={(v) => onChange({ ...value, website: v })}
            placeholder="https://yourcompany.com"
          />
          <Field
            icon={<Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
            id="linkedin"
            label="LinkedIn Profile"
            value={value.linkedin}
            disabled={!isEditing}
            onChange={(v) => onChange({ ...value, linkedin: v })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  id, label, value, onChange, disabled, placeholder, icon
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  disabled?: boolean; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon}
        <Input id={id} className={icon ? "pl-10" : ""} value={value} disabled={disabled} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
