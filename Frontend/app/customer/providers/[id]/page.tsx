// app/customer/providers/[id]/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProviderDetailClient from "@/components/customer/providers/ProviderDetailClient";
import type { Provider, Review, PortfolioItem } from "@/components/customer/providers/types";
import { notFound } from "next/navigation";

type Props = { params: { id: string } };

export default async function ProviderDetailPage({ params }: Props) {
  // Fetch provider data from backend
  let provider: Provider | null = null;
  let portfolio: PortfolioItem[] = [];
  let reviews: Review[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/providers/${params.id}/full`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        provider = data.provider;
        portfolio = data.portfolio || [];
        reviews = data.reviews || [];
      }
    }
  } catch (error) {
    console.error('Failed to fetch provider details:', error);
  }

  // If provider not found, show 404
  if (!provider) {
    notFound();
  }

  return (
    <CustomerLayout>
      <ProviderDetailClient provider={provider} portfolio={portfolio} reviews={reviews} />
    </CustomerLayout>
  );
}
