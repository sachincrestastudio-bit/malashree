"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import AdminKitchensClient from "./AdminKitchensClient";

export default async function AdminKitchensPage() {
  await connectToDatabase();

  // Touch MenuItem + Category models so populate works
  MenuItem.modelName;
  Category.modelName;

  const rawKitchens = await Kitchen.find({ deletedAt: null })
    .sort({ name: 1 })
    .lean();

  // Get per-kitchen menu item counts in one query
  const ids = rawKitchens.map((k: any) => k._id);
  const counts = await MenuItem.aggregate([
    { $match: { kitchenId: { $in: ids }, deletedAt: null } },
    { $group: { _id: "$kitchenId", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  counts.forEach((c: any) => { countMap[c._id.toString()] = c.count; });

  const kitchens = rawKitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
    address: k.address || "",
    status: k.status as "active" | "inactive" | "maintenance",
    deliveryRadius: k.deliveryRadius ?? 5000,
    preparationTime: k.preparationTime ?? 30,
    latitude: k.location?.coordinates?.[1] ?? 0,
    longitude: k.location?.coordinates?.[0] ?? 0,
    menuItemCount: countMap[k._id.toString()] ?? 0,
    createdAt: k.createdAt ? new Date(k.createdAt).toLocaleDateString("en-IN") : "-",
  }));

  return <AdminKitchensClient kitchens={kitchens} />;
}
