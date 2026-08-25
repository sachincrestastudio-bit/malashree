"use server";

import { connectToDatabase } from "@/database/mongoose";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import { Kitchen } from "@/models/Kitchen";
import { revalidatePath } from "next/cache";
import { seedDatabase } from "@/actions/seed";

/**
 * 1. Add a Universal Master Dish (Available across all branches by default)
 */
export const addMasterDish = async (formData: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isVeg: boolean;
  tags: string;
  images: string;
}) => {
  try {
    await connectToDatabase();

    const category = await Category.findById(formData.categoryId).lean();
    if (!category) return { error: "Invalid category selected." };

    // Get all active kitchens to initialize branch overrides
    const kitchens = await Kitchen.find({ status: "active", deletedAt: null }).lean();

    const branchPricing = kitchens.map((k: any) => ({
      kitchenId: k._id,
      price: Number(formData.price),
      isAvailable: true,
      isEnabled: true,
    }));

    await MenuItem.create({
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      price: Number(formData.price),
      category: formData.categoryId,
      isGlobalMaster: true,
      branchPricing,
      isVeg: formData.isVeg !== undefined ? formData.isVeg : true,
      tags: formData.tags ? [formData.tags.trim()] : [],
      images: formData.images ? [formData.images.trim()] : [],
      isAvailable: true,
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("addMasterDish error:", err);
    return { error: err.message || "Failed to add master dish." };
  }
};

/**
 * 2. Update Master Dish (Name, Description, Base Price, Category, Veg, Tags, Images)
 */
export const updateMasterDish = async (formData: {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isVeg: boolean;
  tags: string;
  images: string;
}) => {
  try {
    await connectToDatabase();

    const dish = await MenuItem.findById(formData.id);
    if (!dish) return { error: "Dish not found." };

    dish.name = formData.name.trim();
    dish.description = formData.description?.trim() || "";
    dish.price = Number(formData.price);
    if (formData.categoryId) dish.category = formData.categoryId;
    dish.isVeg = formData.isVeg !== undefined ? formData.isVeg : true;
    if (formData.tags !== undefined) {
      dish.tags = formData.tags ? [formData.tags.trim()] : [];
    }
    if (formData.images) {
      dish.images = [formData.images.trim()];
    }

    await dish.save();

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("updateMasterDish error:", err);
    return { error: err.message || "Failed to update master dish." };
  }
};

/**
 * 3. Update Branch Specific Pricing & Availability for a Dish
 */
export const updateBranchDishOverride = async (payload: {
  dishId: string;
  kitchenId: string;
  price?: number;
  isEnabled?: boolean;
  isAvailable?: boolean;
}) => {
  try {
    await connectToDatabase();

    const dish = await MenuItem.findById(payload.dishId);
    if (!dish) return { error: "Dish not found." };

    if (!dish.branchPricing) {
      dish.branchPricing = [];
    }

    const existingIndex = dish.branchPricing.findIndex(
      (bp: any) => bp.kitchenId.toString() === payload.kitchenId
    );

    if (existingIndex >= 0) {
      if (payload.price !== undefined) {
        dish.branchPricing[existingIndex].price = Number(payload.price);
      }
      if (payload.isEnabled !== undefined) {
        dish.branchPricing[existingIndex].isEnabled = payload.isEnabled;
      }
      if (payload.isAvailable !== undefined) {
        dish.branchPricing[existingIndex].isAvailable = payload.isAvailable;
      }
    } else {
      dish.branchPricing.push({
        kitchenId: payload.kitchenId,
        price: payload.price !== undefined ? Number(payload.price) : dish.price,
        isEnabled: payload.isEnabled !== undefined ? payload.isEnabled : true,
        isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
      });
    }

    await dish.save();

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("updateBranchDishOverride error:", err);
    return { error: err.message || "Failed to update branch override." };
  }
};

/**
 * 4. Bulk Enable All Master Dishes for a Branch
 */
export const bulkEnableAllMasterDishesForBranch = async (kitchenId: string) => {
  try {
    await connectToDatabase();

    const dishes = await MenuItem.find({ isGlobalMaster: true, deletedAt: null });

    for (const dish of dishes) {
      if (!dish.branchPricing) dish.branchPricing = [];

      const existingIndex = dish.branchPricing.findIndex(
        (bp: any) => bp.kitchenId.toString() === kitchenId
      );

      if (existingIndex >= 0) {
        dish.branchPricing[existingIndex].isEnabled = true;
        dish.branchPricing[existingIndex].isAvailable = true;
      } else {
        dish.branchPricing.push({
          kitchenId,
          price: dish.price,
          isEnabled: true,
          isAvailable: true,
        });
      }
      await dish.save();
    }

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true, count: dishes.length };
  } catch (err: any) {
    console.error("bulkEnableAllMasterDishesForBranch error:", err);
    return { error: err.message || "Failed to bulk enable dishes." };
  }
};

/**
 * 5. Bulk Disable All Master Dishes for a Branch
 */
export const bulkDisableAllMasterDishesForBranch = async (kitchenId: string) => {
  try {
    await connectToDatabase();

    const dishes = await MenuItem.find({ isGlobalMaster: true, deletedAt: null });

    for (const dish of dishes) {
      if (!dish.branchPricing) dish.branchPricing = [];

      const existingIndex = dish.branchPricing.findIndex(
        (bp: any) => bp.kitchenId.toString() === kitchenId
      );

      if (existingIndex >= 0) {
        dish.branchPricing[existingIndex].isEnabled = false;
      } else {
        dish.branchPricing.push({
          kitchenId,
          price: dish.price,
          isEnabled: false,
          isAvailable: true,
        });
      }
      await dish.save();
    }

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true, count: dishes.length };
  } catch (err: any) {
    console.error("bulkDisableAllMasterDishesForBranch error:", err);
    return { error: err.message || "Failed to bulk disable dishes." };
  }
};

/**
 * 6. Bulk Reset Branch Prices to Master Catalog Base Prices
 */
export const bulkResetBranchPricesToMaster = async (kitchenId: string) => {
  try {
    await connectToDatabase();

    const dishes = await MenuItem.find({ isGlobalMaster: true, deletedAt: null });

    for (const dish of dishes) {
      if (!dish.branchPricing) continue;

      const existingIndex = dish.branchPricing.findIndex(
        (bp: any) => bp.kitchenId.toString() === kitchenId
      );

      if (existingIndex >= 0) {
        dish.branchPricing[existingIndex].price = dish.price;
        await dish.save();
      }
    }

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true, count: dishes.length };
  } catch (err: any) {
    console.error("bulkResetBranchPricesToMaster error:", err);
    return { error: err.message || "Failed to reset prices." };
  }
};

/**
 * 7. Sync / Copy all Chinchwad and Signature dishes into Universal Master Catalog
 */
export const syncUniversalCatalog = async () => {
  return seedDatabase();
};

/**
 * 8. Legacy single-item addition
 */
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
  return addMasterDish({
    name: formData.name,
    description: formData.description,
    price: formData.price,
    categoryId: formData.categoryId,
    isVeg: formData.isVeg,
    tags: formData.tags,
    images: formData.images,
  });
};

/**
 * 9. Update Master Dish General Availability
 */
export const updateMenuItemAvailability = async (id: string, isAvailable: boolean) => {
  try {
    await connectToDatabase();
    await MenuItem.findByIdAndUpdate(id, { isAvailable });
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    console.error("updateMenuItemAvailability error:", err);
    return { error: "Failed to update item." };
  }
};

/**
 * 10. Delete a Dish
 */
export const deleteMenuItem = async (id: string) => {
  try {
    await connectToDatabase();
    await MenuItem.findByIdAndDelete(id);
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true };
  } catch (err: any) {
    console.error("deleteMenuItem error:", err);
    return { error: "Failed to delete item." };
  }
};

/**
 * 11. Get form data (kitchens & categories)
 */
export const getMenuFormData = async () => {
  await connectToDatabase();
  Category.modelName;
  Kitchen.modelName;

  const [kitchens, categories] = await Promise.all([
    Kitchen.find({ status: "active", deletedAt: null }).select("name _id code area").lean(),
    Category.find({ deletedAt: null }).select("name _id").lean(),
  ]);

  return {
    kitchens: kitchens.map((k: any) => ({
      id: k._id.toString(),
      name: k.name,
      code: k.code,
      area: k.area,
    })),
    categories: categories.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
    })),
  };
};
