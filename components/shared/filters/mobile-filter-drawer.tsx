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

interface MobileFilterDrawerProps {
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

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
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
}) => {
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
    query !== "all" && query !== "",
    currentCategory !== "all" && currentCategory !== "",
    currentPrice !== "all" && currentPrice !== "",
    currentRating !== "all" && currentRating !== "",
  ].filter(Boolean).length;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between">
          <span>Filters</span>
          <div className="flex items-center">
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                {activeFiltersCount}
              </span>
            )}
            <FilterIcon size={18} />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Filter Products</DrawerTitle>
          <DrawerDescription>
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
                      checked={
                        currentCategory === "all" || currentCategory === ""
                      }
                      onCheckedChange={() => handleCategoryChange("all")}
                    />
                    <label
                      htmlFor="mobile-category-all"
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
                    <div
                      key={cat.category}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-category-${cat.category}`}
                        checked={currentCategory === cat.category}
                        onCheckedChange={() =>
                          handleCategoryChange(cat.category)
                        }
                      />
                      <label
                        htmlFor={`mobile-category-${cat.category}`}
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
                      id="mobile-price-all"
                      checked={currentPrice === "all"}
                      onCheckedChange={() => handlePriceChange("all")}
                    />
                    <label
                      htmlFor="mobile-price-all"
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
                        id={`mobile-price-${p.value}`}
                        checked={currentPrice === p.value}
                        onCheckedChange={() => handlePriceChange(p.value)}
                      />
                      <label
                        htmlFor={`mobile-price-${p.value}`}
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
                      id="mobile-rating-all"
                      checked={currentRating === "all"}
                      onCheckedChange={() => handleRatingChange("all")}
                    />
                    <label
                      htmlFor="mobile-rating-all"
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
                        id={`mobile-rating-${r}`}
                        checked={currentRating === r.toString()}
                        onCheckedChange={() => handleRatingChange(r.toString())}
                      />
                      <label
                        htmlFor={`mobile-rating-${r}`}
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
        <DrawerFooter className="border-t">
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            {activeFiltersCount > 0 && (
              <Button asChild variant="ghost" className="text-destructive">
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
