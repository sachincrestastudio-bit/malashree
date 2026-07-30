"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Category } from "@/models/Category";
import { Kitchen } from "@/models/Kitchen";
import { MenuItem } from "@/models/MenuItem";
import AdminCategoriesClient from "./AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  await connectToDatabase();

  // Touch models to ensure Mongoose registration
  Kitchen.modelName;
  MenuItem.modelName;

  const [rawCategories, rawKitchens] = await Promise.all([
    Category.find({ deletedAt: null }).populate("kitchenId", "name code").sort({ name: 1 }).lean(),
    Kitchen.find({ deletedAt: null, status: "active" }).sort({ name: 1 }).lean(),
  ]);

  // Aggregate dish counts per category
  const categoryIds = rawCategories.map((c: any) => c._id);
  const dishCounts = await MenuItem.aggregate([
    { $match: { category: { $in: categoryIds }, deletedAt: null } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap: Record<string, number> = {};
  dishCounts.forEach((c: any) => {
    countMap[c._id.toString()] = c.count;
  });

  const categories = rawCategories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    description: c.description || "",
    kitchenId: c.kitchenId?._id?.toString() || "",
    kitchenName: c.kitchenId?.name || "Unknown Kitchen",
    kitchenCode: c.kitchenId?.code || "",
    dishCount: countMap[c._id.toString()] || 0,
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "-",
  }));

  const kitchens = rawKitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
  }));

  return <AdminCategoriesClient categories={categories} kitchens={kitchens} />;
}
