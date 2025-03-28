"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { dealSchema, updateDealSchema } from "../validators";
import { auth } from "@/auth";

export async function getDeal(id: string) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id },
    });
    return { deal };
  } catch (error) {
    console.error("Failed to get deal:", error);
    return { error: "Failed to get deal." };
  }
}

export async function getDeals() {
  try {
    const deals = await prisma.deal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { deals };
  } catch (error) {
    console.error("Failed to get deals:", error);
    return { error: "Failed to get deals." };
  }
}

export async function getActiveDeals() {
  try {
    const now = new Date();
    console.log("Fetching active deals at:", now);

    const deals = await prisma.deal.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        targetDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${deals.length} active deals`);
    
    return { deals };
  } catch (error) {
    console.error("Failed to get active deals:", error);
    return { error: "Failed to get active deals." };
  }
}

export async function createDeal(values: unknown) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "Not authorized" };
  }

  try {
    // Validate form values
    const validatedFields = dealSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields." };
    }

    const { data } = validatedFields;

    // Create the deal
    const deal = await prisma.deal.create({
      data: {
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        imageUrl: data.imageUrl,
        targetDate: data.targetDate,
        startDate: data.startDate || new Date(),
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/deals");
    revalidatePath("/"); // Revalidate home page to show the new deal
    return { deal };
  } catch (error) {
    console.error("Failed to create deal:", error);
    return { error: "Failed to create deal." };
  }
}

export async function updateDeal(values: unknown) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "Not authorized" };
  }

  try {
    // Validate form values
    const validatedFields = updateDealSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields." };
    }

    const { id, ...data } = validatedFields.data;

    // Update the deal
    const deal = await prisma.deal.update({
      where: { id },
      data: {
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        imageUrl: data.imageUrl,
        targetDate: data.targetDate,
        startDate: data.startDate,
        isActive: data.isActive,
      },
    });

    revalidatePath(`/admin/deals/${id}`);
    revalidatePath("/admin/deals");
    revalidatePath("/"); // Revalidate home page to update the deal
    return { deal };
  } catch (error) {
    console.error("Failed to update deal:", error);
    return { error: "Failed to update deal." };
  }
}

export async function deleteDeal(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "Not authorized" };
  }

  try {
    await prisma.deal.delete({
      where: { id },
    });

    revalidatePath("/admin/deals");
    revalidatePath("/"); // Revalidate home page in case the deleted deal was active
    return { success: true };
  } catch (error) {
    console.error("Failed to delete deal:", error);
    return { error: "Failed to delete deal." };
  }
}

export async function endDeal(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "Not authorized" };
  }

  try {
    // Set the deal to inactive
    await prisma.deal.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath(`/admin/deals/${id}`);
    revalidatePath("/admin/deals");
    revalidatePath("/"); // Revalidate home page to remove the deal
    return { success: true };
  } catch (error) {
    console.error("Failed to end deal:", error);
    return { error: "Failed to end deal." };
  }
}
