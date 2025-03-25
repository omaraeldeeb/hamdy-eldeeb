"use client";

import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteCategory } from "@/lib/actions/category.actions";
import { toast } from "sonner";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CategoriesListProps {
  categories: Category[];
  totalPages: number;
  currentPage: number;
}

const CategoriesList = ({
  categories,
  totalPages,
  currentPage,
}: CategoriesListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = () => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    // Copy existing parameters if searchParams is not null
    if (searchParams) {
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
    }

    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 when searching
    router.push(`/admin/categories?${params.toString()}`);
  };

  const handleLevelChange = (value: string) => {
    setLevelFilter(value);

    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    // Copy existing parameters if searchParams is not null
    if (searchParams) {
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
    }

    if (value) {
      params.set("level", value);
    } else {
      params.delete("level");
    }
    params.set("page", "1");
    router.push(`/admin/categories?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await deleteCategory(id);
      if (response.success) {
        toast.success("Category deleted successfully");
        // Refresh the current page
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      // Changed variable name to avoid eslint error
      toast.error("Error deleting category");
      console.error(err); // Log the error for debugging
    } finally {
      setIsDeleting(false);
    }
  };

  const getLevelName = (level: number): string => {
    switch (level) {
      case 1:
        return "Root";
      case 2:
        return "Sub";
      case 3:
        return "Sub-sub";
      default:
        return `Level ${level}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>Search</Button>

        <div className="ml-auto">
          <Select value={levelFilter} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="1">Root Level</SelectItem>
              <SelectItem value="2">Sub Level</SelectItem>
              <SelectItem value="3">Sub-sub Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{getLevelName(category.level)}</TableCell>
                  <TableCell>{category.parent?.name || "None"}</TableCell>
                  <TableCell>{category._count?.children || 0}</TableCell>
                  <TableCell>{category._count?.products || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the category. You cannot delete
                              a category with products or subcategories.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          urlParamName="page"
        />
      )}
    </div>
  );
};

export default CategoriesList;
