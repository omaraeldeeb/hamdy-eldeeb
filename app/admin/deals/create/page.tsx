import DealForm from "@/components/admin/deal-form";
import { requireAdmin } from "@/lib/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Create Deal | Admin",
  description: "Create a new promotional deal",
};

export default async function CreateDealPage() {
  await requireAdmin();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Create Deal</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Deal</CardTitle>
          <CardDescription>
            Create a new promotional deal with countdown timer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DealForm />
        </CardContent>
      </Card>
    </div>
  );
}
