"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { dealSchema } from "@/lib/validators";
import { z } from "zod";
import { createDeal, updateDeal } from "@/lib/actions/deal-actions";
import { Deal } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

interface DealFormProps {
  deal?: Deal;
}

type FormData = z.infer<typeof dealSchema>;

export default function DealForm({ deal }: DealFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    deal?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEditing = !!deal;

  const defaultValues: Partial<FormData> = deal
    ? {
        titleEn: deal.titleEn,
        titleAr: deal.titleAr,
        descriptionEn: deal.descriptionEn,
        descriptionAr: deal.descriptionAr,
        imageUrl: deal.imageUrl,
        targetDate: new Date(deal.targetDate),
        startDate: new Date(deal.startDate),
        isActive: deal.isActive,
      }
    : {
        titleEn: "",
        titleAr: "",
        descriptionEn: "",
        descriptionAr: "",
        imageUrl: "",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        startDate: new Date(),
        isActive: true,
      };

  const form = useForm<FormData>({
    resolver: zodResolver(dealSchema),
    defaultValues,
  });

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);

    // Set the imageUrl field value to a placeholder - it will be replaced during upload
    form.setValue("imageUrl", "pending-upload");
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to upload the image to your storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "deals");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      // If we have a new image file, upload it first
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        data.imageUrl = imageUrl;
      }

      if (isEditing) {
        const result = await updateDeal({ ...data, id: deal.id });
        if (result.error) {
          form.setError("root", { message: result.error });
          return;
        }
        router.push("/admin/deals");
      } else {
        const result = await createDeal(data);
        if (result.error) {
          form.setError("root", { message: result.error });
          return;
        }
        router.push("/admin/deals");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        message: "An error occurred while saving the deal",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Title and text fields remain unchanged */}
          <FormField
            control={form.control}
            name="titleEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Deal of the Month"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This title will be displayed to English-speaking users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="titleAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arabic Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="عرض الشهر"
                    {...field}
                    dir="rtl"
                  />
                </FormControl>
                <FormDescription>
                  This title will be displayed to Arabic-speaking users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>English Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Don't miss out on our exclusive monthly deal!"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  Description displayed to English-speaking users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arabic Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="لا تفوت عرضنا الشهري الحصري!"
                    {...field}
                    rows={3}
                    dir="rtl"
                  />
                </FormControl>
                <FormDescription>
                  Description displayed to Arabic-speaking users.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Replace URL input with file upload */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Image</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {/* Image upload area */}
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-gray-50 transition flex flex-col items-center justify-center",
                        imagePreview ? "h-auto" : "h-40"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <div className="relative w-full">
                          <div className="relative w-full h-48 mx-auto overflow-hidden rounded-md">
                            <Image
                              src={imagePreview}
                              alt="Deal preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload an image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, GIF up to 5MB
                          </p>
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            Recommended size: 600×400px (3:2 ratio)
                          </p>
                        </>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isLoading}
                      />

                      {/* Hidden input to store the URL for form validation */}
                      <input type="hidden" {...field} />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Upload an image for the promotional deal. For best results,
                  use an image with a 3:2 aspect ratio (600×400 pixels).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date(
                            new Date().setHours(0, 0, 0, 0)
                          );
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>When the deal should start.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate");
                          return startDate ? date < startDate : false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>When the deal will end.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Active checkbox */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    When checked, the deal will be visible on the site (within
                    start/end dates).
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/deals")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Deal" : "Create Deal"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
