import { connectToDatabase } from "../../database/mongoose";
import { Recipe } from "../../models/Recipe";
import { MenuItem } from "../../models/MenuItem";
import { Ingredient } from "../../models/Ingredient";

export class RecipeService {
  /**
   * Gets the ingredients required for a specific menu item.
   */
  static async getRecipeForMenuItem(menuItemId: string, kitchenId: string) {
    await connectToDatabase();
    return await Recipe.findOne({ menuItemId, kitchenId })
      .populate("ingredients.ingredientId")
      .lean();
  }

  /**
   * Checks if all recipes for a kitchen have sufficient stock.
   * If a recipe cannot be fulfilled, the MenuItem is marked as unavailable.
   * If it can be fulfilled, it's marked as available.
   */
  static async evaluateMenuAvailability(kitchenId: string) {
    await connectToDatabase();

    const recipes = await Recipe.find({ kitchenId }).populate("ingredients.ingredientId");

    for (const recipe of recipes) {
      let isAvailable = true;

      for (const item of recipe.ingredients) {
        const ingredient = item.ingredientId as any;
        const availableStock = ingredient.currentQuantity - ingredient.reservedQuantity;

        if (availableStock < item.quantity) {
          isAvailable = false;
          break;
        }
      }

      // Update MenuItem availability for this kitchen
      await MenuItem.findByIdAndUpdate(recipe.menuItemId, { isAvailable });
    }
  }
}
