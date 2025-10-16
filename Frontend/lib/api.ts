// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function uploadKyc(files: File[], type: "PROVIDER_ID" | "COMPANY_REG" | "COMPANY_DIRECTOR_ID") {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const fd = new FormData();
  fd.append("type", type);
  files.forEach((f) => fd.append("documents", f));

  const res = await fetch(`${API_BASE}/kyc/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // don't set Content-Type when sending FormData
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "KYC upload failed");
  return data;
}

export async function getCompanyProfile() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/company/profile`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch company profile");
  return data;
}

export async function updateCompanyProfile(profileData: any) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/company/profile`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update company profile");
  return data;
}

export async function upsertCompanyProfile(profileData: any) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/company/profile`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to save company profile");
  return data;
}

export async function getKycDocuments() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/company/profile/kyc-documents`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch KYC documents");
  return data;
}

// Project API functions
export async function getCompanyProjects(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.category) searchParams.append("category", params.category);

  const url = `${API_BASE}/company/projects${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch projects");
  return data;
}

export async function createProject(projectData: {
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  priority: string;
  skills: string[];
  requirements?: string;
  deliverables?: string;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/projects`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create project");
  return data;
}

export async function getProjectRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.category) searchParams.append("category", params.category);

  const url = `${API_BASE}/company/project-requests${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch project requests");
  return data;
}

export async function acceptProposal(proposalId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests/${proposalId}/accept`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to accept proposal");
  return data;
}

export async function rejectProposal(proposalId: string, reason?: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests/${proposalId}/reject`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to reject proposal");
  return data;
}


// Get single project/service request details
export async function getProjectById(id: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/projects/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch project");
  return data;
}

// Get proposals for a specific service request
export async function getProposalsByServiceRequest(serviceRequestId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests?serviceRequestId=${serviceRequestId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch proposals");
  return data;
}

// Accept proposal with milestone choice
export async function acceptProposalWithMilestones(proposalId: string, useProviderMilestones: boolean = true) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests/${proposalId}/accept`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ useProviderMilestones }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to accept proposal");
  return data;
}

// Provider opportunities API functions
export async function getProviderOpportunities(params?: {
  page?: number;
  limit?: number;
  category?: string;
  skills?: string[];
  search?: string;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.category) searchParams.append("category", params.category);
  if (params?.skills && params.skills.length > 0) {
    params.skills.forEach(skill => searchParams.append("skills", skill));
  }
  if (params?.search) searchParams.append("search", params.search);

  const url = `${API_BASE}/provider/opportunities${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch opportunities");
  return data;
}

export async function sendProposal(proposalData: {
  serviceRequestId: string;
  bidAmount: number;
  deliveryTime: number;
  coverLetter: string;
  milestones?: Array<{
    title: string;
    amount: number;
    dueDate: string;
    order: number;
  }>;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/proposals`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(proposalData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to send proposal");
  return data;
}

// Company project requests API functions
export async function getCompanyProjectRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  proposalStatus?: string;
  serviceRequestId?: string;
  search?: string;
  sort?: string;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.proposalStatus) searchParams.append("proposalStatus", params.proposalStatus);
  if (params?.serviceRequestId) searchParams.append("serviceRequestId", params.serviceRequestId);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sort) searchParams.append("sort", params.sort);

  const url = `${API_BASE}/company/project-requests${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch project requests");
  return data;
}

export async function acceptProjectRequest(proposalId: string, useProviderMilestones: boolean = true) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests/${proposalId}/accept`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ useProviderMilestones }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to accept proposal");
  return data;
}

export async function rejectProjectRequest(proposalId: string, reason?: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests/${proposalId}/reject`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to reject proposal");
  return data;
}

export async function getProjectRequestStats() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/project-requests/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch stats");
  return data;
}

// Provider projects API functions
export async function getProviderProjects(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.search) searchParams.append("search", params.search);

  const url = `${API_BASE}/provider/projects${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch projects");
  return data;
}

export async function getProviderProjectById(id: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/projects/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch project");
  return data;
}

export async function updateProviderProjectStatus(id: string, status: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/projects/${id}/status`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update project status");
  return data;
}

export async function updateProviderMilestoneStatus(milestoneId: string, status: string, deliverables?: any) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/projects/milestones/${milestoneId}/status`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, deliverables }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update milestone status");
  return data;
}

export async function getProviderProjectStats() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/projects/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch stats");
  return data;
}


export async function updateCompanyProject(
  id: string,
  body: Partial<{
    title: string;
    description: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    timeline: string;
    priority: string;
    skills: string[];
    ndaSigned: boolean;
    requirements: string[];
    deliverables: string[];
  }>
) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/projects/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update project");
  return data;
}


// lib/api.ts

export type Milestone = {
  id?: string;
  sequence: number;
  title: string;
  description?: string;
  amount: number;
  dueDate: string; // ISO
  status?: string;
  order?: number;
  completedAt?: string;
  progress?: number;
};

function getToken() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("token") || undefined;
}

/** COMPANY side - Project milestone management */
export async function getCompanyProjectMilestones(projectId: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/company/milestones/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load project milestones");
  return data as {
    success: boolean;
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
      dueDate: string;
      order: number;
      status: string;
    }>;
    milestonesLocked: boolean;
    companyApproved: boolean;
    providerApproved: boolean;
    milestonesApprovedAt: string | null;
  };
}

export async function updateCompanyProjectMilestones(projectId: string, milestones: Milestone[]) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/company/milestones/${projectId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ milestones }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update milestones");
  return data;
}

export async function approveCompanyMilestones(projectId: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/company/milestones/${projectId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to approve milestones");
  return data as { 
    success: boolean; 
    approved: boolean; 
    locked: boolean; 
    milestones: any[];
    milestonesLocked: boolean;
    companyApproved: boolean;
    providerApproved: boolean;
    milestonesApprovedAt: string | null;
  };
}

export async function approveIndividualMilestone(milestoneId: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/company/projects/milestones/${milestoneId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to approve milestone");
  return data;
}

export async function payMilestone(milestoneId: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/company/projects/milestones/${milestoneId}/pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to pay milestone");
  return data;
}

/** PROVIDER side - Project milestone management */
export async function getProviderProjectMilestones(projectId: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/provider/milestones/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load project milestones");
  return data as {
    success: boolean;
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
      dueDate: string;
      order: number;
      status: string;
    }>;
    milestonesLocked: boolean;
    companyApproved: boolean;
    providerApproved: boolean;
    milestonesApprovedAt: string | null;
  };
}

export async function updateProviderProjectMilestones(projectId: string, milestones: Milestone[]) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/provider/milestones/${projectId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ milestones }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update milestones");
  return data;
}

export async function approveProviderMilestones(projectId: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/provider/milestones/${projectId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to approve milestones");
  return data as { 
    success: boolean; 
    approved: boolean; 
    locked: boolean; 
    milestones: any[];
    milestonesLocked: boolean;
    companyApproved: boolean;
    providerApproved: boolean;
    milestonesApprovedAt: string | null;
  };
}

// Provider search API functions
export async function searchProviders(params?: {
  search?: string;
  category?: string;
  location?: string;
  rating?: string;
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.location) queryParams.append("location", params.location);
  if (params?.rating) queryParams.append("rating", params.rating);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/providers?${queryParams}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to search providers");
  return data;
}

export async function getProviderById(providerId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/providers/${providerId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch provider");
  return data;
}

export async function getProviderFilters() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/providers/filters`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch filters");
  return data;
}

// Provider Profile API functions
export async function getProviderProfile() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/profile`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch provider profile");
  return data;
}

export async function updateProviderProfile(profileData: any) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/profile`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update provider profile");
  return data;
}

export async function upsertProviderProfile(profileData: any) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/profile`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to save provider profile");
  return data;
}

export async function getProviderProfileStats() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/profile/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch provider profile stats");
  return data;
}

export async function getProviderProfileCompletion() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/profile/completion`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch profile completion");
  return data;
}


export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
