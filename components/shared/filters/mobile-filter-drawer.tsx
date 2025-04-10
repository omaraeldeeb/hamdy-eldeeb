"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FilterIcon, Search, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Update props to match the exact structure returned by getAllCategoriesFromProducts
interface MobileFilterDrawerProps {
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

const MobileFilterDrawer = ({
  categories,
  brands = [],
  prices,
  ratings,
  currentCategory,
  currentBrand = "all",
  currentPrice,
  currentRating,
  baseUrl,
  query,
  sort,
  page,
}: MobileFilterDrawerProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

  // Get filter URL (same logic as in FilterSidebar)
  const getFilterUrl = ({
    c,
    b,
    p,
    r,
  }: {
    c?: string;
    b?: string;
    p?: string;
    r?: string;
  }) => {
    const params = new URLSearchParams();

    // Handle query parameter
    if (queryStr && queryStr !== "all") {
      params.append("q", queryStr);
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

  // Filter handlers
  const handleCategoryChange = (category: string) => {
    const url = getFilterUrl({ c: category });
    router.push(url);
    setOpen(false); // Close drawer after selection
  };

  const handleBrandChange = (brand: string) => {
    const url = getFilterUrl({ b: brand });
    router.push(url);
    setOpen(false);
  };

  const handlePriceChange = (price: string) => {
    const url = getFilterUrl({ p: price });
    router.push(url);
    setOpen(false);
  };

  const handleRatingChange = (rating: string) => {
    const url = getFilterUrl({ r: rating });
    router.push(url);
    setOpen(false);
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between dark:border-border dark:bg-card dark:text-card-foreground"
        >
          <span>Filters</span>
          <div className="flex items-center">
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                {activeFiltersCount}
              </span>
            )}
            <FilterIcon size={18} />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] dark:border-t dark:border-border dark:bg-card dark:text-card-foreground">
        <DrawerHeader>
          <DrawerTitle>Filter Products</DrawerTitle>
          <DrawerDescription className="dark:text-muted-foreground">
            Apply filters to narrow down your search results
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto pb-4">
          <Accordion
            type="multiple"
            defaultValue={["category", "brand", "price", "rating"]}
            className="w-full"
          >
            {/* Category filter - updated for hierarchy */}
            <AccordionItem value="category">
              <AccordionTrigger className="text-base font-medium py-2">
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

                  <ScrollArea className="h-52">
                    <div className="space-y-2 pr-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="m-category-all"
                          checked={categoryStr === "all" || categoryStr === ""}
                          onCheckedChange={() => handleCategoryChange("all")}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor="m-category-all"
                          className={`text-sm cursor-pointer ${
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
                        <div key={cat.id} className="space-y-2 mt-2">
                          {/* Parent category */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`m-category-${cat.category}`}
                              checked={categoryStr === cat.category}
                              onCheckedChange={() =>
                                handleCategoryChange(cat.category)
                              }
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={`m-category-${cat.category}`}
                              className={`text-sm cursor-pointer font-semibold ${
                                categoryStr === cat.category
                                  ? "text-primary"
                                  : ""
                              }`}
                            >
                              {cat.category}{" "}
                              {cat._count ? `(${cat._count})` : ""}
                            </label>
                          </div>

                          {/* Child categories (indented) */}
                          {cat.children && cat.children.length > 0 && (
                            <div className="pl-5 space-y-2 border-l border-border ml-1.5 my-1">
                              {cat.children
                                .filter((subCat) =>
                                  subCat.category
                                    .toLowerCase()
                                    .includes(categorySearch.toLowerCase())
                                )
                                .map((subCat) => (
                                  <div
                                    key={subCat.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`m-category-${subCat.category}`}
                                      checked={categoryStr === subCat.category}
                                      onCheckedChange={() =>
                                        handleCategoryChange(subCat.category)
                                      }
                                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label
                                      htmlFor={`m-category-${subCat.category}`}
                                      className={`text-sm cursor-pointer ${
                                        categoryStr === subCat.category
                                          ? "font-medium text-primary"
                                          : ""
                                      }`}
                                    >
                                      {subCat.category}{" "}
                                      {subCat._count
                                        ? `(${subCat._count})`
                                        : ""}
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
                  </ScrollArea>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Brand filter - new */}
            {brands.length > 0 && (
              <AccordionItem value="brand">
                <AccordionTrigger className="text-base font-medium py-2">
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

                    <ScrollArea className="h-52">
                      <div className="space-y-2 pr-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="m-brand-all"
                            checked={brandStr === "all" || brandStr === ""}
                            onCheckedChange={() => handleBrandChange("all")}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor="m-brand-all"
                            className={`text-sm cursor-pointer ${
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
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`m-brand-${b.brand}`}
                              checked={brandStr === b.brand}
                              onCheckedChange={() => handleBrandChange(b.brand)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={`m-brand-${b.brand}`}
                              className={`text-sm cursor-pointer ${
                                brandStr === b.brand
                                  ? "font-medium text-primary"
                                  : ""
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
                    </ScrollArea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Price filter */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-base font-medium py-2">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mobile-price-all"
                      checked={priceStr === "all" || priceStr === ""}
                      onCheckedChange={() => handlePriceChange("all")}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="mobile-price-all"
                      className={`text-sm cursor-pointer ${
                        priceStr === "all" || priceStr === ""
                          ? "font-medium text-primary"
                          : ""
                      }`}
                    >
                      Any Price
                    </label>
                  </div>

                  {prices.map((p) => (
                    <div key={p.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-price-${p.value}`}
                        checked={priceStr === p.value}
                        onCheckedChange={() => handlePriceChange(p.value)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={`mobile-price-${p.value}`}
                        className={`text-sm cursor-pointer ${
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
            <AccordionItem value="rating">
              <AccordionTrigger className="text-base font-medium py-2">
                Customer Ratings
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mobile-rating-all"
                      checked={ratingStr === "all" || ratingStr === ""}
                      onCheckedChange={() => handleRatingChange("all")}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="mobile-rating-all"
                      className={`text-sm cursor-pointer ${
                        ratingStr === "all" || ratingStr === ""
                          ? "font-medium text-primary"
                          : ""
                      }`}
                    >
                      Any Rating
                    </label>
                  </div>

                  {ratings.map((r) => (
                    <div key={r} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-rating-${r}`}
                        checked={ratingStr === r.toString()}
                        onCheckedChange={() => handleRatingChange(r.toString())}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={`mobile-rating-${r}`}
                        className={`text-sm cursor-pointer flex items-center ${
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
                            <Star
                              key={i + r}
                              className="h-4 w-4 text-gray-300"
                            />
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
        <DrawerFooter className="border-t dark:border-border">
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="dark:border-border dark:bg-card dark:text-card-foreground dark:hover:bg-accent"
              >
                Cancel
              </Button>
            </DrawerClose>
            {activeFiltersCount > 0 && (
              <Button
                asChild
                variant="ghost"
                className="text-destructive dark:text-destructive dark:hover:bg-accent"
              >
                <Link href={baseUrl}>Clear All</Link>
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileFilterDrawer;
