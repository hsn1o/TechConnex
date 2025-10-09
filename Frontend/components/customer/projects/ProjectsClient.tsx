"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProjectFilters from "./sections/ProjectFilters";
import ProjectsGrid from "./sections/ProjectsGrid";
import ProjectsList from "./sections/ProjectsList";
import type { Project } from "./types";
import { getCompanyProjects } from "@/lib/api";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | Project["status"]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await getCompanyProjects({
          page: 1,
          limit: 50,
        });

        // Transform service requests to Project format
        const transformedProjects: Project[] = (response.serviceRequests || []).map((sr: any) => ({
          id: sr.id,
          title: sr.title,
          description: sr.description || "",
          provider: sr.project?.provider?.name || null,
          status: sr.status === "OPEN" ? "pending" : sr.status === "MATCHED" ? "in_progress" : "completed",
          progress: sr.project ? 50 : 0, // Mock progress for active projects
          budget: sr.budgetMax ?? 0,
          spent: 0, // Will be calculated from payments
          deadline: sr.timeline || "",
          startDate: sr.createdAt,
          avatar: "/placeholder.svg",
          category: (sr.category || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
          milestones: sr.project?.milestones?.length || 0,
          completedMilestones: sr.project?.milestones?.filter((m: any) => m.status === "APPROVED").length || 0,
          proposals: sr.proposals || [],
          timeline: sr.timeline,
          priority: sr.priority,
          ndaSigned: sr.ndaSigned || false,
          aiStackSuggest: sr.aiStackSuggest || [],
          // Additional fields from service request
          budgetMin: sr.budgetMin,
          budgetMax: sr.budgetMax,
          requirements: sr.requirements,
          deliverables: sr.deliverables,
          customer: sr.customer,
          project: sr.project,
        }));

        setProjects(transformedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        // Set empty array on error
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchesText =
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.provider || "").toLowerCase().includes(q);
      const matchesStatus = status === "all" || p.status === status;
      return matchesText && matchesStatus;
    });
  }, [projects, search, status]);

  if (loading) return <div className="text-center p-10">Loading projects…</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600">Manage and track all your ICT projects</p>
        </div>
        <Link href="/customer/projects/new">
          <Button><Plus className="w-4 h-4 mr-2" />New Project</Button>
        </Link>
      </div>

      <ProjectFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <ProjectsGrid projects={filtered} />
        </TabsContent>
        <TabsContent value="list">
          <ProjectsList projects={filtered} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
