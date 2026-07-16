import { Schema, model, models } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: { type: Number },
  expiry: { type: Date, required: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  kitchenRestriction: [{ type: Schema.Types.ObjectId, ref: 'Kitchen' }],
  status: { type: String, enum: ['active', 'expired', 'disabled'], default: 'active' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Coupon = models.Coupon || model('Coupon', CouponSchema);
