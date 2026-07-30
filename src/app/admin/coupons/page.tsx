"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Coupon } from "@/models/Coupon";
import { Kitchen } from "@/models/Kitchen";
import AdminCouponsClient from "./AdminCouponsClient";

export default async function AdminCouponsPage() {
  await connectToDatabase();

  Kitchen.modelName; // register Kitchen model for populate

  const [rawCoupons, rawKitchens] = await Promise.all([
    Coupon.find({ deletedAt: null }).populate("kitchenRestriction", "name code").sort({ createdAt: -1 }).lean(),
    Kitchen.find({ deletedAt: null, status: "active" }).sort({ name: 1 }).lean(),
  ]);

  const now = new Date();

  const coupons = rawCoupons.map((c: any) => {
    const expiryDate = c.expiry ? new Date(c.expiry) : null;
    const isExpired = expiryDate ? expiryDate < now : false;

    const kitchenRestrictions = (c.kitchenRestriction || []).map((k: any) =>
      typeof k === "object" ? k._id.toString() : k.toString()
    );

    const kitchenNames = (c.kitchenRestriction || [])
      .map((k: any) => (typeof k === "object" ? k.name : ""))
      .filter(Boolean);

    return {
      id: c._id.toString(),
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minimumOrder: c.minimumOrder || 0,
      maximumDiscount: c.maximumDiscount || undefined,
      expiry: c.expiry ? new Date(c.expiry).toISOString() : "",
      expiryFormatted: expiryDate ? expiryDate.toLocaleDateString("en-IN") : "-",
      usageLimit: c.usageLimit || undefined,
      usedCount: c.usedCount || 0,
      kitchenRestriction: kitchenRestrictions,
      kitchenNames,
      status: c.status || "active",
      isExpired,
    };
  });

  const kitchens = rawKitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
  }));

  return <AdminCouponsClient coupons={coupons} kitchens={kitchens} />;
}
