"use server";

import { connectToDatabase } from "@/database/mongoose";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import { Kitchen } from "@/models/Kitchen";
import AdminMenuClient from "./AdminMenuClient";

export default async function AdminMenuPage() {
  await connectToDatabase();

  // Touch models to prevent tree-shaking MissingSchemaError
  Category.modelName;
  Kitchen.modelName;

  const [rawItems, kitchens, categories] = await Promise.all([
    MenuItem.find()
      .populate("category", "name")
      .populate("kitchenId", "name")
      .sort({ name: 1 })
      .lean(),
    Kitchen.find({ status: "active" }).select("name _id").lean(),
    Category.find().select("name _id kitchenId").lean(),
  ]);

  const items = rawItems.map((item: any) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description || "",
    price: item.price,
    image: item.images?.[0] || "",
    isVeg: item.isVeg,
    isAvailable: item.isAvailable,
    rating: item.rating || 0,
    tag: item.tags?.[0] || "",
    kitchenName: item.kitchenId?.name || "Global",
    categoryName: item.category?.name || "-",
    kitchenId: item.kitchenId?._id?.toString() || "",
    categoryId: item.category?._id?.toString() || "",
  }));

  const serializedKitchens = kitchens.map((k: any) => ({ id: k._id.toString(), name: k.name }));
  const serializedCategories = categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    kitchenId: c.kitchenId?.toString() || "",
  }));

  return (
    <AdminMenuClient
      items={items}
      kitchens={serializedKitchens}
      categories={serializedCategories}
    />
  );
}
