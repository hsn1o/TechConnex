// app/customer/projects/new/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import NewProjectClient from "@/components/customer/projects/NewProjectClient";

export default async function NewProjectPage() {
  return (
    <CustomerLayout>
      <NewProjectClient />
    </CustomerLayout>
  );
}
