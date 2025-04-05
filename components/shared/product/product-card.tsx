import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

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
  // Last resort - try to convert to string and parse
  return parseFloat(String(value));
}

export default function ProductCard({ product }: ProductCardProps) {
  // Get the first image or use a placeholder
  let imageUrl = "/images/placeholder.png";

  // Process images safely with proper type assertions
  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images[0];

    // If the image is a string, use it directly
    if (typeof firstImage === "string") {
      imageUrl = firstImage;
    }
    // If the image is an object with a url property
    else if (typeof firstImage === "object" && firstImage !== null) {
      // The type of ProductImage is known to have a url property
      // Force the type assertion to ProductImage to overcome the 'never' type issue
      const imgObj = firstImage as unknown as { url: string };
      if (imgObj && imgObj.url && typeof imgObj.url === "string") {
        imageUrl = imgObj.url;
      }
    }
  }

  // Convert price to number using our utility function
  const price = extractNumberValue(product.price);

  // Convert discount to number if it exists
  const discount = product.discount
    ? extractNumberValue(product.discount)
    : null;

  // Calculate the discounted price if there's a discount
  const finalPrice = discount ? price * (1 - discount / 100) : price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          {discount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discount}% OFF
            </div>
          )}
          {product.isNewArrival && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              NEW
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{product.name}</h3>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(extractNumberValue(product.rating))
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.numReviews})
            </span>
          </div>
          <div className="mt-2">
            {discount ? (
              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  <span className="text-gray-500 line-through text-sm mr-2">
                    Original: ${price.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-700 text-xs px-1 rounded">
                    Save ${(price - finalPrice).toFixed(2)}
                  </span>
                </div>
                <span className="text-red-600 font-bold text-lg">
                  Now: ${finalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-lg">${price.toFixed(2)}</span>
            )}

            {product.isLimitedTimeOffer && (
              <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-800 py-1 px-2 rounded">
                Limited Time Offer
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
