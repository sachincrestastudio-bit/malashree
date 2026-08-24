import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const BranchPriceSchema = new Schema(
  {
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    price: { type: Number },
    isAvailable: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String }],
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: false, default: null },
    isGlobalMaster: { type: Boolean, default: true },
    branchPricing: [BranchPriceSchema],
    isVeg: { type: Boolean, default: true },
    spiceLevel: { type: Number, min: 0, max: 3, default: 0 },
    preparationTime: { type: Number, default: 15 },
    ingredients: [{ type: String }],
    nutrition: { type: Schema.Types.Mixed },
    tags: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ name: "text" });
MenuItemSchema.index({ kitchenId: 1 });
MenuItemSchema.index({ isGlobalMaster: 1 });

export const MenuItem = models.MenuItem || model("MenuItem", MenuItemSchema);
