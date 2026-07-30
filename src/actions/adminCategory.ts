"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Category } from "@/models/Category";
import { Kitchen } from "@/models/Kitchen";
import { MenuItem } from "@/models/MenuItem";
import { revalidatePath } from "next/cache";

export const createCategory = async (data: {
  name: string;
  description?: string;
  kitchenId: string;
}) => {
  try {
    await connectToDatabase();

    if (!data.name || !data.name.trim()) {
      return { error: "Category name is required." };
    }
    if (!data.kitchenId) {
      return { error: "Target kitchen branch is required." };
    }

    const kitchen = await Kitchen.findById(data.kitchenId);
    if (!kitchen) {
      return { error: "Selected kitchen branch not found." };
    }

    // Check for duplicate category name within the same kitchen
    const cleanName = data.name.trim();
    const existing = await Category.findOne({
      kitchenId: data.kitchenId,
      name: new RegExp(`^${cleanName}$`, "i"),
      deletedAt: null,
    });

    if (existing) {
      return { error: "A category with this name already exists in the selected kitchen." };
    }

    await Category.create({
      name: cleanName,
      description: data.description?.trim() || "",
      kitchenId: data.kitchenId,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err: any) {
    console.error("createCategory error:", err);
    return { error: "Failed to create category." };
  }
};

export const updateCategory = async (
  id: string,
  data: {
    name: string;
    description?: string;
    kitchenId: string;
  }
) => {
  try {
    await connectToDatabase();

    if (!data.name || !data.name.trim()) {
      return { error: "Category name is required." };
    }
    if (!data.kitchenId) {
      return { error: "Target kitchen branch is required." };
    }

    const cleanName = data.name.trim();
    const existing = await Category.findOne({
      _id: { $ne: id },
      kitchenId: data.kitchenId,
      name: new RegExp(`^${cleanName}$`, "i"),
      deletedAt: null,
    });

    if (existing) {
      return { error: "Another category with this name already exists in the selected kitchen." };
    }

    await Category.findByIdAndUpdate(id, {
      name: cleanName,
      description: data.description?.trim() || "",
      kitchenId: data.kitchenId,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err: any) {
    console.error("updateCategory error:", err);
    return { error: "Failed to update category." };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await connectToDatabase();

    // Check if category is assigned to any menu items
    const itemCount = await MenuItem.countDocuments({ category: id, deletedAt: null });
    if (itemCount > 0) {
      return {
        error: `Cannot delete category: ${itemCount} dish${itemCount > 1 ? "es are" : " is"} currently using this category. Reassign or delete those dishes first.`,
      };
    }

    await Category.findByIdAndUpdate(id, { deletedAt: new Date() });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err: any) {
    console.error("deleteCategory error:", err);
    return { error: "Failed to delete category." };
  }
};
