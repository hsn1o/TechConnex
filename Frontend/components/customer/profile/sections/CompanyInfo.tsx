"use client";

import { Building, Globe, DollarSign, Calendar, Users, Briefcase, Target, Heart, Image as ImageIcon, X, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ProfileData } from "../types";

type Props = {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
  isEditing: boolean;
};

export default function CompanyInfo({ value, onChange, isEditing }: Props) {
  // State for input fields
  const [customCategory, setCustomCategory] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");

  // Helper to handle array inputs
  const handleArrayInput = (field: "preferredContractTypes" | "categoriesHiringFor" | "values" | "mediaGallery" | "socialLinks", newValue: string[]) => {
    onChange({
      ...value,
      customerProfile: {
        ...value.customerProfile || {},
        [field]: newValue,
      },
    });
  };

  const addArrayItem = (field: "preferredContractTypes" | "categoriesHiringFor" | "values" | "mediaGallery" | "socialLinks", item: string) => {
    if (!item.trim()) return;
    const current = value.customerProfile?.[field] || [];
    if (!current.includes(item.trim())) {
      handleArrayInput(field, [...current, item.trim()]);
    }
    // Clear input after adding
    if (field === "categoriesHiringFor") setCustomCategory("");
    if (field === "values") setCustomValue("");
    if (field === "socialLinks") setNewSocialUrl("");
    if (field === "mediaGallery") setNewMediaUrl("");
  };

  const removeArrayItem = (field: "preferredContractTypes" | "categoriesHiringFor" | "values" | "mediaGallery" | "socialLinks", index: number) => {
    const current = value.customerProfile?.[field] || [];
    handleArrayInput(field, current.filter((_, i) => i !== index));
  };

  const toggleArrayItem = (field: "preferredContractTypes" | "categoriesHiringFor" | "values", item: string) => {
    const current = value.customerProfile?.[field] || [];
    if (current.includes(item)) {
      handleArrayInput(field, current.filter((i) => i !== item));
    } else {
      handleArrayInput(field, [...current, item]);
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !value.customerProfile?.categoriesHiringFor?.includes(customCategory.trim())) {
      addArrayItem("categoriesHiringFor", customCategory.trim());
    }
  };

  const handleAddCustomValue = () => {
    if (customValue.trim() && !value.customerProfile?.values?.includes(customValue.trim())) {
      addArrayItem("values", customValue.trim());
    }
  };

  const handleAddSocialUrl = () => {
    if (newSocialUrl.trim() && !value.customerProfile?.socialLinks?.includes(newSocialUrl.trim())) {
      addArrayItem("socialLinks", newSocialUrl.trim());
    }
  };

  const handleAddMediaUrl = () => {
    if (newMediaUrl.trim() && !value.customerProfile?.mediaGallery?.includes(newMediaUrl.trim())) {
      addArrayItem("mediaGallery", newMediaUrl.trim());
    }
  };

  // Popular categories and values (same as registration form)
  const popularHiringCategories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "DevOps",
    "Data Science",
    "AI/ML",
    "Cloud Computing",
    "Cybersecurity",
    "Blockchain",
    "IoT",
    "Software Architecture",
    "Quality Assurance",
    "Project Management",
    "Product Management",
    "Technical Writing",
  ];

  const companyValues = [
    "Innovation",
    "Quality",
    "Customer Focus",
    "Teamwork",
    "Integrity",
    "Transparency",
    "Sustainability",
    "Diversity & Inclusion",
    "Agility",
    "Excellence",
    "Collaboration",
    "Accountability",
    "Growth Mindset",
    "Work-Life Balance",
    "Social Responsibility",
  ];

  const contractTypeOptions = [
    "Fixed Price",
    "Time & Materials",
    "Monthly Retainer",
    "Milestone-based",
    "Hourly",
  ];

  const fundingStageOptions = [
    "Bootstrap",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Private Equity",
    "Public",
    "Other",
  ];

  const remotePolicyOptions = [
    "Fully Remote",
    "Hybrid",
    "On-site",
    "Flexible",
  ];

  const hiringFrequencyOptions = [
    "Occasional",
    "Regular",
    "Project-based",
    "Enterprise",
    "One-time",
  ];

  return (
    <div className="space-y-6">
      {/* Business Profile */}
    <Card>
      <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Core information about your company</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Industry</Label>
            <Select
                value={value.customerProfile?.industry || ""}
              onValueChange={(v) => onChange({ 
                ...value, 
                customerProfile: { 
                    ...value.customerProfile || {}, 
                  industry: v 
                } 
              })}
              disabled={!isEditing}
            >
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
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
                value={value.customerProfile?.companySize || ""}
              onValueChange={(v) => onChange({ 
                ...value, 
                customerProfile: { 
                    ...value.customerProfile || {}, 
                  companySize: v 
                } 
              })}
              disabled={!isEditing}
            >
                <SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="1-10">Startup (1-10 employees)</SelectItem>
                  <SelectItem value="11-50">Small (11-50 employees)</SelectItem>
                  <SelectItem value="51-200">Medium (51-200 employees)</SelectItem>
                  <SelectItem value="201-1000">Large (201-1000 employees)</SelectItem>
                  <SelectItem value="1000+">Enterprise (1000+ employees)</SelectItem>
                  <SelectItem value="150">150 employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
              <Label>Employee Count</Label>
              <Input
                type="number"
                value={value.customerProfile?.employeeCount || ""}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    employeeCount: parseInt(e.target.value) || 0 
                  } 
                })}
                placeholder="150"
              />
            </div>
            <div>
              <Label>Established Year</Label>
              <Input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={value.customerProfile?.establishedYear || ""}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    establishedYear: parseInt(e.target.value) || 0 
                  } 
                })}
                placeholder="2025"
              />
            </div>
            <div>
              <Label>Annual Revenue</Label>
              <Input
                type="text"
                value={value.customerProfile?.annualRevenue || ""}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    annualRevenue: e.target.value 
                  } 
                })}
                placeholder="500000"
              />
              <p className="text-xs text-gray-500 mt-1">Enter revenue in your currency</p>
            </div>
            <div>
              <Label>Funding Stage</Label>
              <Select
                value={value.customerProfile?.fundingStage || ""}
                onValueChange={(v) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    fundingStage: v 
                  } 
                })}
                disabled={!isEditing}
              >
                <SelectTrigger><SelectValue placeholder="Select funding stage" /></SelectTrigger>
                <SelectContent>
                  {fundingStageOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hiring Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Preferences</CardTitle>
          <CardDescription>Your company's hiring and contract preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <Label>Average Budget Range</Label>
            <Input
                type="text"
                value={value.customerProfile?.averageBudgetRange || ""}
              disabled={!isEditing}
              onChange={(e) => onChange({ 
                ...value, 
                customerProfile: { 
                    ...value.customerProfile || {}, 
                    averageBudgetRange: e.target.value 
                  } 
                })}
                placeholder="20000"
              />
              <p className="text-xs text-gray-500 mt-1">Average project budget</p>
            </div>
            <div>
              <Label>Remote Policy</Label>
              <Select
                value={value.customerProfile?.remotePolicy || ""}
                onValueChange={(v) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    remotePolicy: v 
                  } 
                })}
                disabled={!isEditing}
              >
                <SelectTrigger><SelectValue placeholder="Select remote policy" /></SelectTrigger>
                <SelectContent>
                  {remotePolicyOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hiring Frequency</Label>
              <Select
                value={value.customerProfile?.hiringFrequency || ""}
                onValueChange={(v) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    hiringFrequency: v 
                  } 
                })}
                disabled={!isEditing}
              >
                <SelectTrigger><SelectValue placeholder="Select hiring frequency" /></SelectTrigger>
                <SelectContent>
                  {hiringFrequencyOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Preferred Contract Types */}
          <div className="space-y-4">
            <Label>Preferred Contract Types</Label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                {contractTypeOptions.map((type) => (
                  <Badge
                    key={type}
                    variant={
                      value.customerProfile?.preferredContractTypes?.includes(type)
                        ? "default"
                        : "outline"
                    }
                    className={`cursor-pointer ${
                      value.customerProfile?.preferredContractTypes?.includes(type)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-blue-50 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      toggleArrayItem("preferredContractTypes", type)
                    }
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {value.customerProfile?.preferredContractTypes && value.customerProfile.preferredContractTypes.length > 0 ? (
                  value.customerProfile.preferredContractTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">{type}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No contract types specified</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Categories Hiring For */}
          <div className="space-y-4">
            <Label>Categories Hiring For</Label>
            <p className="text-sm text-gray-600">
              Select the types of roles you typically hire for
            </p>
            {isEditing ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type a category and press Add"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCustomCategory())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomCategory}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {value.customerProfile?.categoriesHiringFor && value.customerProfile.categoriesHiringFor.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Selected Categories ({value.customerProfile.categoriesHiringFor.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                      {value.customerProfile.categoriesHiringFor.map((category, index) => (
                        <Badge
                          key={index}
                          className="bg-green-600 hover:bg-green-700 text-white pr-1"
                        >
                          {category}
                          <button
                            type="button"
                            onClick={() => removeArrayItem("categoriesHiringFor", index)}
                            className="ml-1 hover:bg-green-800 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Popular Categories (click to add)
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                    {popularHiringCategories
                      .filter(
                        (category) =>
                          !value.customerProfile?.categoriesHiringFor?.includes(category)
                      )
                      .map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                          onClick={() =>
                            toggleArrayItem("categoriesHiringFor", category)
                          }
                        >
                          {category}
                        </Badge>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {value.customerProfile?.categoriesHiringFor && value.customerProfile.categoriesHiringFor.length > 0 ? (
                  value.customerProfile.categoriesHiringFor.map((cat, index) => (
                    <Badge key={index} variant="secondary">{cat}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No categories specified</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Branding & Culture */}
      <Card>
        <CardHeader>
          <CardTitle>Branding & Culture</CardTitle>
          <CardDescription>Mission, values, and company culture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              rows={4}
              value={value.customerProfile?.mission || ""}
              disabled={!isEditing}
              onChange={(e) => onChange({ 
                ...value, 
                customerProfile: { 
                    ...value.customerProfile || {}, 
                    mission: e.target.value 
                } 
              })}
              placeholder="Describe your company's mission..."
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Company Values</Label>
            <p className="text-sm text-gray-600">
              Select values that represent your company culture
            </p>
            {isEditing ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Type a value and press Add"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCustomValue())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomValue}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {value.customerProfile?.values && value.customerProfile.values.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Selected Values ({value.customerProfile.values.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                      {value.customerProfile.values.map((val, index) => (
                        <Badge
                          key={index}
                          className="bg-purple-600 hover:bg-purple-700 text-white pr-1"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {val}
                          <button
                            type="button"
                            onClick={() => removeArrayItem("values", index)}
                            className="ml-1 hover:bg-purple-800 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Common Values (click to add)
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                    {companyValues
                      .filter((val) => !value.customerProfile?.values?.includes(val))
                      .map((val) => (
                        <Badge
                          key={val}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                          onClick={() => toggleArrayItem("values", val)}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {val}
                        </Badge>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {value.customerProfile?.values && value.customerProfile.values.length > 0 ? (
                  value.customerProfile.values.map((val, index) => (
                    <Badge key={index} variant="secondary">{val}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No values specified</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              rows={4}
              value={typeof value.customerProfile?.benefits === 'string' 
                ? value.customerProfile.benefits 
                : value.customerProfile?.benefits 
                  ? JSON.stringify(value.customerProfile.benefits, null, 2)
                  : ""}
              disabled={!isEditing}
              onChange={(e) => onChange({ 
                ...value, 
                customerProfile: { 
                    ...value.customerProfile || {}, 
                    benefits: e.target.value 
                } 
              })}
              placeholder="Describe employee benefits or company benefits..."
            />
            <p className="text-xs text-gray-500 mt-1">Can be plain text or JSON format</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Media Gallery</Label>
            <p className="text-sm text-gray-600">
              Add URLs to images, videos, or other media showcasing your company
            </p>
            {isEditing ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com/image1.jpg"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddMediaUrl())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddMediaUrl}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {value.customerProfile?.mediaGallery && value.customerProfile.mediaGallery.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Media URLs ({value.customerProfile.mediaGallery.length})
                    </Label>
                    <div className="space-y-2">
                      {value.customerProfile.mediaGallery.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm truncate flex-1"
                          >
                            {url}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("mediaGallery", index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!value.customerProfile?.mediaGallery || value.customerProfile.mediaGallery.length === 0) && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No media URLs added yet</p>
                    <p className="text-sm">
                      Add URLs to showcase your company's visual content
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {value.customerProfile?.mediaGallery && value.customerProfile.mediaGallery.length > 0 ? (
                  value.customerProfile.mediaGallery.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      {url}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No media URLs added</span>
                )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

