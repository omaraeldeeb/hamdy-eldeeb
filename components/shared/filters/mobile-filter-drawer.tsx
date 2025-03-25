"use client";

import React from "react";
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
import { FilterIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// Update the props type definition
interface MobileFilterDrawerProps {
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

const MobileFilterDrawer = ({
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
}: MobileFilterDrawerProps) => {
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

  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // Get filter URL (same logic as in FilterSidebar)
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

  // Filter handlers
  const handleCategoryChange = (category: string) => {
    const url = getFilterUrl({ c: category });
    router.push(url);
    setOpen(false); // Close drawer after selection
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

  // Count active filters
  const activeFiltersCount = [
    queryStr !== "all" && queryStr !== "",
    categoryStr !== "all" && categoryStr !== "",
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
      <DrawerContent className="max-h-[85vh] dark:border-t dark:border-border dark:bg-card dark:text-card-foreground">
        <DrawerHeader>
          <DrawerTitle>Filter Products</DrawerTitle>
          <DrawerDescription className="dark:text-muted-foreground">
            Apply filters to narrow down your search results
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto pb-4">
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
                      id="mobile-category-all"
                      checked={categoryStr === "all" || categoryStr === ""}
                      onCheckedChange={() => handleCategoryChange("all")}
                    />
                    <label
                      htmlFor="mobile-category-all"
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
                    <div
                      key={cat.category}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-category-${cat.category}`}
                        checked={categoryStr === cat.category}
                        onCheckedChange={() =>
                          handleCategoryChange(cat.category)
                        }
                      />
                      <label
                        htmlFor={`mobile-category-${cat.category}`}
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
                      id="mobile-price-all"
                      checked={priceStr === "all"}
                      onCheckedChange={() => handlePriceChange("all")}
                    />
                    <label
                      htmlFor="mobile-price-all"
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
                        id={`mobile-price-${p.value}`}
                        checked={priceStr === p.value}
                        onCheckedChange={() => handlePriceChange(p.value)}
                      />
                      <label
                        htmlFor={`mobile-price-${p.value}`}
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
                      id="mobile-rating-all"
                      checked={ratingStr === "all"}
                      onCheckedChange={() => handleRatingChange("all")}
                    />
                    <label
                      htmlFor="mobile-rating-all"
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
                        id={`mobile-rating-${r}`}
                        checked={ratingStr === r.toString()}
                        onCheckedChange={() => handleRatingChange(r.toString())}
                      />
                      <label
                        htmlFor={`mobile-rating-${r}`}
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
