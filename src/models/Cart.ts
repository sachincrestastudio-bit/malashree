import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CartItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    items: [CartItemSchema],
    couponCode: { type: String, default: null },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "abandoned", "converted"], default: "active" },
  },
  { timestamps: true },
);

CartSchema.index({ userId: 1 });
CartSchema.index({ kitchenId: 1 });

export const Cart = models.Cart || model("Cart", CartSchema);
