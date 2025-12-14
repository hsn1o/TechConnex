import { cookies } from "next/headers";
import { AdminLayout } from "@/components/admin-layout";
import PaymentDetailClient from "./PaymentDetailClient";
import { notFound } from "next/navigation";
import { getAdminPaymentById } from "@/lib/api";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  let payment = null;

  try {
    if (token) {
      // We need to fetch on the client side since we need the token
      // For now, we'll pass the id and let the client component fetch
    }
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
  }

  return (
    <AdminLayout>
      <PaymentDetailClient paymentId={id} />
    </AdminLayout>
  );
}

