import { Schema, model, models } from 'mongoose';

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  kitchenAvailability: [{ type: Schema.Types.ObjectId, ref: 'Kitchen' }],
  isVeg: { type: Boolean, default: true },
  spiceLevel: { type: Number, min: 0, max: 3, default: 0 },
  preparationTime: { type: Number, default: 15 },
  ingredients: [{ type: String }],
  nutrition: { type: Schema.Types.Mixed },
  tags: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ name: 'text' });

export const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);
