import { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { Button } from "@/components/ui/button";
import { getPaginatedCategories } from "@/lib/actions/category.actions";
import CategoriesList from "@/components/admin/categories-list";
import { Category } from "@/types";

export const metadata: Metadata = {
  title: "Categories Management",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();

  // Destructure the searchParams first to avoid direct property access
  const {
    page: pageParam,
    search: searchParam,
    level: levelParam,
  } = searchParams;

  // Then use the destructured values
  const page = typeof pageParam === "string" ? Number(pageParam) : 1;
  const search = typeof searchParam === "string" ? searchParam : "";
  const level = typeof levelParam === "string" ? Number(levelParam) : undefined;

  const { data: categories, totalPages } = await getPaginatedCategories({
    page,
    search,
    level,
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="h2-bold">Categories Management</h2>
        <Link href="/admin/categories/create">
          <Button>Create Category</Button>
        </Link>
      </div>

      <div className="my-8">
        <CategoriesList
          categories={categories as Category[]}
          totalPages={totalPages}
          currentPage={page}
        />
      </div>
    </>
  );
}
