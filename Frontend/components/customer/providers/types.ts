export type Provider = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  title?: string;
  company?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate: number;
  location: string;
  bio?: string;
  availability: string;
  responseTime: string;
  skills: string[];
  specialties: string[];
  languages?: string[];
  verified?: boolean;
  topRated?: boolean;
  saved?: boolean;
  // Additional public-safe fields
  yearsExperience?: number;
  minimumProjectBudget?: number | null;
  maximumProjectBudget?: number | null;
  preferredProjectDuration?: string | null;
  workPreference?: string;
  teamSize?: number;
  website?: string | null;
  profileVideoUrl?: string | null;
  certificationsCount?: number;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issuedDate: string;
    verified: boolean;
  }>;
};

export type Option = { value: string; label: string };


// add these to your existing types.ts
export type PortfolioItem = {
  id: string;
  title: string;
  cover: string;
  url?: string;
  tags?: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string; // ISO
  text: string;
};

