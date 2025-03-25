"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  category: string;
}

interface SearchProps {
  categories: Category[];
}

const Search = ({ categories }: SearchProps) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // When user clicks outside the dropdown, close it
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/search?category=${encodeURIComponent(categoryName)}`);
    setShowDropdown(false);
  };

  const handleSearchIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the document click event from firing
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="w-full max-w-xl relative">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pr-10 min-w-[200px]"
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
          <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSearchIconClick}
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="text-sm font-medium py-2 px-4 text-muted-foreground">
                Categories
              </div>
              {categories.map((cat) => (
                <DropdownMenuItem
                  key={cat.category}
                  onClick={() => handleCategoryClick(cat.category)}
                >
                  {cat.category}
                </DropdownMenuItem>
              ))}
              <div className="text-xs text-muted-foreground mt-2 py-2 px-4 border-t">
                Press Enter to search for products
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </form>
    </div>
  );
};

export default Search;
