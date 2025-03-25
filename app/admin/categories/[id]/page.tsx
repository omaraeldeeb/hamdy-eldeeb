import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import CategoryForm from "@/components/admin/category-form";
import { getCategoryById } from "@/lib/actions/category.actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Update Category",
};

const UpdateCategoryPage = async ({ params }: { params: { id: string } }) => {
  await requireAdmin();

  const categoryData = await getCategoryById(params.id);

  if (!categoryData) {
    notFound();
  }

  // Convert the category data to match the expected Category type
  const category = {
    ...categoryData,
    parent: categoryData.parent || undefined,
  };

  return (
    <>
      <h2 className="h2-bold">Update Category</h2>
      <div className="my-8">
        <CategoryForm
          type="Update"
          category={category}
          categoryId={params.id}
        />
      </div>
    </>
  );
};

export default UpdateCategoryPage;
