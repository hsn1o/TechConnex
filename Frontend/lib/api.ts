// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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

export async function getCompanyProfileCompletion() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/company/profile/completion`, {
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

export async function uploadCompanyProfileImage(imageFile: File) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("profileImage", imageFile);

  const res = await fetch(`${API_BASE_URL}/company/profile/upload-image`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to upload profile image");
  return data;
}

export async function uploadCompanyMediaGalleryImages(imageFiles: File[]) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("mediaImages", file);
  });

  const res = await fetch(`${API_BASE_URL}/company/profile/upload-media`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to upload media gallery images");
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
  ndaSigned?: boolean;
  requirements?: string;  // ✅ Markdown string
  deliverables?: string;  // ✅ Markdown string
}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : undefined;

  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create project");
  }

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

export async function sendProposal(formData: FormData) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : undefined;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/provider/proposals`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        // DO NOT set Content-Type manually.
      },
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Proposal submit failed");
  }
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

/**
 * Get company project statistics (active projects, completed projects, total spent)
 */
export async function getCompanyProjectStats() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/projects/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch project stats");
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

export async function updateProviderMilestoneStatus(
  milestoneId: string, 
  status: string, 
  deliverables?: any,
  submissionNote?: string,
  attachment?: File
) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  // Use FormData if there's an attachment, otherwise use JSON
  const useFormData = attachment !== undefined;

  let body: FormData | string;
  let headers: HeadersInit = {
    "Authorization": `Bearer ${token}`,
  };

  if (useFormData) {
    body = new FormData();
    body.append("status", status);
    if (deliverables) {
      body.append("deliverables", JSON.stringify(deliverables));
    }
    if (submissionNote) {
      body.append("submissionNote", submissionNote);
    }
    if (attachment) {
      body.append("attachment", attachment);
    }
    // Don't set Content-Type for FormData - browser will set it with boundary
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ status, deliverables, submissionNote });
  }

  const res = await fetch(`${API_BASE}/provider/projects/milestones/${milestoneId}/status`, {
    method: "PUT",
    headers,
    body,
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

export async function getProviderPerformanceMetrics() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/projects/performance`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch performance metrics");
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
    requirements: string;  // ✅ Markdown string
    deliverables: string;  // ✅ Markdown string
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
  startDeliverables?: any; // When starting work (LOCKED -> IN_PROGRESS)
  submitDeliverables?: any; // When submitting work (IN_PROGRESS -> SUBMITTED)
  submissionAttachmentUrl?: string;
  submissionNote?: string;
  submittedAt?: string;
  revisionNumber?: number; // Track submission iterations
  submissionHistory?: any[]; // Array of previous submissions
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
      startDeliverables?: any;
      submitDeliverables?: any;
      submissionAttachmentUrl?: string;
      submissionNote?: string;
      submittedAt?: string;
      revisionNumber?: number;
      submissionHistory?: any[];
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

export async function requestMilestoneChanges(milestoneId: string, reason?: string) {
  const token = getToken(); if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/company/projects/milestones/${milestoneId}/request-changes`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to request milestone changes");
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

// Company search API functions (for providers)
export async function searchCompanies(params?: {
  search?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  rating?: string;
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.industry) queryParams.append("industry", params.industry);
  if (params?.location) queryParams.append("location", params.location);
  if (params?.companySize) queryParams.append("companySize", params.companySize);
  if (params?.rating) queryParams.append("rating", params.rating);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/companies?${queryParams}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to search companies");
  return data;
}

export async function getCompanyById(companyId: string, userId?: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const queryParams = new URLSearchParams();
  if (userId) queryParams.append("userId", userId);

  const res = await fetch(`${API_BASE}/companies/${companyId}?${queryParams}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch company");
  return data;
}

export async function getCompanyFilters() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/companies/filters`, {
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

export async function saveCompany(companyId: string, userId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/companies/${companyId}/save?userId=${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to save company");
  return data;
}

export async function unsaveCompany(companyId: string, userId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/companies/${companyId}/save?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to unsave company");
  return data;
}

export async function getSavedCompanies(userId: string, page?: number, limit?: number) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const res = await fetch(`${API_BASE}/companies/users/${userId}/saved-companies?${queryParams}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch saved companies");
  return data;
}

export async function getCompanyOpportunities(companyId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/companies/${companyId}/opportunities`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch company opportunities");
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

export async function uploadProviderProfileImage(imageFile: File) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("profileImage", imageFile);

  const res = await fetch(`${API_BASE}/provider/profile/upload-image`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to upload profile image");
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

// Review API functions
export async function getCompanyReviews(params?: {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
  sortBy?: string;
  status?: string;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.status) searchParams.append("status", params.status);

  const url = `${API_BASE}/company/reviews${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch reviews");
  return data;
}

export async function getProviderReviews(params?: {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
  sortBy?: string;
  status?: string;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.status) searchParams.append("status", params.status);

  const url = `${API_BASE}/provider/reviews${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch reviews");
  return data;
}

export async function createCompanyReview(reviewData: {
  projectId: string;
  recipientId: string;
  content: string;
  rating: number;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
  company?: string;
  role?: string;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/reviews`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create review");
  return data;
}

export async function createProviderReview(reviewData: {
  projectId: string;
  recipientId: string;
  content: string;
  rating: number;
  communicationRating?: number;
  clarityRating?: number;
  paymentRating?: number;
  professionalismRating?: number;
  company?: string;
  role?: string;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/reviews`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });
  
  const data = await res.json();
  
  if (!res.ok) throw new Error(data?.message || "Failed to create review");
  return data;
}

export async function getCompanyReviewStatistics() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/reviews/statistics`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch review statistics");
  return data;
}

export async function getProviderReviewStatistics() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/reviews/statistics`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch review statistics");
  return data;
}

export async function getCompletedProjectsForCompanyReview() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/reviews/projects/completed`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch completed projects");
  return data;
}

export async function getCompletedProjectsForProviderReview() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/reviews/projects/completed`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch completed projects");
  return data;
}

// Update review functions
export async function updateCompanyReview(reviewId: string, reviewData: {
  content?: string;
  rating?: number;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/company/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update review");
  return data;
}

export async function updateProviderReview(reviewId: string, reviewData: {
  content?: string;
  rating?: number;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update review");
  return data;
}

// Delete review functions
export async function deleteCompanyReview(reviewId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  console.log("🔍 Deleting company review:", reviewId);
  console.log("🔍 API URL:", `${API_BASE}/company/reviews/${reviewId}`);

  const res = await fetch(`${API_BASE}/company/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  console.log("🔍 Delete response:", { status: res.status, data });
  
  if (!res.ok) throw new Error(data?.message || "Failed to delete review");
  return data;
}

export async function deleteProviderReview(reviewId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  
  if (!res.ok) throw new Error(data?.message || "Failed to delete review");
  return data;
}

export async function createReviewReply(reviewId: string, content: string, isProvider: boolean = false) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const endpoint = isProvider ? "provider" : "company";
  const res = await fetch(`${API_BASE}/${endpoint}/reviews/${reviewId}/reply`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create reply");
  return data;
}

export async function getProviderPortfolio() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/provider/profile/portfolio`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch portfolio");
  return data;
}

export async function getProviderCompletedProjects(providerId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/providers/${providerId}/completed-projects`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch completed projects");
  return data;
}
