import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly 2 decimal places"
  );

// Schema for image
export const imageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  alt: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  position: z.number().optional().nullable(),
});

// Schema for inserting category
export const insertCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  nameAr: z.string().optional().default(""),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  slugAr: z.string().optional().default(""),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable().default(""),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  level: z.number().int().min(1).max(3).default(1),
});

// Schema for updating category
export const updateCategorySchema = insertCategorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

// Schema for inserting brand
export const insertBrandSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  nameAr: z.string().optional().default(""),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  slugAr: z.string().optional().default(""),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable().default(""),
  logo: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
});

// Schema for updating brand
export const updateBrandSchema = insertBrandSchema.extend({
  id: z.string().min(1, "Brand ID is required"),
});

// Create a base product schema without refinement
const baseProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  nameAr: z.string().optional().default(""),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  slugAr: z.string().optional().default(""),
  categoryId: z.string().min(1, "Category ID is required"),
  brandId: z.string().min(1, "Brand ID is required"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  descriptionAr: z.string().optional().default(""),
  stock: z.coerce.number(),
  images: z.array(imageSchema).min(1, "At least one image is required"),
  isFeatured: z.boolean().default(false),
  isLimitedTimeOffer: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  price: currency,
  discount: z.preprocess(
    (val) => (val === "" ? null : val),
    z.number().min(0).max(100).optional().nullable()
  ),
  banner: z.string().nullable().optional(),
});

// Apply the refinement to create the insert schema
export const insertProductSchema = baseProductSchema.refine(
  (data) => {
    // If product is featured, banner is required
    if (
      data.isFeatured === true &&
      (!data.banner || data.banner.trim() === "")
    ) {
      return false;
    }
    return true;
  },
  {
    message: "Banner image is required for featured products",
    path: ["banner"],
  }
);

// Create the update schema by extending the base and then applying the same refinement
export const updateProductSchema = baseProductSchema
  .extend({
    id: z.string().min(1, "Product ID is required"),
  })
  .refine(
    (data) => {
      // If product is featured, banner is required
      if (
        data.isFeatured === true &&
        (!data.banner || data.banner.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Banner image is required for featured products",
      path: ["banner"],
    }
  );

// Schema for signing user in
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Schema for signing user up
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Cart schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "slug is required"),
  qty: z.number().int().nonnegative("Quantity must be a positive number"),
  image: z.string().min(1, "Image is required"),
  price: z.string(), // If this is defined as string, we need to convert our number to string
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

// Shipping Address schema
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters long"),
  streetAddress: z.string().min(3, "Street address is required"),
  city: z.string().min(3, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(3, "Country is required"),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

// Payment method schema
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

// Insert Order Schema
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
});

// Schema for inserting an order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});

// Schema for the paypal payment result
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

// Schema for updating the user profile
export const updateUserProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
});

// Schema for updating the users
export const updateUserSchema = updateUserProfileSchema.extend({
  id: z.string().min(1, "ID is required"),
  role: z.string().min(1, "Role is required"),
});

// Schema to insert reviews
export const insertReviewSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  productId: z.string().min(1, "Product is required"),
  userId: z.string().min(1, "User is required"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

// Schema for deals/promotions
export const dealSchema = z.object({
  titleEn: z
    .string()
    .min(3, "English title must be at least 3 characters long"),
  titleAr: z.string().min(3, "Arabic title must be at least 3 characters long"),
  descriptionEn: z
    .string()
    .min(3, "English description must be at least 3 characters long"),
  descriptionAr: z
    .string()
    .min(3, "Arabic description must be at least 3 characters long"),
  imageUrl: z.string().min(1, "Image URL is required"),
  targetDate: z.date({
    required_error: "Target date is required",
    invalid_type_error: "Target date must be a valid date",
  }),
  startDate: z
    .date({
      invalid_type_error: "Start date must be a valid date",
    })
    .optional(),
  isActive: z.boolean().default(true),
});

// Schema for updating deals
export const updateDealSchema = dealSchema.extend({
  id: z.string().min(1, "Deal ID is required"),
});

// Base product validator schema
export const baseProductValidatorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  nameAr: z.string().optional().default(""),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  slugAr: z.string().optional().default(""),
  categoryId: z.string().uuid("Invalid category ID"),
  brandId: z.string().uuid("Invalid brand ID"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  descriptionAr: z.string().optional().default(""),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  price: z.number().min(0, "Price cannot be negative"),
  discount: z.number().min(0).max(100).optional().nullable(),
  isFeatured: z.boolean().default(false),
  banner: z.string().nullable().optional(),
  isLimitedTimeOffer: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  images: z.array(z.string()).optional(),
});

// Apply refinement to create product validator
export const productValidator = baseProductValidatorSchema.refine(
  (data) => {
    // If product is featured, banner is required
    if (
      data.isFeatured === true &&
      (!data.banner || data.banner.trim() === "")
    ) {
      return false;
    }
    return true;
  },
  {
    message: "Banner image is required for featured products",
    path: ["banner"],
  }
);

export type ProductFormData = z.infer<typeof productValidator>;
