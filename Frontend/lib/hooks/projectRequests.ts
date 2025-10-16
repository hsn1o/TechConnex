"use client";

import { useEffect, useState, useCallback } from "react";

type Proposal = any;
type Pagination = { page: number; limit: number; total: number; totalPages: number } | null;

function buildUrl(path = "", params?: Record<string, any>) {
  const u = new URL(`/api/company/projectRequests/${path}`.replace(/\/+$/g, ""), window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
    });
  }
  return u.toString();
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function useProjectRequests(queryParams?: { page?: number; limit?: number; status?: string; category?: string }) {
  const [data, setData] = useState<{ proposals: Proposal[]; pagination: Pagination } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (params?: typeof queryParams) => {
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(buildUrl("", params), { headers: getAuthHeader() });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load project requests");
      setData({ proposals: json.proposals || [], pagination: json.pagination || null });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(queryParams);
  }, [load, JSON.stringify(queryParams)]);

  return { data, loading, error, reload: () => load(queryParams) };
}

export function useProjectRequest(id?: string) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
  const res = await fetch(buildUrl(id), { headers: getAuthHeader() });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load proposal");
        if (mounted) setProposal(json.proposal || null);
      } catch (e: any) {
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  return { proposal, loading, error };
}

  export async function acceptProposal(proposalId: string) {
    // Always send Authorization header from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`/api/company/projectRequests/${proposalId}/accept`, {
      method: "POST",
      headers,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Failed to accept proposal");
    return json;
  }

export async function rejectProposal(proposalId: string, reason?: string) {
  const res = await fetch(`/api/company/projectRequests/${proposalId}/reject`, {
    method: "POST",
    headers: Object.assign({ "Content-Type": "application/json" }, getAuthHeader()),
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to reject proposal");
  return json;
}

export async function getProposalStats() {
  const res = await fetch(`/api/company/projectRequests/stats`, { headers: getAuthHeader() });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch stats");
  return json;
}
