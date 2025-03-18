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

interface FilterSidebarProps {
  categories: { category: string }[];
  prices: { name: string; value: string }[];
  ratings: number[];
  currentCategory: string;
  currentPrice: string;
  currentRating: string;
  baseUrl: string;
  query: string;
  sort: string;
  page: string;
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

    // Only update the filters that are explicitly passed
    // otherwise preserve the current value
    const newQuery = q !== undefined ? q : query;
    const newCategory = c !== undefined ? c : currentCategory;
    const newPrice = p !== undefined ? p : currentPrice;
    const newRating = r !== undefined ? r : currentRating;

    if (newQuery !== "all" && newQuery !== "") params.append("q", newQuery);
    if (newCategory !== "all" && newCategory !== "")
      params.append("category", newCategory);
    if (newPrice !== "all" && newPrice !== "") params.append("price", newPrice);
    if (newRating !== "all" && newRating !== "")
      params.append("rating", newRating);
    if (sort !== "newest") params.append("sort", sort);
    if (page !== "1") params.append("page", page);

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
    query !== "all" && query !== "",
    currentCategory !== "all" && currentCategory !== "",
    currentPrice !== "all" && currentPrice !== "",
    currentRating !== "all" && currentRating !== "",
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
                  checked={currentCategory === "all" || currentCategory === ""}
                  onCheckedChange={() => handleCategoryChange("all")}
                />
                <label
                  htmlFor="category-all"
                  className={`text-sm cursor-pointer ${
                    currentCategory === "all" || currentCategory === ""
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
                    checked={currentCategory === cat.category}
                    onCheckedChange={() => handleCategoryChange(cat.category)}
                  />
                  <label
                    htmlFor={`category-${cat.category}`}
                    className={`text-sm cursor-pointer ${
                      currentCategory === cat.category ? "font-bold" : ""
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
                  checked={currentPrice === "all"}
                  onCheckedChange={() => handlePriceChange("all")}
                />
                <label
                  htmlFor="price-all"
                  className={`text-sm cursor-pointer ${
                    currentPrice === "all" ? "font-bold" : ""
                  }`}
                >
                  Any
                </label>
              </div>

              {prices.map((p) => (
                <div key={p.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${p.value}`}
                    checked={currentPrice === p.value}
                    onCheckedChange={() => handlePriceChange(p.value)}
                  />
                  <label
                    htmlFor={`price-${p.value}`}
                    className={`text-sm cursor-pointer ${
                      currentPrice === p.value ? "font-bold" : ""
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
                  checked={currentRating === "all"}
                  onCheckedChange={() => handleRatingChange("all")}
                />
                <label
                  htmlFor="rating-all"
                  className={`text-sm cursor-pointer ${
                    currentRating === "all" ? "font-bold" : ""
                  }`}
                >
                  Any
                </label>
              </div>

              {ratings.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${r}`}
                    checked={currentRating === r.toString()}
                    onCheckedChange={() => handleRatingChange(r.toString())}
                  />
                  <label
                    htmlFor={`rating-${r}`}
                    className={`text-sm cursor-pointer flex items-center ${
                      currentRating === r.toString() ? "font-bold" : ""
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
