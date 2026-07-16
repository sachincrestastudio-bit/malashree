import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kitchen: { type: Schema.Types.ObjectId, ref: 'Kitchen', required: true },
  deliveryAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    specialInstructions: { type: String }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'cash', 'upi'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed' },
  timeline: [{
    status: { type: String },
    time: { type: Date, default: Date.now }
  }],
  estimatedDeliveryTime: { type: Date },
  specialInstructions: { type: String },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

OrderSchema.index({ customer: 1 });
OrderSchema.index({ kitchen: 1 });
OrderSchema.index({ orderNumber: 1 });

export const Order = models.Order || model('Order', OrderSchema);
