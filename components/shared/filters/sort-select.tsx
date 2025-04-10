"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  sortOrders: { label: string; value: string }[];
  currentSort: string | string[];
  baseUrl: string;
  query: string | string[];
  category: string | string[];
  brand?: string | string[]; // Add brand parameter with optional type
  price: string | string[];
  rating: string | string[];
  page: string | string[];
}

const SortSelect: React.FC<SortSelectProps> = ({
  sortOrders,
  currentSort,
  baseUrl,
  query,
  category,
  price,
  rating,
  page,
}) => {
  const router = useRouter();

  const sortStr = Array.isArray(currentSort) ? currentSort[0] : currentSort;
  const queryStr = Array.isArray(query) ? query[0] : query;
  const categoryStr = Array.isArray(category) ? category[0] : category;
  const priceStr = Array.isArray(price) ? price[0] : price;
  const ratingStr = Array.isArray(rating) ? rating[0] : rating;
  const pageStr = Array.isArray(page) ? page[0] : page;

  const getFilterUrl = (sort: string) => {
    const params = new URLSearchParams();

    // Handle query parameter
    if (queryStr && queryStr !== "all") {
      params.append("q", queryStr);
    }

    // Handle category parameter
    if (categoryStr && categoryStr !== "all") {
      params.append("category", categoryStr);
    }

    // Handle price parameter
    if (priceStr && priceStr !== "all") {
      params.append("price", priceStr);
    }

    // Handle rating parameter
    if (ratingStr && ratingStr !== "all") {
      params.append("rating", ratingStr);
    }

    // Handle sort parameter
    if (sort && sort !== "newest") {
      params.append("sort", sort);
    }

    // Handle page parameter
    if (pageStr && pageStr !== "1") {
      params.append("page", pageStr);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const handleSortChange = (value: string) => {
    const url = getFilterUrl(value);
    router.push(url);
  };

  return (
    <div className="flex items-center space-x-2 min-w-[180px]">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Sort by:
      </span>
      <Select value={sortStr} onValueChange={handleSortChange}>
        <SelectTrigger className="dark:border-border dark:bg-card dark:text-card-foreground">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="dark:border-border dark:bg-card dark:text-card-foreground">
          {sortOrders.map((order) => (
            <SelectItem
              key={order.value}
              value={order.value}
              className="dark:focus:bg-accent dark:focus:text-accent-foreground"
            >
              {order.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelect;
