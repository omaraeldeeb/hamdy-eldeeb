import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import BrandForm from "@/components/admin/brand-form";
import { getBrandById } from "@/lib/actions/brand.actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Update Brand",
};

const UpdateBrandPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  await requireAdmin();

  const brand = await getBrandById(params.id);

  if (!brand) {
    notFound();
  }

  return (
    <>
      <h2 className="h2-bold">Update Brand</h2>
      <div className="my-8">
        <BrandForm type="Update" brand={brand} brandId={params.id} />
      </div>
    </>
  );
};

export default UpdateBrandPage;
