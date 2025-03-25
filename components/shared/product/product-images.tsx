"use client";
import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";

interface ProductImagesProps {
  images: ProductImage[];
}

export default function ProductImages({ images }: ProductImagesProps) {
  const [mainImage, setMainImage] = useState(images[0]?.url || "");

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
        No image available
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-lg bg-gray-100 relative aspect-square">
        <Image
          src={mainImage}
          alt="Main product image"
          fill
          className="w-full h-full object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-auto py-1">
          {images.map((image, idx) => (
            <div
              key={idx}
              className={`relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${
                image.url === mainImage
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onClick={() => setMainImage(image.url)}
            >
              <Image
                src={image.url}
                alt={image.alt || `Product thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
