// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
