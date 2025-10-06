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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  industry: string;
  companySize: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  bio: string;
  website: string;
  linkedin: string;
};

export type Stats = {
  projectsPosted: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  averageRating: number;
  responseTime: string;
  memberSince: string;
  successRate: number;
};

export type DocumentType = { value: string; label: string };
