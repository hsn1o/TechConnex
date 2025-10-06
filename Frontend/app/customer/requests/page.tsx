// app/customer/requests/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import RequestsClient from "@/components/customer/requests/RequestsClient";
import type { Option } from "@/components/customer/requests/types";

export default async function RequestsPage() {
  // Optional: preload filter options on server and pass as props
  const projects: Option[] = [
    { value: "all", label: "All Projects" },
    { value: "proj-1", label: "E-commerce Website Development" },
    { value: "proj-2", label: "Mobile App UI/UX Design" },
    { value: "proj-3", label: "Data Analytics Dashboard" },
  ];

  const sortOptions: Option[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "highest-bid", label: "Highest Bid" },
    { value: "lowest-bid", label: "Lowest Bid" },
    { value: "rating", label: "Rating" },
  ];

  return (
    <CustomerLayout>
      <RequestsClient projects={projects} sortOptions={sortOptions} />
    </CustomerLayout>
  );
}
