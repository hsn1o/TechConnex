// app/customer/providers/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import FindProvidersClient from "@/components/customer/providers/FindProvidersClient";

export default async function ProvidersPage() {
  // Fetch filter options from backend
  let categories = [
    { value: "all", label: "All Categories" },
    { value: "web", label: "Web Development" },
    { value: "mobile", label: "Mobile Development" },
    { value: "cloud", label: "Cloud Services" },
    { value: "data", label: "Data Analytics" },
    { value: "ui", label: "UI/UX Design" },
  ];

  let locations = [
    { value: "all", label: "All Locations" },
    { value: "kuala lumpur", label: "Kuala Lumpur" },
    { value: "selangor", label: "Selangor" },
    { value: "penang", label: "Penang" },
    { value: "johor", label: "Johor" },
  ];

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
        categories = data.categories || categories;
        locations = data.locations || locations;
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
        categories={categories}
        locations={locations}
        ratings={ratings}
      />
    </CustomerLayout>
  );
}
