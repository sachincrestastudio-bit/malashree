"use server";

import { connectToDatabase } from "@/database/mongoose";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import { Kitchen } from "@/models/Kitchen";
import AdminMenuClient from "./AdminMenuClient";

export default async function AdminMenuPage() {
  await connectToDatabase();

  // Touch models to prevent tree-shaking
  Category.modelName;
  Kitchen.modelName;

  const [rawItems, kitchens, categories] = await Promise.all([
    MenuItem.find({ deletedAt: null })
      .populate("category", "name")
      .populate("kitchenId", "name")
      .sort({ name: 1 })
      .lean(),
    Kitchen.find({ status: "active", deletedAt: null }).select("name _id code area").lean(),
    Category.find({ deletedAt: null }).select("name _id").lean(),
  ]);

  const items = rawItems.map((item: any) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description || "",
    price: item.price,
    image: item.images?.[0] || "",
    isVeg: item.isVeg !== undefined ? item.isVeg : true,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    isGlobalMaster: item.isGlobalMaster !== undefined ? item.isGlobalMaster : true,
    rating: item.rating || 0,
    tag: item.tags?.[0] || "",
    kitchenName: item.kitchenId?.name || "All Branches (Master)",
    categoryName: item.category?.name || "Uncategorized",
    kitchenId: item.kitchenId?._id?.toString() || "",
    categoryId: item.category?._id?.toString() || "",
    branchPricing: (item.branchPricing || []).map((bp: any) => ({
      kitchenId: bp.kitchenId?.toString(),
      price: bp.price,
      isAvailable: bp.isAvailable !== undefined ? bp.isAvailable : true,
      isEnabled: bp.isEnabled !== undefined ? bp.isEnabled : true,
    })),
  }));

  const serializedKitchens = kitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
    area: k.area,
  }));

  const serializedCategories = categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  return (
    <AdminMenuClient
      items={items}
      kitchens={serializedKitchens}
      categories={serializedCategories}
    />
  );
}
