// app/customer/providers/[id]/page.tsx
import { cookies } from "next/headers";
import { CustomerLayout } from "@/components/customer-layout";
import ProviderDetailClient from "@/components/customer/providers/ProviderDetailClient";
import type { Provider, Review, PortfolioItem } from "@/components/customer/providers/types";
import { notFound } from "next/navigation";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ Read token from cookies
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  let provider: Provider | null = null;
  let portfolio: PortfolioItem[] = [];
  let reviews: Review[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/providers/${id}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        provider = data.provider;
        portfolio = data.portfolio || [];
        reviews = data.reviews || [];
      } else {
        console.error("Backend returned success=false", data);
      }
    } else {
      console.error("Response not ok:", response.status);
    }
  } catch (error) {
    console.error("Failed to fetch provider details:", error);
  }

  if (!provider) {
    notFound();
  }

  return (
    <CustomerLayout>
      <ProviderDetailClient provider={provider} portfolio={portfolio} reviews={reviews} />
    </CustomerLayout>
  );
}
