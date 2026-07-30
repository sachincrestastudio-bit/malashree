import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({}, { timestamps: true });

export const OrderItem = models.OrderItem || model("OrderItem", OrderItemSchema);
