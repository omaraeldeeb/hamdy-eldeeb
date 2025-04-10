"use client";

import React, { useState } from "react";
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
import { FilterX, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

// Update the props type definition to match the exact structure returned by getAllCategoriesFromProducts
interface FilterSidebarProps {
  categories: {
    category: string;
    _count: number;
    id: string;
    level: number;
    isParent: boolean;
    children: {
      category: string;
      _count: number;
      id: string;
      level: number;
      isParent: boolean;
      parentId: string | null;
    }[];
  }[];
  brands?: { brand: string; _count?: number }[];
  prices: { value: string; name: string }[];
  ratings: number[];
  currentCategory: string | string[];
  currentBrand?: string | string[];
  currentPrice: string | string[];
  currentRating: string | string[];
  baseUrl: string;
  query: string | string[];
  sort: string | string[];
  page: string | string[];
}

const FilterSidebar = ({
  categories,
  brands = [], // Default to empty array
  prices,
  ratings,
  currentCategory,
  currentBrand = "all", // Default to "all"
  currentPrice,
  currentRating,
  baseUrl,
  query,
  sort,
  page,
}: FilterSidebarProps) => {
  const router = useRouter();

  // State for search inputs
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Convert string[] to string where needed
  const categoryStr = Array.isArray(currentCategory)
    ? currentCategory[0]
    : currentCategory;
  const brandStr = Array.isArray(currentBrand) ? currentBrand[0] : currentBrand;
  const priceStr = Array.isArray(currentPrice) ? currentPrice[0] : currentPrice;
  const ratingStr = Array.isArray(currentRating)
    ? currentRating[0]
    : currentRating;
  const queryStr = Array.isArray(query) ? query[0] : query;
  const sortStr = Array.isArray(sort) ? sort[0] : sort;
  const pageStr = Array.isArray(page) ? page[0] : page;

  // Modified getFilterUrl to include brand
  const getFilterUrl = ({
    c,
    b,
    p,
    r,
    q,
  }: {
    c?: string;
    b?: string;
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

    // Handle brand parameter
    const newBrand = b !== undefined ? b : brandStr;
    if (newBrand && newBrand !== "all") {
      params.append("brand", newBrand);
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

  const handleBrandChange = (brand: string) => {
    const url = getFilterUrl({ b: brand });
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

  // Filter categories and brands based on search
  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Count active filters
  const activeFiltersCount = [
    queryStr !== "all" && queryStr !== "",
    categoryStr !== "all" && categoryStr !== "",
    brandStr !== "all" && brandStr !== "",
    priceStr !== "all" && priceStr !== "",
    ratingStr !== "all" && ratingStr !== "",
  ].filter(Boolean).length;

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 h-fit sticky top-24 hidden lg:block border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Filters</h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Link href={baseUrl}>
              <FilterX size={16} />
              <span>Clear all</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence>
            {categoryStr !== "all" && categoryStr !== "" && (
              <motion.div
                key="category-badge"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  {categoryStr}
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ✕
                  </button>
                </Badge>
              </motion.div>
            )}
            {brandStr !== "all" && brandStr !== "" && (
              <motion.div
                key="brand-badge"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  {brandStr}
                  <button
                    onClick={() => handleBrandChange("all")}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ✕
                  </button>
                </Badge>
              </motion.div>
            )}
            {priceStr !== "all" && priceStr !== "" && (
              <motion.div
                key="price-badge"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  {prices.find((p) => p.value === priceStr)?.name || priceStr}
                  <button
                    onClick={() => handlePriceChange("all")}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ✕
                  </button>
                </Badge>
              </motion.div>
            )}
            {ratingStr !== "all" && ratingStr !== "" && (
              <motion.div
                key="rating-badge"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  {ratingStr}+ ★
                  <button
                    onClick={() => handleRatingChange("all")}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ✕
                  </button>
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={["category", "brand", "price", "rating"]}
        className="w-full"
      >
        {/* Category filter - updated to show hierarchy */}
        <AccordionItem value="category" className="border-b border-border">
          <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8 text-sm py-2 h-9 bg-muted/50"
                />
              </div>

              <div className="max-h-60 overflow-y-auto pr-2 space-y-2 pt-2">
                <div className="flex items-center space-x-2 group">
                  <Checkbox
                    id="category-all"
                    checked={categoryStr === "all" || categoryStr === ""}
                    onCheckedChange={() => handleCategoryChange("all")}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="category-all"
                    className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                      categoryStr === "all" || categoryStr === ""
                        ? "font-medium text-primary"
                        : ""
                    }`}
                  >
                    Any Category
                  </label>
                </div>

                {/* Show all categories in a hierarchical structure */}
                {filteredCategories.map((cat) => (
                  <div key={cat.id || cat.category} className="space-y-2">
                    {/* Parent category */}
                    <div className="flex items-center space-x-2 group">
                      <Checkbox
                        id={`category-${cat.category}`}
                        checked={categoryStr === cat.category}
                        onCheckedChange={() =>
                          handleCategoryChange(cat.category)
                        }
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={`category-${cat.category}`}
                        className={`text-sm cursor-pointer group-hover:text-primary transition-colors font-semibold ${
                          categoryStr === cat.category ? "text-primary" : ""
                        }`}
                      >
                        {cat.category} {cat._count ? `(${cat._count})` : ""}
                      </label>
                    </div>

                    {/* Child categories (indented) */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="pl-6 space-y-2 border-l border-border ml-1.5 my-1">
                        {cat.children
                          .filter((subCat) =>
                            subCat.category
                              .toLowerCase()
                              .includes(categorySearch.toLowerCase())
                          )
                          .map((subCat) => (
                            <div
                              key={subCat.id || subCat.category}
                              className="flex items-center space-x-2 group"
                            >
                              <Checkbox
                                id={`category-${subCat.category}`}
                                checked={categoryStr === subCat.category}
                                onCheckedChange={() =>
                                  handleCategoryChange(subCat.category)
                                }
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`category-${subCat.category}`}
                                className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                                  categoryStr === subCat.category
                                    ? "font-medium text-primary"
                                    : ""
                                }`}
                              >
                                {subCat.category}{" "}
                                {subCat._count ? `(${subCat._count})` : ""}
                              </label>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

                {categorySearch && filteredCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No categories match your search
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand filter */}
        {brands.length > 0 && (
          <AccordionItem value="brand" className="border-b border-border">
            <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
              Brand
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="pl-8 text-sm py-2 h-9 bg-muted/50"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 pt-2">
                  <div className="flex items-center space-x-2 group">
                    <Checkbox
                      id="brand-all"
                      checked={brandStr === "all" || brandStr === ""}
                      onCheckedChange={() => handleBrandChange("all")}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="brand-all"
                      className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                        brandStr === "all" || brandStr === ""
                          ? "font-medium text-primary"
                          : ""
                      }`}
                    >
                      Any Brand
                    </label>
                  </div>

                  {filteredBrands.map((b) => (
                    <div
                      key={b.brand}
                      className="flex items-center space-x-2 group"
                    >
                      <Checkbox
                        id={`brand-${b.brand}`}
                        checked={brandStr === b.brand}
                        onCheckedChange={() => handleBrandChange(b.brand)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={`brand-${b.brand}`}
                        className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                          brandStr === b.brand ? "font-medium text-primary" : ""
                        }`}
                      >
                        {b.brand}
                      </label>
                    </div>
                  ))}

                  {brandSearch && filteredBrands.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-2">
                      No brands match your search
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price filter */}
        <AccordionItem value="price" className="border-b border-border">
          <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2 group">
                <Checkbox
                  id="price-all"
                  checked={priceStr === "all" || priceStr === ""}
                  onCheckedChange={() => handlePriceChange("all")}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="price-all"
                  className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                    priceStr === "all" || priceStr === ""
                      ? "font-medium text-primary"
                      : ""
                  }`}
                >
                  Any Price
                </label>
              </div>

              {prices.map((p) => (
                <div
                  key={p.value}
                  className="flex items-center space-x-2 group"
                >
                  <Checkbox
                    id={`price-${p.value}`}
                    checked={priceStr === p.value}
                    onCheckedChange={() => handlePriceChange(p.value)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={`price-${p.value}`}
                    className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                      priceStr === p.value ? "font-medium text-primary" : ""
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
        <AccordionItem value="rating" className="border-b border-border">
          <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
            Customer Ratings
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2 group">
                <Checkbox
                  id="rating-all"
                  checked={ratingStr === "all" || ratingStr === ""}
                  onCheckedChange={() => handleRatingChange("all")}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="rating-all"
                  className={`text-sm cursor-pointer group-hover:text-primary transition-colors ${
                    ratingStr === "all" || ratingStr === ""
                      ? "font-medium text-primary"
                      : ""
                  }`}
                >
                  Any Rating
                </label>
              </div>

              {ratings.map((r) => (
                <div key={r} className="flex items-center space-x-2 group">
                  <Checkbox
                    id={`rating-${r}`}
                    checked={ratingStr === r.toString()}
                    onCheckedChange={() => handleRatingChange(r.toString())}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={`rating-${r}`}
                    className={`text-sm cursor-pointer flex items-center group-hover:text-primary transition-colors ${
                      ratingStr === r.toString()
                        ? "font-medium text-primary"
                        : ""
                    }`}
                  >
                    <div className="flex mr-2">
                      {Array.from({ length: r }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      {Array.from({ length: 5 - r }).map((_, i) => (
                        <Star key={i + r} className="h-4 w-4 text-gray-300" />
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
