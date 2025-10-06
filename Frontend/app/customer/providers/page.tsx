// app/customer/providers/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import FindProvidersClient from "@/components/customer/providers/FindProvidersClient";

export default async function ProvidersPage() {
  // (Optional) prefetch static data on the server and pass as props
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web", label: "Web Development" },
    { value: "mobile", label: "Mobile Development" },
    { value: "cloud", label: "Cloud Services" },
    { value: "data", label: "Data Analytics" },
    { value: "ui", label: "UI/UX Design" },
  ];

  const locations = [
    { value: "all", label: "All Locations" },
    { value: "kuala lumpur", label: "Kuala Lumpur" },
    { value: "selangor", label: "Selangor" },
    { value: "penang", label: "Penang" },
    { value: "johor", label: "Johor" },
  ];

  const ratings = [
    { value: "all", label: "All Ratings" },
    { value: "4.5+", label: "4.5+ Stars" },
    { value: "4.0+", label: "4.0+ Stars" },
  ];

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
