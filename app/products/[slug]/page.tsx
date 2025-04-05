import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { convertToPlainObject } from "@/lib/utils";
import { ProductImage } from "@/types";
import AddToCartButton from "@/components/shared/product/add-to-cart-button";

interface ProductDetailsProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsProps) {
  const { slug } = params;
  const productData = await getProductBySlug(slug);

  if (!productData) {
    return notFound();
  }

  // Convert to plain object to handle Decimal values
  const product = convertToPlainObject(productData);

  // Get the first image or use a placeholder
  let mainImage = "/images/placeholder.png";
  let productImages: ProductImage[] = [];

  // Process images safely to avoid type errors
  if (product.images && Array.isArray(product.images)) {
    // Create properly typed image objects
    productImages = product.images.map((img, index) => {
      // Handle case where image is just a string URL
      if (typeof img === "string") {
        return {
          id: `img-${index}`,
          url: img,
          alt: `Product image ${index + 1}`,
          productId: product.id,
          type: null,
          position: index,
          createdAt: new Date(),
        };
      }

      // Handle case where image is an object with url property
      if (typeof img === "object" && img !== null && "url" in img) {
        return {
          id: img.id || `img-${index}`,
          url: img.url,
          alt: img.alt || `Product image ${index + 1}`,
          productId: product.id,
          type: img.type || null,
          position: typeof img.position === "number" ? img.position : index,
          createdAt: img.createdAt || new Date(),
        };
      }

      // Fallback for unexpected format
      return {
        id: `img-fallback-${index}`,
        url: "/images/placeholder.png",
        alt: `Product image ${index + 1}`,
        productId: product.id,
        type: null,
        position: index,
        createdAt: new Date(),
      };
    });

    // Set main image if we have images
    if (productImages.length > 0) {
      mainImage = productImages[0].url;
    }
  }

  // Convert price to number
  const price = Number(product.price);
  const discount = product.discount ? Number(product.discount) : null;
  const finalPrice = discount ? price * (1 - discount / 100) : price;
  const savings = discount ? price - finalPrice : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <div className="relative h-[400px] w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discount && (
              <div className="absolute top-4 right-4 bg-red-500 text-white font-bold py-2 px-4 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Image Gallery */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {productImages.map((image, index) => (
                <div
                  key={image.id || `img-${index}`}
                  className="relative h-20 w-full rounded-md overflow-hidden cursor-pointer border-2 hover:border-primary"
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Category & Brand */}
          <div className="mb-4 text-sm">
            <span className="text-gray-500">Category: </span>
            <span className="text-primary font-medium">
              {product.category.name}
            </span>
            <span className="mx-2">|</span>
            <span className="text-gray-500">Brand: </span>
            <span className="text-primary font-medium">
              {product.brand.name}
            </span>
          </div>

          {/* Ratings */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(product.rating))
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
            <span className="text-gray-600 ml-2">
              {Number(product.rating).toFixed(1)} ({product.numReviews} reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            {discount ? (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 line-through text-lg">
                    Original price: ${price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold text-red-600">
                    Sale price: ${finalPrice.toFixed(2)}
                  </span>
                  <span className="ml-3 bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                    You save: ${savings.toFixed(2)} ({discount}%)
                  </span>
                </div>
                {product.isLimitedTimeOffer && (
                  <div className="mt-2 inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    Limited Time Offer
                  </div>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span className="text-gray-700">Availability: </span>
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                In stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mb-6">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={finalPrice}
              image={mainImage}
              slug={product.slug}
              stock={product.stock}
            />
          </div>

          {/* Special Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.isNewArrival && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                New Arrival
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Featured Product
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <div className="prose text-gray-700">{product.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
