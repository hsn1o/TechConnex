export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
};

export type ProfileData = {
  email: string;
  name: string;
  phone: string;
  isVerified: boolean;
  kycStatus: string;
  createdAt: string;
  customerProfile: {
    description: string;
    industry: string;
    location: string;
    website: string;
    logoUrl: string;
    socialLinks: string[];
    languages: string[];
    companySize: string;
    employeeCount: number;
    establishedYear: number;
    annualRevenue: string;
    fundingStage: string;
    preferredContractTypes: string[];
    averageBudgetRange: string;
    remotePolicy: string;
    hiringFrequency: string;
    categoriesHiringFor: string[];
    completion: number;
    rating: number;
    reviewCount: number;
    totalSpend: string;
    projectsPosted: number;
    lastActiveAt: string;
    mission: string;
    values: string[];
    benefits: string;
    mediaGallery: string[];
  };
  kycDocuments: any[];
};

export type Stats = {
  projectsPosted: number;
  rating: number;
  reviewCount: number;
  totalSpend: string;
  completion: number;
  lastActiveAt: string;
  memberSince: string;
};

export type DocumentType = { value: string; label: string };
