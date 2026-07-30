"use server";

import { connectToDatabase } from "@/database/mongoose";
import { KitchenOffer } from "@/models/KitchenOffer";
import { Kitchen } from "@/models/Kitchen";
import AdminOffersClient from "./AdminOffersClient";

export default async function AdminOffersPage() {
  await connectToDatabase();

  Kitchen.modelName; // register Kitchen model

  const [rawOffers, rawKitchens] = await Promise.all([
    KitchenOffer.find({ deletedAt: null }).populate("kitchenId", "name code").sort({ createdAt: -1 }).lean(),
    Kitchen.find({ deletedAt: null, status: "active" }).sort({ name: 1 }).lean(),
  ]);

  const offers = rawOffers.map((o: any) => ({
    id: o._id.toString(),
    kitchenId: o.kitchenId?._id?.toString() || "",
    kitchenName: o.kitchenId?.name || "Unknown Kitchen",
    code: o.code,
    title: o.title,
    sub: o.sub || "",
    active: o.active ?? true,
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "-",
  }));

  const kitchens = rawKitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
  }));

  return <AdminOffersClient offers={offers} kitchens={kitchens} />;
}
