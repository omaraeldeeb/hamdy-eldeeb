"use client";

import { productDefaultValues } from "@/lib/constants";
import {
  insertProductSchema,
  updateProductSchema,
  imageSchema,
} from "@/lib/validators";
import { Product, Category, Brand, ProductImage } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ControllerRenderProps,
  SubmitHandler,
  useForm,
  Resolver,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import NextImage from "next/image"; // Renamed import to avoid conflict
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { getAllCategories } from "@/lib/actions/category.actions";
import { getAllBrands } from "@/lib/actions/brand.actions";
import { X } from "lucide-react";

// Extended schema to include banner for the form
type ProductFormSchema = z.infer<typeof insertProductSchema> & {
  banner?: string | null;
};

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getAllCategories(),
          getAllBrands(),
        ]);
        setCategories(
          categoriesData.map((category) => ({
            ...category,
            parent: category.parent || undefined, // Convert null to undefined
          }))
        );
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories or brands");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform product images for form if updating
  const defaultImages: z.infer<typeof imageSchema>[] =
    product?.images?.map((img: ProductImage) => ({
      url: img.url,
      alt: img.alt || "",
      type: img.type || "",
      position: img.position || 0,
    })) || [];

  const defaultValues: ProductFormSchema = {
    ...productDefaultValues,
    ...product,
    images: defaultImages,
    banner: product?.banner || null,
  };

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(
      type === "Create" ? insertProductSchema : updateProductSchema
    ) as unknown as Resolver<ProductFormSchema>, // Type assertion with proper resolver type
    defaultValues: type === "Update" ? defaultValues : productDefaultValues,
  });

  const onSubmit: SubmitHandler<ProductFormSchema> = async (values) => {
    try {
      // Create a copy of values for submission
      const submissionData = { ...values };
      const banner = submissionData.banner;

      // Remove banner from submission if not needed
      delete submissionData.banner;

      // Add banner back to submission data if product is featured
      if (submissionData.isFeatured && banner) {
        (
          submissionData as z.infer<typeof insertProductSchema> & {
            banner?: string;
          }
        ).banner = banner;
      }

      // On Create
      if (type === "Create") {
        const res = await createProduct(submissionData);
        if (!res.success) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          router.push("/admin/products");
        }
      }

      // On Update
      if (type === "Update" && productId) {
        const res = await updateProduct({
          ...submissionData,
          id: productId,
        });

        if (!res.success) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          router.push("/admin/products");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to save product");
    }
  };

  const images = form.watch("images") || [];

  const handleAddImage = (url: string) => {
    const newImage: z.infer<typeof imageSchema> = {
      url,
      alt: "",
      type: "main",
      position: images.length,
    };
    form.setValue("images", [...images, newImage]);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);

    // Update positions
    const reindexedImages = updatedImages.map((img, idx) => ({
      ...img,
      position: idx,
    }));

    form.setValue("images", reindexedImages);
  };

  if (isLoading) {
    return <div>Loading categories and brands...</div>;
  }

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
          {/* Brand */}
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "price"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "stock"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="uplaod-field">
          {/* Images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex flex-wrap gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="relative w-24 h-24">
                            <NextImage
                              src={image.url}
                              alt={image.alt || "product image"}
                              className="object-cover rounded-md"
                              fill
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <FormControl>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          handleAddImage(res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`ERROR! ${error.message}`);
                        }}
                      />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* isFeatured */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Featured Product</FormLabel>
                </div>
                {field.value && (
                  <div>
                    <FormLabel>Banner Image</FormLabel>
                    <Card>
                      <CardContent className="pt-4">
                        {form.getValues("banner") && (
                          <div className="relative w-full h-40 mb-4">
                            <NextImage
                              src={form.getValues("banner")!}
                              alt="banner image"
                              className="object-cover rounded-md"
                              fill
                            />
                          </div>
                        )}
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue("banner", res[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`ERROR! ${error.message}`);
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
