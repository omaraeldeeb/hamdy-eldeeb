import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

// Extract number value from various possible types
function extractNumberValue(
  value: number | { toString(): string } | unknown
): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "object" && value !== null && "toString" in value) {
    return parseFloat((value as { toString(): string }).toString());
  }
  return parseFloat(String(value));
}

export default function ProductCard({ product }: ProductCardProps) {
  let imageUrl = "/images/placeholder.png";

  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string") {
      imageUrl = firstImage;
    } else if (typeof firstImage === "object" && firstImage !== null) {
      const imgObj = firstImage as unknown as { url: string };
      if (imgObj && imgObj.url && typeof imgObj.url === "string") {
        imageUrl = imgObj.url;
      }
    }
  }

  const price = extractNumberValue(product.price);
  const discount = product.discount
    ? extractNumberValue(product.discount)
    : null;
  const finalPrice = discount ? price * (1 - discount / 100) : price;

  return (
    <div className="group bg-card hover:bg-card/90 rounded-lg shadow-md dark:shadow-lg dark:shadow-primary/10 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border border-border hover:border-primary/20">
      <Link href={`/product/${product.slug}`} className="block h-full">
        {/* Badges above image */}
        <div className="p-2 sm:p-3 flex justify-between items-start gap-2 z-10">
          {product.isNewArrival && (
            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 shadow-sm">
              NEW
            </Badge>
          )}
          {discount && (
            <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 shadow-sm">
              {discount}% OFF
            </Badge>
          )}
        </div>

        {/* Product image container - adjusted height for better mobile display */}
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={false}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Limited offer badge kept in corner */}
          {product.isLimitedTimeOffer && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <Badge
                variant="outline"
                className="bg-orange-500/90 text-white border-orange-600 shadow-md text-xs px-2 py-0.5"
              >
                Limited Offer
              </Badge>
            </div>
          )}
        </div>

        {/* Product details - flexible height to accommodate content */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating stars - responsive size */}
          <div className="flex items-center mt-1 sm:mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    star <= Math.round(extractNumberValue(product.rating))
                      ? "text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              ({product.numReviews})
            </span>
          </div>

          {/* Price section - mobile friendly spacing */}
          <div className="mt-auto pt-1 sm:pt-2 flex flex-col">
            {discount ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="text-muted-foreground line-through text-xs sm:text-sm">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-1.5 py-0.5 rounded">
                    Save ${(price - finalPrice).toFixed(2)}
                  </span>
                </div>
                <span className="text-destructive font-bold text-base sm:text-lg mt-1">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-card-foreground text-base sm:text-lg">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {/* View Details button that appears on hover - more touch-friendly on mobile */}
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-full text-center text-xs sm:text-sm text-primary font-medium inline-block py-1 border-t border-primary/20">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
