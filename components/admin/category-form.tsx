"use client";

import { categoryDefaultValues } from "@/lib/constants";
import { insertCategorySchema, updateCategorySchema } from "@/lib/validators";
import { Category } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import slugify from "slugify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import {
  createCategory,
  getAllCategories,
  updateCategory,
} from "@/lib/actions/category.actions";
import Image from "next/image";

// Define the props type for the CategoryForm component
interface CategoryFormProps {
  type: "Create" | "Update";
  category?: Category;
  categoryId?: string;
}

const CategoryForm = ({ type, category, categoryId }: CategoryFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null
  );
  const router = useRouter();

  // Initialize the form with either category data (for update) or default values (for create)
  const form = useForm<z.infer<typeof insertCategorySchema>>({
    resolver: zodResolver(
      type === "Update" ? updateCategorySchema : insertCategorySchema
    ),
    defaultValues: category || categoryDefaultValues,
  });

  // Fetch all categories to populate the parent category dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await getAllCategories();

        // Transform the data to match the Category type
        const transformedCategories = categoriesData.map((cat) => ({
          ...cat,
          // Make sure parent is undefined instead of null for type compatibility
          parent: cat.parent || undefined,
          // Ensure description fields match the type
          description: cat.description || undefined,
          descriptionAr: cat.descriptionAr || undefined,
        })) as Category[];

        // Filter out the current category (for update) to prevent self-reference
        const filteredCategories =
          type === "Update" && categoryId
            ? transformedCategories.filter((cat) => cat.id !== categoryId)
            : transformedCategories;

        setCategories(filteredCategories);
      } catch (error) {
        toast.error("Failed to load categories");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [type, categoryId]);

  const onSubmit = async (values: z.infer<typeof insertCategorySchema>) => {
    try {
      if (type === "Create") {
        const result = await createCategory(values);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push("/admin/categories");
      } else if (type === "Update" && categoryId) {
        const result = await updateCategory({ id: categoryId, ...values });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push("/admin/categories");
      }
    } catch (error) {
      console.error("Error submitting category form:", error);
      toast.error("Failed to save category");
    }
  };

  // Generate English slug from name
  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      form.setValue("slug", slugify(name, { lower: true }));
    } else {
      toast.error("Name is required to generate slug");
    }
  };

  // Generate Arabic slug from Arabic name
  const generateArabicSlug = () => {
    const nameAr = form.getValues("nameAr");
    if (nameAr) {
      form.setValue("slugAr", slugify(nameAr, { lower: true }));
    } else {
      toast.error("Arabic name is required to generate Arabic slug");
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // You would typically upload this file to your storage service
      // and then set the URL returned as the image value
      // For now, let's create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);

      // In a real application, you would upload the file and get back a URL
      // form.setValue("image", uploadedImageUrl);

      // For this example, we'll set a placeholder URL
      // In a real app, replace this with your actual image upload logic
      form.setValue("image", imageUrl);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-card p-6 rounded-lg shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* English Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Arabic Name */}
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الفئة" {...field} dir="rtl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* English Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (English)</FormLabel>
                <div className="flex flex-col space-y-2">
                  <FormControl>
                    <Input placeholder="Enter slug" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                    className="self-start"
                  >
                    Generate from Name
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Arabic Slug */}
          <FormField
            control={form.control}
            name="slugAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (Arabic)</FormLabel>
                <div className="flex flex-col space-y-2">
                  <FormControl>
                    <Input placeholder="أدخل الرابط" {...field} dir="rtl" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateArabicSlug}
                    className="self-start"
                  >
                    Generate from Arabic Name
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parent Category */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Image */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <div className="flex flex-col space-y-4">
                {imagePreview && (
                  <div className="relative h-40 w-40 rounded-md overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </FormControl>
                <Input
                  type="text"
                  placeholder="Or enter image URL directly"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* English Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (English)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter category description"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Arabic Description */}
        <FormField
          control={form.control}
          name="descriptionAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Arabic)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل وصف الفئة"
                  className="resize-none text-right"
                  dir="rtl"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : type === "Create"
                ? "Create Category"
                : "Update Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
