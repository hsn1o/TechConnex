// app/customer/projects/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProjectsClient from "@/components/customer/projects/ProjectsClient";

export default async function ProjectsPage() {
  return (
    <CustomerLayout>
      <ProjectsClient />
    </CustomerLayout>
  );
}
