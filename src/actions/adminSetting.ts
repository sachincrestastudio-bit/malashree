"use server";

import { connectToDatabase } from "@/database/mongoose";
import { SystemSetting } from "@/models/SystemSetting";
import { revalidatePath } from "next/cache";

export const getSystemSettings = async () => {
  try {
    await connectToDatabase();
    let settings = await SystemSetting.findOne().lean();

    if (!settings) {
      settings = await SystemSetting.create({
        brandName: "Malashree Pure Veg",
        supportEmail: "support@malashree.in",
        supportPhone: "+91 99999 88888",
        taxPercentage: 5,
        packagingCharge: 15,
        platformFee: 5,
        defaultDeliveryFee: 34,
        freeDeliveryThreshold: 500,
        maxDeliveryRadiusKm: 10,
        autoAssignDrivers: true,
        pidgeIntegrationActive: true,
        cloudinaryCloudName: "djoklzpse",
        cloudinaryUploadPreset: "malashree_dishes",
        isStoreOnline: true,
        maintenanceMode: false,
      });
    }

    return JSON.parse(JSON.stringify(settings));
  } catch (err: any) {
    console.error("getSystemSettings error:", err);
    return null;
  }
};

export const updateSystemSettings = async (data: {
  brandName?: string;
  supportEmail?: string;
  supportPhone?: string;
  taxPercentage?: number;
  packagingCharge?: number;
  platformFee?: number;
  defaultDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  maxDeliveryRadiusKm?: number;
  autoAssignDrivers?: boolean;
  pidgeIntegrationActive?: boolean;
  pidgeApiKey?: string;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  isStoreOnline?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}) => {
  try {
    await connectToDatabase();

    const existing = await SystemSetting.findOne();
    if (existing) {
      await SystemSetting.findByIdAndUpdate(existing._id, data);
    } else {
      await SystemSetting.create(data);
    }

    try {
      revalidatePath("/admin/settings");
      revalidatePath("/cart");
      revalidatePath("/checkout");
      revalidatePath("/");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("updateSystemSettings error:", err);
    return { error: err.message || "Failed to save settings." };
  }
};
