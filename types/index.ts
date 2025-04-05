import { z } from "zod";
import {
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  paymentResultSchema,
  insertReviewSchema,
  imageSchema,
  insertCategorySchema,
  insertBrandSchema,
  dealSchema,
  productValidator,
} from "@/lib/validators";
import { Decimal } from "@prisma/client/runtime/library";

export type ProductImage = z.infer<typeof imageSchema> & {
  id: string;
  productId: string;
  createdAt: Date;
};

export type Category = z.infer<typeof insertCategorySchema> & {
  id: string;
  nameAr: string;
  slugAr: string;
  description?: string | null; // Allow null here
  descriptionAr?: string | null; // Allow null here to match API response
  image?: string | null; // Image URL for the category
  createdAt: Date;
  children?: Category[];
  parent?: Category | null; // Allow null for parent
  _count?: {
    children?: number;
    products?: number;
  };
};

export type Brand = z.infer<typeof insertBrandSchema> & {
  id: string;
  nameAr: string;
  slugAr: string;
  description?: string | null; // Allow null here
  descriptionAr?: string | null; // Allow null here to match API response
  createdAt: Date;
  _count?: {
    products?: number;
  };
};

// Using the productValidator schema as a base for our Product type
export type Product = {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  slugAr: string;
  description: string;
  descriptionAr: string;
  categoryId: string;
  brandId: string;
  stock: number;
  price: number | Decimal | { toString(): string };
  discount: number | Decimal | { toString(): string } | null;
  rating: number | Decimal | { toString(): string };
  numReviews: number;
  isFeatured: boolean;
  isLimitedTimeOffer: boolean;
  isNewArrival: boolean;
  createdAt: Date;
  category: Category;
  brand: Brand;
  images: Array<ProductImage | string>;
  banner?: string | null;
};

export type Cart = z.infer<typeof insertCartSchema>;

// Check if cartItemSchema expects price as a string and update the type accordingly
export type CartItem = z.infer<typeof cartItemSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  user: { name: string; email: string };
  paymentResult: PaymentResult;
};
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};

export type Deal = z.infer<typeof dealSchema> & {
  id: string;
  startDate: Date; // This is marked as optional in the schema but always present in DB
  createdAt: Date;
  updatedAt: Date;
};

export type ProductForm = z.infer<typeof productValidator>;
