import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

CategorySchema.index({ kitchenId: 1 });

export const Category = models.Category || model("Category", CategorySchema);
