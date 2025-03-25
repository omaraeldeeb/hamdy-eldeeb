import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import BrandForm from "@/components/admin/brand-form";

export const metadata: Metadata = {
  title: "Create Brand",
};

const CreateBrandPage = async () => {
  await requireAdmin();
  return (
    <>
      <h2 className="h2-bold">Create Brand</h2>
      <div className="my-8">
        <BrandForm type="Create" />
      </div>
    </>
  );
};

export default CreateBrandPage;
