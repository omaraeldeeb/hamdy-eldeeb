"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

// Update the props type definition to handle string or string[] types
interface FilterSidebarProps {
  categories: { category: string }[];
  prices: { value: string; name: string }[];
  ratings: number[];
  currentCategory: string | string[];
  currentPrice: string | string[];
  currentRating: string | string[];
  baseUrl: string;
  query: string | string[];
  sort: string | string[];
  page: string | string[];
}

const FilterSidebar = ({
  categories,
  prices,
  ratings,
  currentCategory,
  currentPrice,
  currentRating,
  baseUrl,
  query,
  sort,
  page,
}: FilterSidebarProps) => {
  const router = useRouter();

  // Convert string[] to string where needed
  const categoryStr = Array.isArray(currentCategory)
    ? currentCategory[0]
    : currentCategory;
  const priceStr = Array.isArray(currentPrice) ? currentPrice[0] : currentPrice;
  const ratingStr = Array.isArray(currentRating)
    ? currentRating[0]
    : currentRating;
  const queryStr = Array.isArray(query) ? query[0] : query;
  const sortStr = Array.isArray(sort) ? sort[0] : sort;
  const pageStr = Array.isArray(page) ? page[0] : page;

  // Modified getFilterUrl to preserve existing filters
  const getFilterUrl = ({
    c,
    p,
    r,
    q,
  }: {
    c?: string;
    p?: string;
    r?: string;
    q?: string;
  }) => {
    const params = new URLSearchParams();

    // Handle query parameter
    const newQuery = q !== undefined ? q : queryStr;
    if (newQuery && newQuery !== "all") {
      params.append("q", newQuery);
    }

    // Handle category parameter
    const newCategory = c !== undefined ? c : categoryStr;
    if (newCategory && newCategory !== "all") {
      params.append("category", newCategory);
    }

    // Handle price parameter
    const newPrice = p !== undefined ? p : priceStr;
    if (newPrice && newPrice !== "all") {
      params.append("price", newPrice);
    }

    // Handle rating parameter
    const newRating = r !== undefined ? r : ratingStr;
    if (newRating && newRating !== "all") {
      params.append("rating", newRating);
    }

    // Handle sort parameter
    if (sortStr && sortStr !== "newest") {
      params.append("sort", sortStr);
    }

    // Handle page parameter
    if (pageStr && pageStr !== "1") {
      params.append("page", pageStr);
    }

    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  // These handlers now only update one filter at a time
  const handleCategoryChange = (category: string) => {
    const url = getFilterUrl({ c: category });
    router.push(url);
  };

  const handlePriceChange = (price: string) => {
    const url = getFilterUrl({ p: price });
    router.push(url);
  };

  const handleRatingChange = (rating: string) => {
    const url = getFilterUrl({ r: rating });
    router.push(url);
  };

  // Count active filters
  const activeFiltersCount = [
    queryStr !== "all" && queryStr !== "",
    categoryStr !== "all" && categoryStr !== "",
    priceStr !== "all" && priceStr !== "",
    ratingStr !== "all" && ratingStr !== "",
  ].filter(Boolean).length;

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm p-4 h-fit sticky top-24 hidden lg:block border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Filters</h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-1 text-muted-foreground"
          >
            <Link href={baseUrl}>
              <FilterX size={16} />
              <span>Clear all</span>
            </Link>
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["category", "price", "rating"]}
        className="w-full"
      >
        {/* Category filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-medium py-2">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-all"
                  checked={categoryStr === "all" || categoryStr === ""}
                  onCheckedChange={() => handleCategoryChange("all")}
                />
                <label
                  htmlFor="category-all"
                  className={`text-sm cursor-pointer ${
                    categoryStr === "all" || categoryStr === ""
                      ? "font-bold"
                      : ""
                  }`}
                >
                  Any
                </label>
              </div>

              {categories.map((cat) => (
                <div key={cat.category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${cat.category}`}
                    checked={categoryStr === cat.category}
                    onCheckedChange={() => handleCategoryChange(cat.category)}
                  />
                  <label
                    htmlFor={`category-${cat.category}`}
                    className={`text-sm cursor-pointer ${
                      categoryStr === cat.category ? "font-bold" : ""
                    }`}
                  >
                    {cat.category}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium py-2">
            Price
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price-all"
                  checked={priceStr === "all"}
                  onCheckedChange={() => handlePriceChange("all")}
                />
                <label
                  htmlFor="price-all"
                  className={`text-sm cursor-pointer ${
                    priceStr === "all" ? "font-bold" : ""
                  }`}
                >
                  Any
                </label>
              </div>

              {prices.map((p) => (
                <div key={p.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${p.value}`}
                    checked={priceStr === p.value}
                    onCheckedChange={() => handlePriceChange(p.value)}
                  />
                  <label
                    htmlFor={`price-${p.value}`}
                    className={`text-sm cursor-pointer ${
                      priceStr === p.value ? "font-bold" : ""
                    }`}
                  >
                    {p.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating filter */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-base font-medium py-2">
            Customer Ratings
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rating-all"
                  checked={ratingStr === "all"}
                  onCheckedChange={() => handleRatingChange("all")}
                />
                <label
                  htmlFor="rating-all"
                  className={`text-sm cursor-pointer ${
                    ratingStr === "all" ? "font-bold" : ""
                  }`}
                >
                  Any
                </label>
              </div>

              {ratings.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${r}`}
                    checked={ratingStr === r.toString()}
                    onCheckedChange={() => handleRatingChange(r.toString())}
                  />
                  <label
                    htmlFor={`rating-${r}`}
                    className={`text-sm cursor-pointer flex items-center ${
                      ratingStr === r.toString() ? "font-bold" : ""
                    }`}
                  >
                    <div className="flex mr-1">
                      {Array.from({ length: r }).map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                    </div>
                    & up
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterSidebar;
