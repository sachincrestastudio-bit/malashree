import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const OrderItemSchema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  dishName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  specialInstructions: { type: String }
}, { _id: false });

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kitchen: { type: Schema.Types.ObjectId, ref: 'Kitchen', required: true },
  kitchenName: { type: String, required: true },
  
  // Delivery Assignment
  driverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  pickedUpTime: { type: Date },
  deliveryDistance: { type: Number },
  
  // Snapshot of the address
  deliveryAddress: {
    label: { type: String, default: 'home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },

  items: [OrderItemSchema],
  
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  couponCode: { type: String, default: null },

  paymentMethod: { type: String, enum: ['card', 'cash', 'upi'], default: 'upi' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed' },
  
  timeline: [{
    status: { type: String, required: true },
    time: { type: Date, default: Date.now },
    updatedBy: { type: String }, // User ID or 'system'
    role: { type: String }, // 'customer', 'kitchen', 'admin', 'system'
    remarks: { type: String }
  }],
  
  estimatedReadyTime: { type: Date },
  actualReadyTime: { type: Date },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  specialInstructions: { type: String },
  deletedAt: { type: Date, default: null },
}, { timestamps: true, optimisticConcurrency: true });

OrderSchema.index({ customer: 1 });
OrderSchema.index({ kitchen: 1 });
OrderSchema.index({ orderNumber: 1 });

export const Order = models.Order || model('Order', OrderSchema);
