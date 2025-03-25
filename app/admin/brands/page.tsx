import { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { Button } from "@/components/ui/button";
import { getPaginatedBrands } from "@/lib/actions/brand.actions";
import BrandsList from "@/components/admin/brands-list";

export const metadata: Metadata = {
  title: "Brands Management",
};

export default async function BrandsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  await requireAdmin();

  // Destructure the searchParams first to avoid direct property access
  const { page: pageParam, search: searchParam } = searchParams;

  // Then use the destructured values
  const page = typeof pageParam === "string" ? Number(pageParam) : 1;
  const search = typeof searchParam === "string" ? searchParam : "";

  const { data: brands, totalPages } = await getPaginatedBrands({
    page,
    search,
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="h2-bold">Brands Management</h2>
        <Link href="/admin/brands/create">
          <Button>Create Brand</Button>
        </Link>
      </div>

      <div className="my-8">
        <BrandsList
          brands={brands}
          totalPages={totalPages}
          currentPage={page}
        />
      </div>
    </>
  );
}
