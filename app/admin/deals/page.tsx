import { getDeals } from "@/lib/actions/deal-actions";
import DealsList from "@/components/admin/deals-list";
import { requireAdmin } from "@/lib/auth-guard";
export const metadata = {
  title: "Deals Management | Admin",
  description: "Manage promotional deals and countdowns",
};

export default async function DealsPage() {
  await requireAdmin();

  const { deals, error } = await getDeals();

  if (error) {
    return <div className="p-4">Error: {error}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Deals Management</h1>
      <DealsList deals={deals || []} />
    </div>
  );
}
