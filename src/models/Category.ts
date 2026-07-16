import { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Category = models.Category || model('Category', CategorySchema);
