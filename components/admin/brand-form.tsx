"use client";

import { insertBrandSchema, updateBrandSchema } from "@/lib/validators";
import { Brand } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
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
import { createBrand, updateBrand } from "@/lib/actions/brand.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import NextImage from "next/image"; // Renamed import to avoid conflict

const brandDefaultValues = {
  name: "",
  slug: "",
  description: "",
  logo: null,
  banner: null,
};

const BrandForm = ({
  type,
  brand,
  brandId,
}: {
  type: "Create" | "Update";
  brand?: Brand;
  brandId?: string;
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof insertBrandSchema>>({
    resolver: zodResolver(
      type === "Create" ? insertBrandSchema : updateBrandSchema
    ),
    defaultValues: brand && type === "Update" ? brand : brandDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertBrandSchema>> = async (
    values
  ) => {
    // On Create
    if (type === "Create") {
      const res = await createBrand(values);

      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push("/admin/brands");
      }
    }
    // On Update
    if (type === "Update") {
      if (!brandId) {
        router.push("/admin/brands");
        return;
      }
      const res = await updateBrand({ ...values, id: brandId });

      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push("/admin/brands");
      }
    }
  };

  const logo = form.watch("logo");
  const banner = form.watch("banner");

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
                z.infer<typeof insertBrandSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
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
                z.infer<typeof insertBrandSchema>,
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

        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* Logo */}
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Logo</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2">
                    {field.value && (
                      <div className="relative w-40 h-40 mx-auto">
                        <NextImage
                          src={field.value}
                          alt="brand logo"
                          className="object-contain"
                          fill
                        />
                      </div>
                    )}
                    <FormControl>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          form.setValue("logo", res[0].url);
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

          {/* Banner */}
          <FormField
            control={form.control}
            name="banner"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Banner</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2">
                    {field.value && (
                      <div className="relative w-full h-40">
                        <NextImage
                          src={field.value}
                          alt="brand banner"
                          className="object-cover"
                          fill
                        />
                      </div>
                    )}
                    <FormControl>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          form.setValue("banner", res[0].url);
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

        <div>
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertBrandSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter brand description"
                    className="resize-none"
                    {...field}
                    value={field.value || ""} // Add this to handle null values
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
            {form.formState.isSubmitting ? "Submitting..." : `${type} Brand`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BrandForm;
