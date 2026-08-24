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

  return kitchenId || requestedBranchCode || "";
};

// Map MongoDB documents or MenuService objects to the expected frontend type
const mapMenuItem = (d: any) => ({
  id: (d._id || d.id || "").toString(),
  name: d.name,
  desc: d.description || d.desc || "",
  price: Number(d.price) || 0,
  image:
    (d.images && d.images[0]) ||
    d.image ||
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
  veg: d.isVeg !== undefined ? d.isVeg : (d.veg !== undefined ? d.veg : true),
  rating: d.rating || 4.8,
  category:
    typeof d.category === "object"
      ? d.category?.name || "Main Course"
      : d.category || "Main Course",
  tag: (d.tags && d.tags[0]) || d.tag || undefined,
  time: d.time || "25 mins",
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
