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
  requirements?: string[];  // ✅ updated to accept arrays
  deliverables?: string[];  // ✅ updated to accept arrays
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


export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ fix
    ...options.headers,
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    { ...options, headers }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Admin User Management API
export async function getAdminUsers(filters?: { role?: string; status?: string; search?: string }) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const params = new URLSearchParams();
  if (filters?.role) params.append("role", filters.role);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch users");
  return data;
}

export async function getAdminUserStats() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/users/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch user stats");
  return data;
}

export async function getAdminUserById(userId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch user");
  return data;
}

export async function suspendUser(userId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/users/${userId}/suspend`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to suspend user");
  return data;
}

export async function activateUser(userId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/users/${userId}/activate`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to activate user");
  return data;
}

export async function updateAdminUser(userId: string, updateData: any) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to update user");
  return data;
}

// Dispute API functions
export async function createDispute(disputeData: {
  projectId: string;
  milestoneId?: string;
  paymentId?: string;
  reason: string;
  description: string;
  contestedAmount?: number;
  suggestedResolution?: string;
  attachments?: File[];
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  // Create FormData for file uploads
  const formData = new FormData();
  formData.append("projectId", disputeData.projectId);
  formData.append("reason", disputeData.reason);
  formData.append("description", disputeData.description);
  
  if (disputeData.milestoneId) {
    formData.append("milestoneId", disputeData.milestoneId);
  }
  if (disputeData.paymentId) {
    formData.append("paymentId", disputeData.paymentId);
  }
  if (disputeData.contestedAmount !== undefined) {
    formData.append("contestedAmount", disputeData.contestedAmount.toString());
  }
  if (disputeData.suggestedResolution) {
    formData.append("suggestedResolution", disputeData.suggestedResolution);
  }
  
  // Append files
  if (disputeData.attachments && disputeData.attachments.length > 0) {
    disputeData.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const res = await fetch(`${API_BASE}/disputes`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to create dispute");
  return data;
}

export async function getDisputeByProject(projectId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/disputes/project/${projectId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch dispute");
  return data;
}

export async function updateDispute(disputeId: string, updateData: {
  reason?: string;
  description?: string;
  contestedAmount?: number;
  suggestedResolution?: string;
  additionalNotes?: string;
  attachments?: File[];
  projectId?: string;
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  // Create FormData for file uploads
  const formData = new FormData();
  
  if (updateData.reason) formData.append("reason", updateData.reason);
  if (updateData.description) formData.append("description", updateData.description);
  if (updateData.contestedAmount !== undefined) {
    formData.append("contestedAmount", updateData.contestedAmount.toString());
  }
  if (updateData.suggestedResolution) {
    formData.append("suggestedResolution", updateData.suggestedResolution);
  }
  if (updateData.additionalNotes) {
    formData.append("additionalNotes", updateData.additionalNotes);
  }
  if (updateData.projectId) {
    formData.append("projectId", updateData.projectId);
  }
  
  // Append files
  if (updateData.attachments && updateData.attachments.length > 0) {
    updateData.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const res = await fetch(`${API_BASE}/disputes/${disputeId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to update dispute");
  return data;
}

export async function getDisputesByProject(projectId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/disputes/project/${projectId}/all`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch disputes");
  return data;
}

// Admin Disputes API
export async function getAdminDisputes(filters?: { status?: string; search?: string }) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const res = await fetch(`${API_BASE}/admin/disputes?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch disputes");
  return data;
}

export async function getAdminDisputeStats() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/disputes/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch dispute stats");
  return data;
}

export async function getAdminDisputeById(disputeId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch dispute");
  return data;
}

export async function resolveDispute(disputeId: string, status: string, resolution?: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}/resolve`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, resolution }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to resolve dispute");
  return data;
}

export async function simulateDisputePayout(disputeId: string, refundAmount: number, releaseAmount: number) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}/payout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refundAmount, releaseAmount }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to simulate payout");
  return data;
}

export async function redoMilestone(disputeId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}/redo-milestone`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to redo milestone");
  return data;
}

// Admin Projects API
export async function getAdminProjects(filters?: { status?: string; search?: string }) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const res = await fetch(`${API_BASE}/admin/projects?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch projects");
  return data;
}

export async function getAdminProjectStats() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/projects/stats`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch project stats");
  return data;
}

export async function getAdminProjectById(projectId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/projects/${projectId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch project");
  return data;
}

export async function updateAdminProject(projectId: string, updateData: any) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/admin/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to update project");
  return data;
}
