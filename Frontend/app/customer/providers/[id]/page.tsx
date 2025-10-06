// app/customer/providers/[id]/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProviderDetailClient from "@/components/customer/providers/ProviderDetailClient";
import type { Provider, Review, PortfolioItem } from "@/components/customer/providers/types";

type Props = { params: { id: string } };

export default async function ProviderDetailPage({ params }: Props) {
  // You can replace this with a real server fetch:
  // const res = await fetch(`${process.env.API_URL}/providers/${params.id}`, { cache: "no-store" });
  // const raw = await res.json();

  // Mock mapping to our UI types:
  const provider: Provider = {
    id: params.id,
    name: "Aisha Noor",
    email: "aisha@example.com",
    avatar: "/placeholder.svg",
    title: "Full-stack Engineer",
    company: "Noor Tech",
    rating: 4.8,
    reviewCount: 27,
    completedJobs: 54,
    hourlyRate: 120,
    location: "Kuala Lumpur",
    bio: "I build robust web apps with Next.js, Node, and Postgres. 7+ years of experience.",
    availability: "Available",
    responseTime: "2 hours",
    skills: ["Next.js", "Node.js", "PostgreSQL", "Prisma", "Tailwind CSS"],
    specialties: ["SaaS", "Dashboards", "eCommerce"],
    languages: ["English", "Malay", "Arabic"],
    verified: true,
    topRated: true,
    saved: false,
  };

  const portfolio: PortfolioItem[] = [
    { id: "p1", title: "SaaS Admin", cover: "/placeholder.svg", url: "#", tags: ["Next.js", "Charts"] },
    { id: "p2", title: "eCommerce App", cover: "/placeholder.svg", url: "#", tags: ["Node", "Stripe"] },
  ];

  const reviews: Review[] = [
    { id: "r1", author: "Tech Innovations", rating: 5, date: "2024-08-04", text: "Excellent delivery and communication." },
    { id: "r2", author: "Alpha Labs", rating: 4.5, date: "2024-05-22", text: "Great work; will hire again." },
  ];

  return (
    <CustomerLayout>
      <ProviderDetailClient provider={provider} portfolio={portfolio} reviews={reviews} />
    </CustomerLayout>
  );
}
