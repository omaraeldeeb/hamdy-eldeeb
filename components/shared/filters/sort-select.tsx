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
  currentSort: string;
  baseUrl: string;
  query: string;
  category: string;
  price: string;
  rating: string;
  page: string;
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

  const getFilterUrl = (sort: string) => {
    const params = new URLSearchParams();

    if (query !== "all" && query !== "") params.append("q", query);
    if (category !== "all" && category !== "")
      params.append("category", category);
    if (price !== "all" && price !== "") params.append("price", price);
    if (rating !== "all" && rating !== "") params.append("rating", rating);
    if (sort !== "newest") params.append("sort", sort);
    if (page !== "1") params.append("page", page);

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
      <Select value={currentSort} onValueChange={handleSortChange}>
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
