import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String }],
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Review = models.Review || model('Review', ReviewSchema);
