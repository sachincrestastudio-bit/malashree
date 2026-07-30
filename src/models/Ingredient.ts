import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, enum: ["g", "ml", "pcs"], required: true },

    currentQuantity: { type: Number, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },

    minQuantity: { type: Number, default: 0 },
    maxQuantity: { type: Number, default: 0 },

    costPrice: { type: Number, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Create unique index so SKU is unique per kitchen
IngredientSchema.index({ sku: 1, kitchenId: 1 }, { unique: true });
IngredientSchema.index({ kitchenId: 1 });

export const Ingredient = models.Ingredient || model("Ingredient", IngredientSchema);
