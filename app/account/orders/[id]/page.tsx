import { AccountOrderDetailView } from "../../AccountDashboard";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountOrderDetailView id={id} />;
}
