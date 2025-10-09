// app/customer/projects/[id]/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProjectDetailsClient from "@/components/customer/projects/details/ProjectDetailsClient";
import type {
  Project, Milestone, Bid, FileItem, MessageItem,
} from "@/components/customer/projects/types";

type Props = { params: { id: string } };

export default async function ProjectDetailsPage({ params }: Props) {
  // TODO: replace with real server fetch
  const project: Project = {
    id: params.id,
    title: "E-commerce Website Development",
    description:
      "Build a scalable e-commerce web app with Next.js, Prisma, and Postgres. Includes admin panel, product catalog, checkout, and payment integration.",
    provider: "Aisha Noor",
    status: "in_progress",
    progress: 45,
    budget: 38000,
    spent: 14000,
    deadline: "2025-12-15",
    startDate: "2025-10-01",
    avatar: "/placeholder.svg",
    category: "Web Development",
    milestones: 5,
    completedMilestones: 2,
    priority: "High",
    ndaSigned: true,
    aiStackSuggest: ["Next.js", "Prisma", "Postgres", "Stripe"],
  };

  const milestones: Milestone[] = [
    { id: "m1", title: "Discovery & Spec", amount: 4000, due: "2025-10-10", status: "RELEASED" },
    { id: "m2", title: "Design System", amount: 6000, due: "2025-10-22", status: "PAID" },
    { id: "m3", title: "MVP Backend", amount: 10000, due: "2025-11-08", status: "PENDING" },
    { id: "m4", title: "MVP Frontend", amount: 10000, due: "2025-11-25", status: "PENDING" },
    { id: "m5", title: "Polish & Launch", amount: 8000, due: "2025-12-10", status: "PENDING" },
  ];

  const bids: Bid[] = [
    { id: "b1", provider: "Alpha Labs", amount: 42000, timeline: "8 weeks", rating: 4.6, summary: "Robust e-commerce stack with testing & CI." },
    { id: "b2", provider: "Noor Tech", amount: 38000, timeline: "7 weeks", rating: 4.8, summary: "Ship MVP fast, iterate weekly." },
  ];

  const files: FileItem[] = [
    { id: "f1", name: "Requirements.pdf", size: "1.2 MB", uploadedAt: "2025-10-01" },
    { id: "f2", name: "Wireframes.fig", size: "3.4 MB", uploadedAt: "2025-10-06" },
  ];

  const messages: MessageItem[] = [
    { id: "msg1", author: "Hasan", at: "2025-10-06T12:05:00Z", text: "Please confirm the payment flow." },
    { id: "msg2", author: "Aisha", at: "2025-10-06T13:10:00Z", text: "Confirmed. Using Stripe Checkout." },
  ];

  return (
    <CustomerLayout>
      <ProjectDetailsClient
        project={project}
        milestones={milestones}
        bids={bids}
        files={files}
        messages={messages}
      />
    </CustomerLayout>
  );
}
