import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const RecipeSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    ingredients: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true },
);

RecipeSchema.index({ menuItemId: 1, kitchenId: 1 }, { unique: true });
RecipeSchema.index({ kitchenId: 1 });

export const Recipe = models.Recipe || model("Recipe", RecipeSchema);
