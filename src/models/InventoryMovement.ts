import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const InventoryMovementSchema = new Schema(
  {
    ingredientId: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    type: {
      type: String,
      enum: ["purchase", "consumption", "manual_adjustment", "waste", "spoilage", "return"],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    referenceId: { type: String }, // e.g. Order ID, Purchase Order ID
  },
  { timestamps: true },
);

InventoryMovementSchema.index({ ingredientId: 1 });
InventoryMovementSchema.index({ kitchenId: 1 });
InventoryMovementSchema.index({ createdAt: -1 });

export const InventoryMovement =
  models.InventoryMovement || model("InventoryMovement", InventoryMovementSchema);
