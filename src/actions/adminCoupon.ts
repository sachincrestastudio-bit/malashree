"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Coupon } from "@/models/Coupon";
import { Kitchen } from "@/models/Kitchen";
import { revalidatePath } from "next/cache";

export const createCoupon = async (data: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  expiry: string;
  usageLimit?: number;
  kitchenRestriction?: string[];
  status?: "active" | "disabled";
}) => {
  try {
    await connectToDatabase();

    if (!data.code || !data.code.trim()) {
      return { error: "Coupon code is required." };
    }
    if (!data.discountValue || data.discountValue <= 0) {
      return { error: "Please enter a valid discount value greater than 0." };
    }
    if (!data.expiry) {
      return { error: "Expiry date is required." };
    }

    const cleanCode = data.code.trim().toUpperCase();

    const existing = await Coupon.findOne({
      code: cleanCode,
      deletedAt: null,
    });

    if (existing) {
      return { error: `A coupon with code "${cleanCode}" already exists.` };
    }

    await Coupon.create({
      code: cleanCode,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : 0,
      maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
      expiry: new Date(data.expiry),
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      kitchenRestriction: data.kitchenRestriction && data.kitchenRestriction.length > 0 ? data.kitchenRestriction : [],
      status: data.status || "active",
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    console.error("createCoupon error:", err);
    return { error: "Failed to create coupon." };
  }
};

export const updateCoupon = async (
  id: string,
  data: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minimumOrder?: number;
    maximumDiscount?: number;
    expiry: string;
    usageLimit?: number;
    kitchenRestriction?: string[];
    status?: "active" | "disabled" | "expired";
  }
) => {
  try {
    await connectToDatabase();

    if (!data.code || !data.code.trim()) {
      return { error: "Coupon code is required." };
    }
    if (!data.discountValue || data.discountValue <= 0) {
      return { error: "Please enter a valid discount value greater than 0." };
    }

    const cleanCode = data.code.trim().toUpperCase();

    const existing = await Coupon.findOne({
      _id: { $ne: id },
      code: cleanCode,
      deletedAt: null,
    });

    if (existing) {
      return { error: `Another coupon with code "${cleanCode}" already exists.` };
    }

    await Coupon.findByIdAndUpdate(id, {
      code: cleanCode,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      minimumOrder: data.minimumOrder ? Number(data.minimumOrder) : 0,
      maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
      expiry: new Date(data.expiry),
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      kitchenRestriction: data.kitchenRestriction && data.kitchenRestriction.length > 0 ? data.kitchenRestriction : [],
      status: data.status || "active",
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    console.error("updateCoupon error:", err);
    return { error: "Failed to update coupon." };
  }
};

export const toggleCouponStatus = async (id: string, status: "active" | "disabled") => {
  try {
    await connectToDatabase();
    await Coupon.findByIdAndUpdate(id, { status });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    console.error("toggleCouponStatus error:", err);
    return { error: "Failed to update status." };
  }
};

export const deleteCoupon = async (id: string) => {
  try {
    await connectToDatabase();
    await Coupon.findByIdAndUpdate(id, { deletedAt: new Date(), status: "disabled" });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    console.error("deleteCoupon error:", err);
    return { error: "Failed to delete coupon." };
  }
};
