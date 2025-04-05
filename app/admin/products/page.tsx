import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image"; // Add missing image import
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";
import { formatCurrency } from "@/lib/utils"; // Import the correct formatting function
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Add missing badge import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Products Management",
};

export default async function ProductsPage(
  props: {
    searchParams: Promise<{
      query?: string;
      page?: string;
      category?: string;
      sort?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  await requireAdmin();

  // Then use the destructured values
  const page =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const search =
    typeof searchParams.query === "string" ? searchParams.query : "";
  const categoryId =
    typeof searchParams.category === "string" ? searchParams.category : "";
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  const products = await getAllProducts({
    query: search,
    categoryId,
    sort,
    page,
  });

  return (
    <div className="space-y-2 ">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Products</h1>
          {search && (
            <div>
              Filtered by <i>&quot;{search}&quot;</i>{" "}
              <Link href="/admin/products">
                <Button variant="outline" size="sm" className="ml-2">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild variant="default">
          <Link href="/admin/products/create">Create Product</Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 relative">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={
                            typeof product.images[0] === "string"
                              ? product.images[0]
                              : product.images[0].url
                          }
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <div>{product.name}</div>
                      {product.nameAr && (
                        <div
                          className="text-xs text-muted-foreground"
                          dir="rtl"
                        >
                          {product.nameAr}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category?.name || "N/A"}</TableCell>
                <TableCell>{product.brand?.name || "N/A"}</TableCell>
                <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                <TableCell>
                  {product.discount ? `${product.discount}%` : "-"}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {product.isFeatured && (
                      <Badge variant="outline" className="bg-blue-100">
                        Featured
                      </Badge>
                    )}
                    {product.isLimitedTimeOffer && (
                      <Badge variant="outline" className="bg-red-100">
                        Limited Offer
                      </Badge>
                    )}
                    {product.isNewArrival && (
                      <Badge variant="outline" className="bg-green-100">
                        New
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={product.id} action={deleteProduct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {products.totalPages > 1 && (
        <Pagination page={page} totalPages={products.totalPages} />
      )}
    </div>
  );
}
