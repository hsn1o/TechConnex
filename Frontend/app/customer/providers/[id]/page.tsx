"use client";

// app/customer/providers/[id]/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProviderDetailClient from "@/components/customer/providers/ProviderDetailClient";
import type { Provider, Review, PortfolioItem } from "@/components/customer/providers/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { params: { id: string } };

export default function ProviderDetailPage({ params }: Props) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/providers/${params.id}/full`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProvider(data.provider);
            setPortfolio(data.portfolio || []);
            setReviews(data.reviews || []);
          }
        } else if (response.status === 404) {
          // Provider not found
          router.push("/customer/providers");
        }
      } catch (error) {
        console.error('Failed to fetch provider details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [params.id, router]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading provider details...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!provider) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
          <p className="text-gray-600 mb-6">The provider you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push("/customer/providers")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Providers
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <ProviderDetailClient provider={provider} portfolio={portfolio} reviews={reviews} />
    </CustomerLayout>
  );
}
