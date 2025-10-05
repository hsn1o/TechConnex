"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Stats } from "../types";

export default function ProfileStatsCard({ stats }: { stats: Stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Statistics</CardTitle>
        <CardDescription>Your activity and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Stat label="Projects Posted" value={stats.projectsPosted} />
          <Stat label="Active Projects" value={stats.activeProjects} />
          <Stat label="Completed" value={stats.completedProjects} />
          <Stat label="Total Spent" value={`RM${stats.totalSpent.toLocaleString()}`} />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.averageRating}</span>
            </div>
            <div className="text-sm text-gray-500">Average Rating</div>
          </div>
          <Stat label="Response Time" value={stats.responseTime} />
          <Stat label="Success Rate" value={`${stats.successRate}%`} />
          <div className="text-center">
            <div className="text-sm font-bold text-gray-600">{stats.memberSince}</div>
            <div className="text-sm text-gray-500">Member Since</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
