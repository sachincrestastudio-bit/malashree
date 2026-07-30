"use server";

import { connectToDatabase } from "@/database/mongoose";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import { Kitchen } from "@/models/Kitchen";
import { revalidatePath } from "next/cache";

export const addMenuItem = async (formData: {
  name: string;
  description: string;
  price: number;
  kitchenId: string;
  categoryId: string;
  isVeg: boolean;
  tags: string;
  images: string;
}) => {
  try {
    await connectToDatabase();

    const kitchen = await Kitchen.findById(formData.kitchenId).lean();
    if (!kitchen) return { error: "Invalid kitchen selected." };

    const category = await Category.findById(formData.categoryId).lean();
    if (!category) return { error: "Invalid category selected." };

    await MenuItem.create({
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      kitchenId: formData.kitchenId,
      category: formData.categoryId,
      isVeg: formData.isVeg,
      tags: formData.tags ? [formData.tags] : [],
      images: formData.images ? [formData.images] : [],
      isAvailable: true,
    });

    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err: any) {
    console.error("addMenuItem error:", err);
    return { error: "Failed to add menu item." };
  }
};

export const updateMenuItemAvailability = async (id: string, isAvailable: boolean) => {
  try {
    await connectToDatabase();
    await MenuItem.findByIdAndUpdate(id, { isAvailable });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err: any) {
    console.error("updateMenuItemAvailability error:", err);
    return { error: "Failed to update item." };
  }
};

export const deleteMenuItem = async (id: string) => {
  try {
    await connectToDatabase();
    await MenuItem.findByIdAndDelete(id);
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err: any) {
    console.error("deleteMenuItem error:", err);
    return { error: "Failed to delete item." };
  }
};

export const getMenuFormData = async () => {
  await connectToDatabase();
  Category.modelName;
  Kitchen.modelName;

  const [kitchens, categories] = await Promise.all([
    Kitchen.find({ status: "active" }).select("name _id").lean(),
    Category.find().select("name _id kitchenId").lean(),
  ]);

  return {
    kitchens: kitchens.map((k: any) => ({ id: k._id.toString(), name: k.name })),
    categories: categories.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      kitchenId: c.kitchenId?.toString() || "",
    })),
  };
};
