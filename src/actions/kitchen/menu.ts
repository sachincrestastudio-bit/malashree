"use server";

import { connectToDatabase } from "@/database/mongoose";
import { MenuItem } from "@/models/MenuItem";
import { requireKitchenAccess } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Updates the price override of a specific menu item for a designated kitchen branch.
 */
export async function updateBranchDishPrice(
  dishId: string,
  price: number,
  requestedKitchenId?: string
) {
  try {
    const user = await requireKitchenAccess(requestedKitchenId);
    await connectToDatabase();

    const targetKitchenId = user.kitchenId;
    if (!targetKitchenId) {
      return { error: "No kitchen branch identified." };
    }

    if (isNaN(price) || price < 0) {
      return { error: "Please enter a valid price (₹0 or higher)." };
    }

    const dish = await MenuItem.findById(dishId);
    if (!dish) {
      return { error: "Dish not found." };
    }

    if (!dish.branchPricing) {
      dish.branchPricing = [];
    }

    const existingIndex = dish.branchPricing.findIndex(
      (bp: any) => bp.kitchenId?.toString() === targetKitchenId.toString()
    );

    if (existingIndex >= 0) {
      dish.branchPricing[existingIndex].price = Number(price);
    } else {
      dish.branchPricing.push({
        kitchenId: targetKitchenId,
        price: Number(price),
        isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
        isEnabled: true,
      });
    }

    await dish.save();

    try {
      revalidatePath("/kitchen/menu");
      revalidatePath("/kitchen/dashboard");
      revalidatePath("/menu");
      revalidatePath("/branches");
      revalidatePath("/admin/menu");
    } catch (e) {}

    return { success: true, price: Number(price) };
  } catch (err: any) {
    console.error("updateBranchDishPrice Error:", err);
    return { error: err.message || "Failed to update branch price." };
  }
}

/**
 * Resets the branch price override back to the universal Master Menu base price.
 */
export async function resetBranchDishPrice(
  dishId: string,
  requestedKitchenId?: string
) {
  try {
    const user = await requireKitchenAccess(requestedKitchenId);
    await connectToDatabase();

    const targetKitchenId = user.kitchenId;
    if (!targetKitchenId) {
      return { error: "No kitchen branch identified." };
    }

    const dish = await MenuItem.findById(dishId);
    if (!dish) {
      return { error: "Dish not found." };
    }

    if (!dish.branchPricing) {
      dish.branchPricing = [];
    }

    const existingIndex = dish.branchPricing.findIndex(
      (bp: any) => bp.kitchenId?.toString() === targetKitchenId.toString()
    );

    if (existingIndex >= 0) {
      dish.branchPricing[existingIndex].price = Number(dish.price);
    } else {
      dish.branchPricing.push({
        kitchenId: targetKitchenId,
        price: Number(dish.price),
        isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
        isEnabled: true,
      });
    }

    await dish.save();

    try {
      revalidatePath("/kitchen/menu");
      revalidatePath("/kitchen/dashboard");
      revalidatePath("/menu");
      revalidatePath("/branches");
      revalidatePath("/admin/menu");
    } catch (e) {}

    return { success: true, price: Number(dish.price) };
  } catch (err: any) {
    console.error("resetBranchDishPrice Error:", err);
    return { error: err.message || "Failed to reset branch price." };
  }
}

/**
 * Toggles stock availability specifically for the target kitchen branch.
 */
export async function toggleBranchDishStock(
  dishId: string,
  isAvailable: boolean,
  requestedKitchenId?: string
) {
  try {
    const user = await requireKitchenAccess(requestedKitchenId);
    await connectToDatabase();

    const targetKitchenId = user.kitchenId;
    if (!targetKitchenId) {
      return { error: "No kitchen branch identified." };
    }

    const dish = await MenuItem.findById(dishId);
    if (!dish) {
      return { error: "Dish not found." };
    }

    if (!dish.branchPricing) {
      dish.branchPricing = [];
    }

    const existingIndex = dish.branchPricing.findIndex(
      (bp: any) => bp.kitchenId?.toString() === targetKitchenId.toString()
    );

    if (existingIndex >= 0) {
      dish.branchPricing[existingIndex].isAvailable = isAvailable;
    } else {
      dish.branchPricing.push({
        kitchenId: targetKitchenId,
        price: dish.price,
        isAvailable,
        isEnabled: true,
      });
    }

    await dish.save();

    try {
      revalidatePath("/kitchen/menu");
      revalidatePath("/kitchen/dashboard");
      revalidatePath("/menu");
      revalidatePath("/branches");
      revalidatePath("/admin/menu");
    } catch (e) {}

    return { success: true, isAvailable };
  } catch (err: any) {
    console.error("toggleBranchDishStock Error:", err);
    return { error: err.message || "Failed to update availability." };
  }
}
