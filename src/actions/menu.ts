"use server";

import { MenuService } from "../services/MenuService";
import { CategoryService } from "../services/CategoryService";
import { getAssignedKitchenId, setAssignedKitchen } from "./kitchen";
import { Kitchen } from "../models/Kitchen";
import { connectToDatabase } from "../database/mongoose";
import mongoose from "mongoose";

// Helper to validate and fetch kitchen ID for menu operations
const getKitchenContext = async (requestedBranchCode?: string) => {
  await connectToDatabase();

  if (requestedBranchCode) {
    const isObjectId = mongoose.Types.ObjectId.isValid(requestedBranchCode);
    const kitchen = (await Kitchen.findOne({
      $or: [
        { code: new RegExp(`^${requestedBranchCode}$`, "i") },
        ...(isObjectId ? [{ _id: requestedBranchCode }] : []),
      ],
      status: "active",
      deletedAt: null,
    }).lean()) as any;

    if (kitchen) {
      return kitchen._id.toString();
    }
  }

  // Check stored cookie / user assigned kitchen
  let kitchenId = await getAssignedKitchenId();

  // Fallback to default active kitchen if no cookie is set
  if (!kitchenId) {
    const defaultKitchen = (await Kitchen.findOne({ status: "active", deletedAt: null })
      .sort({ name: 1 })
      .lean()) as any;

    if (defaultKitchen) {
      kitchenId = defaultKitchen._id.toString();
      // Silently set cookie to default kitchen so user has an active session
      await setAssignedKitchen(defaultKitchen.code);
    }
  }

  if (!kitchenId) {
    throw new Error("No active kitchen branch found.");
  }

  return kitchenId;
};

// Map MongoDB documents to the expected frontend type
const mapMenuItem = (d: any) => ({
  id: d._id.toString(),
  name: d.name,
  desc: d.description,
  price: d.price,
  image: d.images?.[0] || "",
  veg: d.isVeg ?? true,
  rating: d.rating || 4.8,
  category: d.category?.name || "Uncategorized",
  tag: d.tags?.[0] || undefined,
});

export const getKitchenMenu = async (requestedBranchCode?: string) => {
  try {
    const kitchenId = await getKitchenContext(requestedBranchCode);
    const items = await MenuService.getMenuByKitchen(kitchenId);
    return items.map(mapMenuItem);
  } catch (err) {
    console.error("getKitchenMenu error:", err);
    return [];
  }
};

export const getKitchenCategories = async (requestedBranchCode?: string) => {
  try {
    const kitchenId = await getKitchenContext(requestedBranchCode);
    const categories = await CategoryService.getCategoriesByKitchen(kitchenId);
    return categories.map((c) => c.name);
  } catch (err) {
    console.error("getKitchenCategories error:", err);
    return [];
  }
};

export const searchKitchenMenu = async (query: string, requestedBranchCode?: string) => {
  try {
    if (!query) return await getKitchenMenu(requestedBranchCode);

    const kitchenId = await getKitchenContext(requestedBranchCode);
    const items = await MenuService.searchMenu(kitchenId, query);
    return items.map(mapMenuItem);
  } catch (err) {
    console.error("searchKitchenMenu error:", err);
    return [];
  }
};
