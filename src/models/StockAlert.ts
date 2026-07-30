import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const StockAlertSchema = new Schema(
  {
    ingredientId: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    type: { type: String, enum: ["warning", "critical", "out_of_stock"], required: true },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

StockAlertSchema.index({ kitchenId: 1, isResolved: 1 });
StockAlertSchema.index({ ingredientId: 1 });

export const StockAlert = models.StockAlert || model("StockAlert", StockAlertSchema);
