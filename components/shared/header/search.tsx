import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/product.actions";
import { SearchIcon } from "lucide-react";

const Search = async () => {
  const categories = await getAllCategories();
  return (
    <form action="/search" method="GET">
      <div className="flex w-full items-center space-x-1 sm:space-x-2 max-w-[280px] sm:max-w-sm">
        <Select name="category">
          <SelectTrigger className="w-[80px] sm:w-[180px] text-xs sm:text-base">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="All" value="all">
              All
            </SelectItem>
            {categories.map((x) => (
              <SelectItem key={x.category} value={x.category}>
                {x.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="q"
          type="text"
          placeholder="Search..."
          className="w-[120px] sm:w-auto md:w-[100px] lg:w-[300px] text-xs sm:text-base"
        />
        <Button size="sm" className="sm:size-default px-1 sm:px-3">
          <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </form>
  );
};

export default Search;
