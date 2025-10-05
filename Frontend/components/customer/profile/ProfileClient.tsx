"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ProfileOverview from "./sections/ProfileOverview";
import ProfileStats from "./sections/ProfileStats";
import CompanyInfo from "./sections/CompanyInfo";
import VerificationSection from "./sections/VerificationSection";
import ProfileStatsCard from "./sections/ProfileStatsCard";

import type {
  UploadedDocument,
  ProfileData,
  Stats,
  DocumentType,
} from "./types";

type Props = {
  profileData: ProfileData;
  uploadedDocuments: UploadedDocument[];
  documentTypes: DocumentType[];
  stats: Stats;
};

export default function ProfileClient({
  profileData,
  uploadedDocuments,
  documentTypes,
  stats,
}: Props) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(profileData);
  const [docs, setDocs] = useState<UploadedDocument[]>(uploadedDocuments);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileOverview
            value={profile}
            onChange={setProfile}
            isEditing={isEditing}
          />
          <ProfileStatsCard stats={stats} /> {/* ✅ no collision */}
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <CompanyInfo
            value={profile}
            onChange={setProfile}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <VerificationSection
            documents={docs}
            setDocuments={setDocs}
            documentTypes={documentTypes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
