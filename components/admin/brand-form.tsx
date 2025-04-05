"use client";

import { brandDefaultValues } from "@/lib/constants";
import { insertBrandSchema, updateBrandSchema } from "@/lib/validators";
import { Brand } from "@/types";
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
import { createBrand, updateBrand } from "@/lib/actions/brand.actions";
import { Card, CardContent } from "../ui/card";
import NextImage from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import { X } from "lucide-react";

// Define the props type for the BrandForm component
interface BrandFormProps {
  type: "Create" | "Update";
  brand?: Brand;
  brandId?: string;
}

const BrandForm = ({ type, brand, brandId }: BrandFormProps) => {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand?.logo || null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    brand?.banner || null
  );

  // Set up the form with validation and default values from constants
  const form = useForm<z.infer<typeof insertBrandSchema>>({
    resolver: zodResolver(
      type === "Create" ? insertBrandSchema : updateBrandSchema
    ),
    defaultValues:
      type === "Update"
        ? {
            name: brand?.name || "",
            nameAr: brand?.nameAr || "",
            slug: brand?.slug || "",
            slugAr: brand?.slugAr || "",
            description: brand?.description || "",
            descriptionAr: brand?.descriptionAr || "",
            logo: brand?.logo || null,
            banner: brand?.banner || null,
          }
        : brandDefaultValues,
  });

  const onSubmit = async (values: z.infer<typeof insertBrandSchema>) => {
    try {
      if (type === "Create") {
        const result = await createBrand(values);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push("/admin/brands");
      } else if (type === "Update" && brandId) {
        const result = await updateBrand({ id: brandId, ...values });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push("/admin/brands");
      }
    } catch (error) {
      console.error("Error submitting brand form:", error);
      toast.error("Failed to save brand");
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

  // Handle logo upload
  const handleLogoUpload = (url: string) => {
    form.setValue("logo", url);
    setLogoPreview(url);
  };

  // Handle banner upload
  const handleBannerUpload = (url: string) => {
    form.setValue("banner", url);
    setBannerPreview(url);
  };

  // Remove logo
  const removeLogo = () => {
    form.setValue("logo", null);
    setLogoPreview(null);
  };

  // Remove banner
  const removeBanner = () => {
    form.setValue("banner", null);
    setBannerPreview(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* English Name and Slug */}
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
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
        </div>

        {/* Arabic Name and Slug */}
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name (Arabic)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل اسم العلامة التجارية"
                    {...field}
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slugAr"
            render={({ field }) => (
              <FormItem className="w-full">
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

        {/* Logo Upload */}
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <Card>
                <CardContent className="pt-4">
                  {logoPreview && (
                    <div className="relative w-40 h-40 mx-auto mb-4">
                      <NextImage
                        src={logoPreview}
                        alt="Brand logo"
                        fill
                        className="object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <FormControl>
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res: { url: string }[]) => {
                        handleLogoUpload(res[0].url);
                        field.onChange(res[0].url); // Use field.onChange to update the form
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

        {/* Banner Upload */}
        <FormField
          control={form.control}
          name="banner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner</FormLabel>
              <Card>
                <CardContent className="pt-4">
                  {bannerPreview && (
                    <div className="relative w-full h-40 mb-4">
                      <NextImage
                        src={bannerPreview}
                        alt="Brand banner"
                        fill
                        className="object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeBanner}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <FormControl>
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res: { url: string }[]) => {
                        handleBannerUpload(res[0].url);
                        field.onChange(res[0].url); // Use field.onChange to update the form
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

        {/* English Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (English)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter brand description"
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
                  placeholder="أدخل وصف العلامة التجارية"
                  className="resize-none text-right"
                  {...field}
                  value={field.value || ""}
                  dir="rtl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : `${type} Brand`}
        </Button>
      </form>
    </Form>
  );
};

export default BrandForm;
