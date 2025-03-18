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

const SortSelect = ({
  sortOrders,
  currentSort,
  baseUrl,
  query,
  category,
  price,
  rating,
  page,
}: SortSelectProps) => {
  const router = useRouter();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams();

    if (query !== "all") params.append("q", query);
    if (category !== "all") params.append("category", category);
    if (price !== "all") params.append("price", price);
    if (rating !== "all") params.append("rating", rating);
    if (value !== "newest") params.append("sort", value);
    if (page !== "1") params.append("page", page);

    const queryString = params.toString();
    router.push(`${baseUrl}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm whitespace-nowrap">Sort by:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort order" />
        </SelectTrigger>
        <SelectContent>
          {sortOrders.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelect;
