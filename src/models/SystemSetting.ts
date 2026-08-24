import { Schema, model, models } from "mongoose";

const SystemSettingSchema = new Schema(
  {
    brandName: { type: String, default: "Malashree Pure Veg" },
    supportEmail: { type: String, default: "support@malashree.in" },
    supportPhone: { type: String, default: "+91 99999 88888" },
    taxPercentage: { type: Number, default: 5 },
    packagingCharge: { type: Number, default: 15 },
    platformFee: { type: Number, default: 5 },
    defaultDeliveryFee: { type: Number, default: 34 },
    freeDeliveryThreshold: { type: Number, default: 500 },
    maxDeliveryRadiusKm: { type: Number, default: 10 },
    autoAssignDrivers: { type: Boolean, default: true },
    pidgeIntegrationActive: { type: Boolean, default: true },
    pidgeApiKey: { type: String, default: "pidge_live_key_malashree_prod" },
    cloudinaryCloudName: { type: String, default: "djoklzpse" },
    cloudinaryUploadPreset: { type: String, default: "malashree_dishes" },
    isStoreOnline: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: "We are currently upgrading our kitchens. We will be back online shortly!",
    },
  },
  { timestamps: true }
);

export const SystemSetting = models.SystemSetting || model("SystemSetting", SystemSettingSchema);
