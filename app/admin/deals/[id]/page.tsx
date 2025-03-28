import DealForm from "@/components/admin/deal-form";
import { requireAdmin } from "@/lib/auth-guard";
import { getDeal } from "@/lib/actions/deal-actions";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DealEditPage({ params }: PageProps) {
  await requireAdmin();

  const { deal, error } = await getDeal(params.id);

  if (error || !deal) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Deal</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Deal: {deal.titleEn}</CardTitle>
          <CardDescription>
            Update the details of this promotional deal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DealForm deal={deal} />
        </CardContent>
      </Card>
    </div>
  );
}
