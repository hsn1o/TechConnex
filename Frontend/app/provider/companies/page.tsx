// app/provider/companies/page.tsx
import { ProviderLayout } from "@/components/provider-layout";
import FindCompaniesClient from "@/components/provider/companies/FindCompaniesClient";

export default async function CompaniesPage() {
  let industries = [
    { value: "all", label: "All Industries" },
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
  ];

  let locations = [
    { value: "all", label: "All Locations" },
    { value: "kuala lumpur", label: "Kuala Lumpur" },
    { value: "selangor", label: "Selangor" },
  ];

  let companySizes = [
    { value: "all", label: "All Company Sizes" },
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
  ];

  let ratings = [
    { value: "all", label: "All Ratings" },
    { value: "4.5+", label: "4.5+ Stars" },
    { value: "4.0+", label: "4.0+ Stars" },
  ];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/companies/filters`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        industries = data.industries || industries;
        locations = data.locations || locations;
        companySizes = data.companySizes || companySizes;
        ratings = data.ratings || ratings;
      }
    }
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    // Use default options if API fails
  }

  return (
    <ProviderLayout>
      <FindCompaniesClient
        industries={industries}
        locations={locations}
        companySizes={companySizes}
        ratings={ratings}
      />
    </ProviderLayout>
  );
}

