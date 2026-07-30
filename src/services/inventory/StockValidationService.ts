import { connectToDatabase } from "../../database/mongoose";
import { RecipeService } from "./RecipeService";
import { Ingredient } from "../../models/Ingredient";

export class StockValidationService {
  /**
   * Pre-checkout validation to ensure stock exists for all items in the cart.
   * Throws an error if insufficient stock.
   */
  static async validateOrderStock(kitchenId: string, items: any[]) {
    await connectToDatabase();

    // Map required totals per ingredient ID
    const requiredStock = new Map<string, number>();

    for (const item of items) {
      const recipe = await RecipeService.getRecipeForMenuItem(item.dishId, kitchenId);
      if (!recipe) continue;

      for (const reqIngredient of recipe.ingredients) {
        const ingId = reqIngredient.ingredientId._id
          ? reqIngredient.ingredientId._id.toString()
          : reqIngredient.ingredientId.toString();

        const totalNeeded = reqIngredient.quantity * item.quantity;
        const currentReq = requiredStock.get(ingId) || 0;
        requiredStock.set(ingId, currentReq + totalNeeded);
      }
    }

    // Check against current stock
    for (const [ingredientId, amountNeeded] of requiredStock.entries()) {
      const ingredient = await Ingredient.findById(ingredientId);
      if (!ingredient) {
        throw new Error(`Critical Error: Ingredient ${ingredientId} not found`);
      }

      const available = ingredient.currentQuantity - ingredient.reservedQuantity;
      if (available < amountNeeded) {
        throw new Error(`Insufficient stock for ingredient: ${ingredient.name}`);
      }
    }

    return true; // Validated
  }
}
