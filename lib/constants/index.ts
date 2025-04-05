import { z } from "zod";
import {
  insertProductSchema,
  insertCategorySchema,
  insertBrandSchema,
  insertReviewSchema,
} from "@/lib/validators";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Hamdy ElDeeb";
export const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION || "Hamdy ElDeeb sanitaryware Store";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT = 12;

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAYMENT_METHODS = ["paypal"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = 10;

// Default pagination
export const PRICE_RANGE = [0, 10000];

// Default shipping prices
export const SHIPPING_PRICE = "10.00";
export const TAX_RATE = 0.1; // 10%

// Create productDefaultValues from the schema definition
export const productDefaultValues: z.infer<typeof insertProductSchema> = {
  name: "",
  nameAr: "",
  slug: "",
  slugAr: "",
  description: "",
  descriptionAr: "",
  categoryId: "",
  brandId: "",
  price: "0.00",
  discount: null,
  stock: 0,
  images: [],
  isFeatured: false,
  isLimitedTimeOffer: false,
  isNewArrival: false,
};

// Create categoryDefaultValues from the schema definition
export const categoryDefaultValues: z.infer<typeof insertCategorySchema> = {
  name: "",
  nameAr: "",
  slug: "",
  slugAr: "",
  description: null,
  descriptionAr: null,
  image: null,
  parentId: null,
  level: 1,
};

// Create brandDefaultValues from the schema definition
export const brandDefaultValues: z.infer<typeof insertBrandSchema> = {
  name: "",
  nameAr: "",
  slug: "",
  slugAr: "",
  description: null,
  descriptionAr: null,
  logo: null,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

// Create reviewFormDefaultValues from the schema definition
export const reviewFormDefaultValues: z.infer<typeof insertReviewSchema> = {
  productId: "",
  userId: "",
  title: "",
  description: "",
  rating: 5,
};

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
