import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const PurchaseOrderSchema = new Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    items: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
        quantity: { type: Number, required: true, min: 0 },
        costPerUnit: { type: Number, required: true, min: 0 },
        totalCost: { type: Number, required: true, min: 0 },
      },
    ],
    totalCost: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "received", "cancelled"], default: "pending" },
    expectedDeliveryDate: { type: Date },
    receivedAt: { type: Date },
  },
  { timestamps: true },
);

PurchaseOrderSchema.index({ kitchenId: 1 });
PurchaseOrderSchema.index({ supplierId: 1 });
PurchaseOrderSchema.index({ poNumber: 1 });

export const PurchaseOrder = models.PurchaseOrder || model("PurchaseOrder", PurchaseOrderSchema);
