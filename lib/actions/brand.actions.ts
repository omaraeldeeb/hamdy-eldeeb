"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { revalidatePath } from "next/cache";
import { insertBrandSchema, updateBrandSchema } from "../validators";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";

// Get all brands
export async function getAllBrands() {
  const data = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get brand by ID
export async function getBrandById(id: string) {
  const data = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get brand by slug
export async function getBrandBySlug(slug: string) {
  const data = await prisma.brand.findFirst({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Create a brand
export async function createBrand(data: z.infer<typeof insertBrandSchema>) {
  try {
    const brandData = insertBrandSchema.parse(data);
    await prisma.brand.create({ data: brandData });

    revalidatePath("/admin/brands");
    return { success: true, message: "Brand created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a brand
export async function updateBrand(data: z.infer<typeof updateBrandSchema>) {
  try {
    const brandData = updateBrandSchema.parse(data);
    const { id, ...updateData } = brandData;

    const brandExists = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brandExists) {
      throw new Error("Brand not found");
    }

    await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/brands");
    return { success: true, message: "Brand updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Delete a brand
export async function deleteBrand(id: string) {
  try {
    const brandExists = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brandExists) {
      throw new Error("Brand not found");
    }

    // Check if brand has products
    if (brandExists._count.products > 0) {
      throw new Error("Cannot delete brand with associated products");
    }

    await prisma.brand.delete({ where: { id } });

    revalidatePath("/admin/brands");
    return { success: true, message: "Brand deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get paginated brands for admin
export async function getPaginatedBrands({
  page = 1,
  limit = PAGE_SIZE,
  search = "",
}: {
  page: number;
  limit?: number;
  search?: string;
}) {
  const searchFilter = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const, // Type assertion to fix the error
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive" as const, // Type assertion to fix the error
            },
          },
        ],
      }
    : {};

  const data = await prisma.brand.findMany({
    where: searchFilter,
    orderBy: { name: "asc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const totalCount = await prisma.brand.count({
    where: searchFilter,
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

// Fix for the orderBy in getFeaturedBrands
export async function getFeaturedBrands(limit = 5) {
  // Using raw count aggregation since the nested orderBy might be causing issues
  const brands = await prisma.$queryRaw`
    SELECT b.*, COUNT(p.id) as product_count
    FROM "Brand" b
    LEFT JOIN "Product" p ON b.id = p."brandId"
    GROUP BY b.id
    ORDER BY product_count DESC
    LIMIT ${limit}
  `;

  return convertToPlainObject(brands);
}

// Alternative implementation if the raw query doesn't work well
export async function getTopBrands(limit = 5) {
  // Get all brands with their product counts
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  // Sort by product count manually
  const sortedBrands = [...brands]
    .sort((a, b) => b._count.products - a._count.products)
    .slice(0, limit);

  return convertToPlainObject(sortedBrands);
}
