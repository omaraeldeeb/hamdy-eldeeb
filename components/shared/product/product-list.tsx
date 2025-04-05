"use client";
import React from "react";
import ProductCard from "./product-card";
import SectionTitle from "../section-title";
import { Product } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductListProps {
  data: Product[];
  title?: string;
  limit?: number;
  carousel?: boolean;
}

export default function ProductList({
  data,
  title,
  limit = 4,
  carousel = false,
}: ProductListProps) {
  // Limit the number of products to display
  const limitedData = data.slice(0, limit);

  if (carousel) {
    return (
      <section className="container mx-auto my-12 px-4">
        {title && <SectionTitle title={title} />}
        <div className="mt-8">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="product-carousel"
          >
            {limitedData.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto my-12 px-4">
      {title && <SectionTitle title={title} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {limitedData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
