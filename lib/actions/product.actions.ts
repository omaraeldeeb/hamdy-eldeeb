"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { Product } from "@/types";

// Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get single product by it's slug (support both normal and Arabic slugs)
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: {
      OR: [{ slug: slug }, { slugAr: slug }],
    },
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
}

// Get single product by it's id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
  return convertToPlainObject(data);
}

// Get all products with enhanced query support
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  categoryId,
  brand,
  price,
  rating,
  sort,
  isLimitedTimeOffer,
  isNewArrival,
}: {
  query: string;
  limit?: number;
  page: number;
  categoryId?: string;
  brand?: string; // Added brand type
  price?: string;
  rating?: string;
  sort?: string;
  isLimitedTimeOffer?: boolean;
  isNewArrival?: boolean;
}) {
  // Query filter - now supports both English and Arabic names
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              } as Prisma.StringFilter,
            },
            {
              nameAr: {
                contains: query,
                mode: "insensitive",
              } as Prisma.StringFilter,
            },
          ],
        }
      : {};

  // Category filter - enhanced to include child categories
  let categoryFilter: Prisma.ProductWhereInput = {};
  if (categoryId && categoryId !== "all") {
    // Use regex to check if categoryId is a UUID
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        categoryId
      );

    if (isUUID) {
      // Check if this is a parent category (find all child categories)
      const childCategories = await prisma.category.findMany({
        where: {
          parentId: categoryId,
        },
        select: {
          id: true,
        },
      });

      if (childCategories.length > 0) {
        // This is a parent category with children, include all children in filter
        const childIds = childCategories.map((child) => child.id);
        categoryFilter = {
          OR: [{ categoryId }, { categoryId: { in: childIds } }],
        };
      } else {
        // No children, just filter by the category ID
        categoryFilter = { categoryId };
      }
    } else {
      // If it's a category name, search by name through the relation
      // First get the category by name
      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: categoryId,
            mode: "insensitive" as const,
          },
        },
        select: {
          id: true,
        },
      });

      if (category) {
        // Check if this category has children
        const childCategories = await prisma.category.findMany({
          where: {
            parentId: category.id,
          },
          select: {
            id: true,
          },
        });

        if (childCategories.length > 0) {
          // Include all children in filter
          const childIds = childCategories.map((child) => child.id);
          categoryFilter = {
            OR: [{ categoryId: category.id }, { categoryId: { in: childIds } }],
          };
        } else {
          // No children, just filter by the category ID
          categoryFilter = { categoryId: category.id };
        }
      } else {
        // Fallback to name-based filtering if category not found
        categoryFilter = {
          category: {
            name: {
              equals: categoryId,
              mode: "insensitive" as const,
            },
          },
        };
      }
    }
  }

  // Brand filter - new filter
  const brandFilter: Prisma.ProductWhereInput =
    brand && brand !== "all"
      ? {
          brand: {
            name: {
              equals: brand,
              mode: "insensitive" as const,
            },
          },
        }
      : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  // Rating filter
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  // Special offers filter
  const limitedTimeOfferFilter = isLimitedTimeOffer
    ? { isLimitedTimeOffer: true }
    : {};

  // New arrivals filter
  const newArrivalFilter = isNewArrival ? { isNewArrival: true } : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter, // Added brand filter
      ...priceFilter,
      ...ratingFilter,
      ...limitedTimeOfferFilter,
      ...newArrivalFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : sort === "discount"
              ? { discount: "desc" }
              : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter, // Added brand filter
      ...priceFilter,
      ...ratingFilter,
      ...limitedTimeOfferFilter,
      ...newArrivalFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });
    if (!productExists) throw new Error("Product not found");

    // Delete all images associated with the product first
    await prisma.image.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const productData = insertProductSchema.parse(data);
    const { images, ...productDetails } = productData;

    // Handle banner for featured products
    let bannerField = {};
    if (productData.isFeatured && productData.banner) {
      bannerField = { banner: productData.banner };
    }

    // Create the product first
    const newProduct = await prisma.product.create({
      data: {
        ...productDetails,
        ...bannerField, // Add banner field if product is featured
      },
    });

    // Then create all the images with the product ID
    if (images && images.length > 0) {
      await prisma.image.createMany({
        data: images.map((image, index) => ({
          ...image,
          productId: newProduct.id,
          position: index,
        })),
      });
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const productData = updateProductSchema.parse(data);
    const { id, images, ...productDetails } = productData;

    const productExists = await prisma.product.findFirst({
      where: { id },
    });
    if (!productExists) throw new Error("Product not found");

    // Handle banner for featured products
    let bannerField = {};
    if (productData.isFeatured && productData.banner) {
      bannerField = { banner: productData.banner };
    } else if (!productData.isFeatured) {
      // If not featured, keep the banner field as is or set to null
      bannerField = { banner: productData.banner };
    }

    // Update the product details
    await prisma.product.update({
      where: { id },
      data: {
        ...productDetails,
        ...bannerField, // Add banner field
      },
    });

    // Delete existing images
    await prisma.image.deleteMany({
      where: { productId: id },
    });

    // Create new images
    if (images && images.length > 0) {
      await prisma.image.createMany({
        data: images.map((image, index) => ({
          ...image,
          productId: id,
          position: index,
        })),
      });
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Fix the getAllCategoriesFromProducts function to return consistent types
export async function getAllCategoriesFromProducts() {
  // Fetch all categories
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
      level: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  // Group by parent for easier hierarchy building
  const mainCategories = allCategories
    .filter((cat) => !cat.parentId)
    .map((category) => ({
      category: category.name,
      _count: category._count.products,
      id: category.id,
      level: category.level,
      isParent: true,
      children: allCategories
        .filter((child) => child.parentId === category.id)
        .map((subCat) => ({
          category: subCat.name,
          _count: subCat._count.products,
          id: subCat.id,
          level: subCat.level,
          isParent: false,
          parentId: subCat.parentId,
        })),
    }));

  return mainCategories;
}

// Get all brands for product filters - updated to match expected interface
export async function getAllBrandsFromProducts() {
  const brandData = await prisma.brand.findMany({
    select: {
      name: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return brandData.map((item) => ({
    brand: item.name,
    _count: item._count.products,
  }));
}

// Get featured products
export async function getFeaturedProducts(): Promise<Product[]> {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  // Process the data to ensure consistent structure
  const processedData = convertToPlainObject(data);
  return processedData.map((product) => ({
    ...product,
    // Ensure numerical values are correctly handled
    price: Number(product.price),
    discount: product.discount ? Number(product.discount) : null,
    rating: Number(product.rating),
  })) as Product[];
}

// Get limited time offer products
export async function getLimitedTimeOfferProducts(): Promise<Product[]> {
  const data = await prisma.product.findMany({
    where: { isLimitedTimeOffer: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  // Process the data to ensure consistent structure
  const processedData = convertToPlainObject(data);
  return processedData.map((product) => ({
    ...product,
    // Ensure numerical values are correctly handled
    price: Number(product.price),
    discount: product.discount ? Number(product.discount) : null,
    rating: Number(product.rating),
  })) as Product[];
}

// Get new arrival products
export async function getNewArrivalProducts(): Promise<Product[]> {
  const data = await prisma.product.findMany({
    where: { isNewArrival: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  // Process the data to ensure consistent structure
  const processedData = convertToPlainObject(data);
  return processedData.map((product) => ({
    ...product,
    // Ensure numerical values are correctly handled
    price: Number(product.price),
    discount: product.discount ? Number(product.discount) : null,
    rating: Number(product.rating),
  })) as Product[];
}
