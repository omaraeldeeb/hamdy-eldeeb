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
  FormDescription,
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
    product?.images?.map((img: string | ProductImage) => {
      // Handle both string and ProductImage types
      if (typeof img === "string") {
        return {
          url: img,
          alt: "",
          type: "main",
          position: 0,
        };
      }
      return {
        url: img.url,
        alt: img.alt || "",
        type: img.type || "",
        position: img.position || 0,
      };
    }) || [];

  const defaultValues: ProductFormSchema = {
    ...productDefaultValues,
    ...(product
      ? {
          ...product,
          // Type conversions to match ProductFormSchema
          price: product.price
            ? String(product.price)
            : productDefaultValues.price,
          discount: product.discount ? Number(product.discount) : null,
          stock: product.stock
            ? Number(product.stock)
            : productDefaultValues.stock,
          categoryId: product.categoryId || productDefaultValues.categoryId,
          brandId: product.brandId || productDefaultValues.brandId,
          isFeatured: Boolean(product.isFeatured),
          isLimitedTimeOffer: Boolean(product.isLimitedTimeOffer),
          isNewArrival: Boolean(product.isNewArrival),
        }
      : {}),
    images: defaultImages,
    banner: product?.banner || null,
  };

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(
      type === "Create" ? insertProductSchema : updateProductSchema
    ) as unknown as Resolver<ProductFormSchema>, // Type assertion with proper resolver type
    defaultValues: type === "Update" ? defaultValues : productDefaultValues,
  });

  // Modified to integrate with the banner feature
  const onSubmit: SubmitHandler<ProductFormSchema> = async (values) => {
    try {
      // Ensure featured products have banner
      if (
        values.isFeatured &&
        (!values.banner || values.banner.trim() === "")
      ) {
        form.setError("banner", {
          type: "manual",
          message: "Banner image is required for featured products",
        });
        return;
      }

      // Handle submission as normal
      if (type === "Create") {
        const res = await createProduct(values);
        if (!res.success) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          router.push("/admin/products");
        }
      }

      if (type === "Update" && productId) {
        const res = await updateProduct({
          ...values,
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

  // Generate Arabic slug from Arabic name
  const generateArabicSlug = () => {
    const arabicName = form.getValues("nameAr");
    if (arabicName && arabicName.trim() !== "") {
      form.setValue(
        "slugAr",
        slugify(arabicName, { lower: true, strict: true })
      );
    } else {
      toast.error("Arabic name is empty. Please enter an Arabic name first.");
    }
  };

  // Add a watch for the isFeatured field
  const watchIsFeatured = form.watch("isFeatured");

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
        {/* English name and slug */}
        <div className="flex flex-col md:flex-row gap-5">
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
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Slug (English)</FormLabel>
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

        {/* Arabic name and slug */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="nameAr"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "nameAr"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم المنتج" {...field} dir="rtl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slugAr"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slugAr"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug (Arabic)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="أدخل الرابط" {...field} dir="rtl" />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={generateArabicSlug}
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
          {/* Discount */}
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter discount percentage"
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
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

        {/* Product flags checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      onCheckedChange={(checked) => {
                        field.onChange(checked);

                        // If setting to featured, verify banner exists
                        if (
                          checked &&
                          (!form.getValues("banner") ||
                            form.getValues("banner")?.trim() === "")
                        ) {
                          form.setError("banner", {
                            type: "manual",
                            message:
                              "Banner image is required for featured products",
                          });
                        } else {
                          form.clearErrors("banner");
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel>Featured Product</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* isLimitedTimeOffer */}
          <FormField
            control={form.control}
            name="isLimitedTimeOffer"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Limited Time Offer</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* isNewArrival */}
          <FormField
            control={form.control}
            name="isNewArrival"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>New Arrival</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* English description */}
        <div>
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
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Arabic description */}
        <div>
          <FormField
            control={form.control}
            name="descriptionAr"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "descriptionAr"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="أدخل وصف المنتج"
                    className="resize-none text-right"
                    rows={5}
                    {...field}
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Add a banner field to the form */}
        <FormField
          control={form.control}
          name="banner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Banner Image{" "}
                {watchIsFeatured && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormDescription>
                Upload a banner image for featured products (required when
                product is featured)
              </FormDescription>
              {field.value ? (
                <div className="relative w-full aspect-[16/5] mt-2 mb-4 rounded-md overflow-hidden">
                  <NextImage
                    src={field.value}
                    alt="Product banner"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => field.onChange("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      field.onChange(res[0].url);
                      toast.success("Banner uploaded successfully");
                      // Clear any banner validation errors
                      form.clearErrors("banner");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload error: ${error.message}`);
                  }}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
