"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { revalidatePath } from "next/cache";
import { insertCategorySchema, updateCategorySchema } from "../validators";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";

// Get all categories
export async function getAllCategories() {
  const data = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: true,
      _count: {
        select: { products: true, children: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get all root categories (level 1)
export async function getRootCategories() {
  const data = await prisma.category.findMany({
    where: { level: 1 },
    orderBy: { name: "asc" },
    include: {
      children: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get category by ID
export async function getCategoryById(id: string) {
  const data = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get category by slug (supports both normal and Arabic slugs)
export async function getCategoryBySlug(slug: string) {
  const data = await prisma.category.findFirst({
    where: {
      OR: [{ slug: slug }, { slugAr: slug }],
    },
    include: {
      parent: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get category hierarchy
export async function getCategoryHierarchy() {
  // Get all root categories with their children
  const rootCategories = await prisma.category.findMany({
    where: { level: 1 },
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return convertToPlainObject(rootCategories);
}

// Add this to properly handle children recursion types
export async function getCategoryWithChildrenRecursive(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
    },
  });

  if (!category) return null;

  // Fetch children separately to avoid Prisma recursion limitations
  const children = await prisma.category.findMany({
    where: { parentId: id },
  });

  // Recursively fetch grandchildren for each child
  const childrenWithNestedChildren = await Promise.all(
    children.map(async (child) => {
      const nestedChildren = await prisma.category.findMany({
        where: { parentId: child.id },
      });
      return {
        ...child,
        children: nestedChildren,
      };
    })
  );

  return {
    ...category,
    children: childrenWithNestedChildren,
  };
}

// Create a new category
export async function createCategory(
  data: z.infer<typeof insertCategorySchema>
) {
  try {
    const categoryData = insertCategorySchema.parse(data);
    await prisma.category.create({ data: categoryData });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, message: "Category created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a category
export async function updateCategory(
  data: z.infer<typeof updateCategorySchema>
) {
  try {
    const categoryData = updateCategorySchema.parse(data);
    const { id, parentId, ...otherData } = categoryData;

    const categoryExists = await prisma.category.findUnique({
      where: { id },
    });

    if (!categoryExists) {
      throw new Error("Category not found");
    }

    // Check for circular references if parentId is provided
    if (parentId) {
      // Prevent setting a category as its own parent
      if (parentId === id) {
        throw new Error("Category cannot be its own parent");
      }

      // Get the new parent category
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        throw new Error("Parent category not found");
      }

      // Make sure we don't exceed max level
      const newLevel = parentCategory.level + 1;
      if (newLevel > 3) {
        throw new Error("Cannot move category deeper than level 3");
      }

      // Update category with new parent and level
      await prisma.category.update({
        where: { id },
        data: {
          ...otherData,
          parentId,
          level: newLevel,
        },
      });
    } else {
      // If no parent, then it's a root category
      await prisma.category.update({
        where: { id },
        data: {
          ...otherData,
          parentId: null,
          level: 1,
        },
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    const categoryExists = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!categoryExists) {
      throw new Error("Category not found");
    }

    // Check if category has products
    if (categoryExists._count.products > 0) {
      throw new Error("Cannot delete category with associated products");
    }

    // Check if category has children
    if (categoryExists._count.children > 0) {
      throw new Error("Cannot delete category with subcategories");
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get paginated categories for admin
export async function getPaginatedCategories({
  page = 1,
  limit = PAGE_SIZE,
  search = "",
  level,
}: {
  page: number;
  limit?: number;
  search?: string;
  level?: number;
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

  const levelFilter = level ? { level } : {};

  const data = await prisma.category.findMany({
    where: {
      ...searchFilter,
      ...levelFilter,
    },
    orderBy: { name: "asc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      parent: true,
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    },
  });

  const totalCount = await prisma.category.count({
    where: {
      ...searchFilter,
      ...levelFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

// Get main categories only
export async function getMainCategories() {
  const data = await prisma.category.findMany({
    where: {
      level: 1,
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true, children: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// Get sub-categories for a parent category
export async function getSubCategories(parentId: string) {
  const data = await prisma.category.findMany({
    where: {
      parentId,
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true, children: true },
      },
    },
  });

  return convertToPlainObject(data);
}
