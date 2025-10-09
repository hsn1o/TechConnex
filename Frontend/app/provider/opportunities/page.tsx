// app/provider/opportunities/page.tsx
import { ProviderLayout } from "@/components/provider-layout";
import OpportunitiesClient from "@/components/provider/opportunities/OpportunitiesClient"
import type { Opportunity } from "@/components/provider/opportunities/types";

export default async function ProviderOpportunitiesPage() {
  // --- MOCK DATA (replace with server fetch later) ---
  const opportunities: Opportunity[] = [
    {
      id: "SR-1001",
      title: "E-commerce Website Development",
      description: "Build a scalable Next.js storefront with Stripe, admin, and product management.",
      fullDescription:
        "We need a full E-commerce web app. Features: product catalog, cart, Stripe Checkout, order mgmt, admin dashboard, analytics. SEO friendly and responsive.",
      client: "Tech Innovations Sdn Bhd",
      budget: "RM 12,000 – RM 18,000",
      budgetType: "fixed",
      timeline: "6–8 weeks",
      skills: ["Next.js", "Node.js", "Stripe", "PostgreSQL"],
      postedTime: "2 hours ago",
      matchScore: 92,
      proposals: 8,
      category: "web",
      location: "Kuala Lumpur",
      clientRating: 4.8,
      clientJobs: 12,
      avatar: "/placeholder.svg",
      urgent: true,
      verified: true,
      hasSubmitted: false,
      requirements: ["SSR pages for PDP/PLP", "Stripe payments", "Role-based admin"],
      deliverables: ["Source code (Git)", "Docs + ERD", "Deployment guide"],
      clientInfo: { companySize: "51–200", industry: "Retail", memberSince: 2021, totalSpent: "RM 140k", avgRating: 4.7 },
    },
    {
      id: "SR-1002",
      title: "Mobile App UI/UX for Fitness Tracker",
      description: "Create a clean, modern UI for iOS/Android with 20–25 key screens.",
      fullDescription:
        "We need a design system plus flows for onboarding, sessions, analytics, and social features. Handoff via Figma.",
      client: "Alpha Labs",
      budget: "RM 8,000 – RM 12,000",
      budgetType: "fixed",
      timeline: "4–6 weeks",
      skills: ["UI/UX Design", "Figma"],
      postedTime: "yesterday",
      matchScore: 86,
      proposals: 5,
      category: "mobile",
      location: "Remote",
      clientRating: 4.9,
      clientJobs: 6,
      avatar: "/placeholder.svg",
      verified: true,
      hasSubmitted: true,
      requirements: ["Design system", "iOS/Android guidelines"],
      deliverables: ["Figma file", "Clickable prototype"],
      clientInfo: { companySize: "11–50", industry: "Health", memberSince: 2020, totalSpent: "RM 60k", avgRating: 4.8 },
    },
    {
      id: "SR-1003",
      title: "Cloud Infra Setup (AWS)",
      description: "Provision ECS + RDS + ALB, IaC with Terraform and monitoring.",
      fullDescription:
        "Migrate to AWS: VPC, ECS Fargate, RDS Postgres, ALB, CloudWatch dashboards/alerts. Terraform with docs and handover.",
      client: "Manufacturing Corp",
      budget: "RM 20,000 – RM 30,000",
      budgetType: "fixed",
      timeline: "3–5 weeks",
      skills: ["AWS", "Terraform", "Docker", "PostgreSQL"],
      postedTime: "3 days ago",
      matchScore: 79,
      proposals: 2,
      category: "cloud",
      location: "Penang",
      clientRating: 4.6,
      clientJobs: 3,
      avatar: "/placeholder.svg",
      hasSubmitted: false,
      requirements: ["Terraform modules", "Dashboards & alerts"],
      deliverables: ["Terraform repo", "Runbooks"],
      clientInfo: { companySize: "201–500", industry: "Manufacturing", memberSince: 2019, totalSpent: "RM 200k", avgRating: 4.6 },
    },
  ];

  return (
    <ProviderLayout>
      <OpportunitiesClient opportunities={opportunities} />
    </ProviderLayout>
  );
}
