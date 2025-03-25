import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  // Update to use the new category and brand structure
  const categoryName = product.category?.name || "";

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-background dark:border-border">
      <Link href={`/product/${product.slug}`} className="block h-full w-full">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-1 text-xs text-muted-foreground">
            {categoryName}
          </div>
          <h3 className="mb-1 truncate text-sm font-medium">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium text-primary">
              {formatCurrency(product.price)}
            </span>
            <div className="flex items-center">
              <span className="mr-1 text-yellow-400">★</span>
              <span className="text-xs">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
