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