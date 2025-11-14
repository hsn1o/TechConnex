"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Camera, Globe, X, Plus, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import type { ProfileData } from "../types";
import { uploadCompanyProfileImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
  isEditing: boolean;
};

export default function ProfileOverview({ value, onChange, isEditing }: Props) {
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Helper to handle array inputs (socialLinks, languages)
  const handleArrayInput = (field: "socialLinks" | "languages", newValue: string[]) => {
    onChange({
      ...value,
      customerProfile: {
        ...value.customerProfile || {},
        [field]: newValue,
      },
    });
  };

  const addArrayItem = (field: "socialLinks" | "languages", item: string) => {
    if (!item.trim()) return;
    const current = value.customerProfile?.[field] || [];
    if (!current.includes(item.trim())) {
      handleArrayInput(field, [...current, item.trim()]);
    }
    // Clear input after adding
    if (field === "socialLinks") setNewSocialUrl("");
    if (field === "languages") setNewLanguage("");
  };

  const removeArrayItem = (field: "socialLinks" | "languages", index: number) => {
    const current = value.customerProfile?.[field] || [];
    handleArrayInput(field, current.filter((_, i) => i !== index));
  };

  const handleAddSocialUrl = () => {
    if (newSocialUrl.trim() && !value.customerProfile?.socialLinks?.includes(newSocialUrl.trim())) {
      addArrayItem("socialLinks", newSocialUrl.trim());
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !value.customerProfile?.languages?.includes(newLanguage.trim())) {
      addArrayItem("languages", newLanguage.trim());
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadCompanyProfileImage(file);
      onChange({
        ...value,
        customerProfile: {
          ...value.customerProfile || {},
          profileImageUrl: result.data.profileImageUrl,
        } as any,
      });
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
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
                <AvatarImage 
                  src={
                    value.customerProfile?.profileImageUrl 
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${value.customerProfile.profileImageUrl.startsWith("/") ? "" : "/"}${value.customerProfile.profileImageUrl}`
                      : value.customerProfile?.logoUrl || "/placeholder.svg?height=96&width=96"
                  } 
                />
                <AvatarFallback className="text-lg">
                  {value.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CO'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={handleImageClick}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={value.name}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Contact support to change company name</p>
              </div>
              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={value.customerProfile?.description || ""}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ 
                    ...value, 
                    customerProfile: { 
                      ...value.customerProfile || {}, 
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
                    className="pl-10 bg-gray-50"
                    value={value.email}
                    disabled={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    className="pl-10 bg-gray-50"
                    value={value.phone || ""}
                    disabled={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change phone</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location & Website */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location & Website</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    className="pl-10"
                    value={value.customerProfile?.location || ""}
                    disabled={!isEditing}
                    onChange={(e) => onChange({ 
                      ...value, 
                      customerProfile: { 
                        ...value.customerProfile || {}, 
                        location: e.target.value 
                      } 
                    })}
                    placeholder="Kuala Lumpur, Malaysia"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="website"
                    type="url"
                    className="pl-10"
                    value={value.customerProfile?.website || ""}
                    disabled={!isEditing}
                    onChange={(e) => onChange({ 
                      ...value, 
                      customerProfile: { 
                        ...value.customerProfile || {}, 
                        website: e.target.value 
                      } 
                    })}
                    placeholder="https://your-company.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can enter with or without https://</p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={value.customerProfile?.logoUrl || ""}
                disabled={!isEditing}
                onChange={(e) => onChange({ 
                  ...value, 
                  customerProfile: { 
                    ...value.customerProfile || {}, 
                    logoUrl: e.target.value 
                  } 
                })}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">URL to your company logo image</p>
            </div>
          </div>

          <Separator />

          {/* Social Links */}
          {isEditing && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>
              <p className="text-sm text-gray-600">
                Add links to LinkedIn, Twitter, or other social media profiles
              </p>
              <div className="flex gap-2">
                <Input
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="https://linkedin.com/yourusername"
                  type="url"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddSocialUrl())
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddSocialUrl}
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {value.customerProfile?.socialLinks && value.customerProfile.socialLinks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Social Links ({value.customerProfile.socialLinks.length})
                  </Label>
                  <div className="space-y-2">
                    {value.customerProfile.socialLinks.map((url, index) => (
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
                          onClick={() => removeArrayItem("socialLinks", index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!value.customerProfile?.socialLinks || value.customerProfile.socialLinks.length === 0) && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No social links added yet</p>
                  <p className="text-sm">
                    Add links to showcase your company's social media presence
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Display social links when not editing */}
          {!isEditing && value.customerProfile?.socialLinks && value.customerProfile.socialLinks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>
              <div className="flex flex-wrap gap-2">
                {value.customerProfile.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Languages */}
          {isEditing && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Languages</h3>
              <p className="text-sm text-gray-600">
                Add languages spoken in your company
              </p>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="English, Bahasa Malaysia, Mandarin..."
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddLanguage())
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddLanguage}
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {value.customerProfile?.languages && value.customerProfile.languages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Languages ({value.customerProfile.languages.length})
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                    {value.customerProfile.languages.map((lang, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("languages", index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display languages when not editing */}
          {!isEditing && value.customerProfile?.languages && value.customerProfile.languages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {value.customerProfile.languages.map((lang, index) => (
                  <Badge key={index} variant="secondary">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
