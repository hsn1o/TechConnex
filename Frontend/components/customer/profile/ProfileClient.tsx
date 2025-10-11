"use client";

import React, { useEffect, useState } from "react";
import type {
  UploadedDocument,
  ProfileData,
  Stats,
  DocumentType,
} from "./types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  upsertCompanyProfile,
  getCompanyProfile,
  getKycDocuments,
} from "@/lib/api";

import ProfileOverview from "./sections/ProfileOverview";
import CompanyInfo from "./sections/CompanyInfo";
import VerificationSection from "./sections/VerificationSection";
import ProfileStatsCard from "./sections/ProfileStatsCard";

type Props = {
  profileData?: ProfileData;
  uploadedDocuments?: UploadedDocument[];
  documentTypes?: DocumentType[];
  stats?: Stats;
};

export default function ProfileClient(props: Props = {}) {
  const {
    profileData: initialProfileData,
    uploadedDocuments: initialUploadedDocuments,
    documentTypes: initialDocumentTypes,
    stats: initialStats,
  } = props;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(
    initialProfileData ?? null
  );
  const [docs, setDocs] = useState<UploadedDocument[]>(
    initialUploadedDocuments ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statsState, setStatsState] = useState<Stats | null>(
    initialStats ?? null
  );

  const documentTypes: DocumentType[] = initialDocumentTypes ?? [
    {
      value: "business_registration",
      label: "Business Registration Certificate (SSM)",
    },
    { value: "tax_document", label: "Tax Identification Number" },
    { value: "bank_statement", label: "Bank Account Statement" },
    { value: "company_profile", label: "Company Profile/Brochure" },
    { value: "director_id", label: "Director's Identification (IC/Passport)" },
    { value: "authorization_letter", label: "Authorization Letter" },
    { value: "financial_statement", label: "Financial Statement" },
    { value: "other", label: "Other Documents" },
  ];

  const defaultProfile: ProfileData = {
    email: "",
    name: "",
    phone: "",
    isVerified: false,
    kycStatus: "",
    createdAt: new Date().toISOString(),
    customerProfile: {
      description: "",
      industry: "",
      location: "",
      website: "",
      logoUrl: "",
      socialLinks: [],
      languages: [],
      companySize: "",
      employeeCount: 0,
      establishedYear: 0,
      annualRevenue: "",
      fundingStage: "",
      preferredContractTypes: [],
      averageBudgetRange: "",
      remotePolicy: "",
      hiringFrequency: "",
      categoriesHiringFor: [],
      completion: 0,
      rating: 0,
      reviewCount: 0,
      totalSpend: "0",
      projectsPosted: 0,
      lastActiveAt: "",
      mission: "",
      values: [],
      benefits: "",
      mediaGallery: [],
    },
    kycDocuments: [],
  };

  const transformToBackendFormat = (frontendProfile: ProfileData | null) => {
    if (!frontendProfile) return {};
    return {
      description: frontendProfile.customerProfile?.description || "",
      industry: frontendProfile.customerProfile?.industry || "",
      location: frontendProfile.customerProfile?.location || "",
      website: frontendProfile.customerProfile?.website || "",
      logoUrl: frontendProfile.customerProfile?.logoUrl || "",
      socialLinks: frontendProfile.customerProfile?.socialLinks || [],
      languages: frontendProfile.customerProfile?.languages || [],
      companySize: frontendProfile.customerProfile?.companySize || "",
      employeeCount: frontendProfile.customerProfile?.employeeCount || 0,
      establishedYear: frontendProfile.customerProfile?.establishedYear || 0,
      annualRevenue: frontendProfile.customerProfile?.annualRevenue || "",
      fundingStage: frontendProfile.customerProfile?.fundingStage || "",
      preferredContractTypes:
        frontendProfile.customerProfile?.preferredContractTypes || [],
      averageBudgetRange:
        frontendProfile.customerProfile?.averageBudgetRange || "",
      remotePolicy: frontendProfile.customerProfile?.remotePolicy || "",
      hiringFrequency: frontendProfile.customerProfile?.hiringFrequency || "",
      categoriesHiringFor:
        frontendProfile.customerProfile?.categoriesHiringFor || [],
      mission: frontendProfile.customerProfile?.mission || "",
      values: frontendProfile.customerProfile?.values || [],
      benefits: frontendProfile.customerProfile?.benefits || "",
      mediaGallery: frontendProfile.customerProfile?.mediaGallery || [],
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const backendData = transformToBackendFormat(profile);
      const response = await upsertCompanyProfile(backendData);

      if (response?.data) {
        setProfile(response.data);
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch profile and kyc documents client-side when not provided via props
  useEffect(() => {
    if (initialProfileData) return; // server provided

    setIsLoading(true);
    (async () => {
      try {
        const profileResp = await getCompanyProfile();
        if (profileResp?.data) setProfile(profileResp.data);

        if (profileResp?.data) {
          const pd = profileResp.data as ProfileData;
          const computed: Stats = {
            projectsPosted: pd.customerProfile?.projectsPosted || 0,
            rating: pd.customerProfile?.rating || 0,
            reviewCount: pd.customerProfile?.reviewCount || 0,
            totalSpend: pd.customerProfile?.totalSpend || "0",
            completion: pd.customerProfile?.completion || 0,
            lastActiveAt: pd.customerProfile?.lastActiveAt || "",
            memberSince: new Date(pd.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            }),
          };
          setStatsState(computed);
        }

        try {
          const kycResp = await getKycDocuments();
          const docsData = (kycResp?.data?.documents ??
            kycResp?.data ??
            []) as unknown[];
          const mapped = docsData.map((d) => {
            const item = d as Record<string, unknown>;
            return {
              id: String(item.id ?? ""),
              name: String(item.filename ?? item.fileUrl ?? item.id ?? ""),
              type: String(item.type ?? "document"),
              size: String(item.size ?? "-"),
              uploadDate: String(item.uploadedAt ?? item.uploadDate ?? ""),
              status: String(item.status ?? "pending") as
                | "pending"
                | "approved"
                | "rejected",
              rejectionReason: item.reviewNotes
                ? String(item.reviewNotes)
                : undefined,
            } as UploadedDocument;
          });
          setDocs(mapped);
        } catch (err) {
          console.warn("Failed to fetch KYC documents", err);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please login and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Recompute stats when profile changes
  useEffect(() => {
    if (!profile) return;
    const pd = profile as ProfileData;
    const computed: Stats = {
      projectsPosted: pd.customerProfile?.projectsPosted || 0,
      rating: pd.customerProfile?.rating || 0,
      reviewCount: pd.customerProfile?.reviewCount || 0,
      totalSpend: pd.customerProfile?.totalSpend || "0",
      completion: pd.customerProfile?.completion || 0,
      lastActiveAt: pd.customerProfile?.lastActiveAt || "",
      memberSince: new Date(pd.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
    };
    setStatsState(computed);
  }, [profile]);

  if (isLoading && !profile) {
    return (
      <div className="py-8">
        <div className="text-center text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8">
        <div className="text-center space-y-4">
          <div className="text-gray-700">
            No profile found for your account.
          </div>
          <div>
            <Button
              onClick={() => {
                setProfile(defaultProfile);
                setIsEditing(true);
              }}
            >
              Create Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
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
            value={profile as ProfileData}
            onChange={setProfile}
            isEditing={isEditing}
          />
          <ProfileStatsCard
            stats={
              statsState ?? {
                projectsPosted: 0,
                rating: 0,
                reviewCount: 0,
                totalSpend: "0",
                completion: 0,
                lastActiveAt: "",
                memberSince: "",
              }
            }
          />
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <CompanyInfo
            value={profile as ProfileData}
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
