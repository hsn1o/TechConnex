// app/customer/providers/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import FindProvidersClient from "@/components/customer/providers/FindProvidersClient";

export default async function ProvidersPage() {
  

  let ratings = [
    { value: "all", label: "All Ratings" },
    { value: "4.5+", label: "4.5+ Stars" },
    { value: "4.0+", label: "4.0+ Stars" },
  ];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/providers/filters`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        ratings = data.ratings || ratings;
      }
    }
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    // Use default options if API fails
  }

  return (
    <CustomerLayout>
      <FindProvidersClient
        ratings={ratings}
      />
    </CustomerLayout>
  );
}
