import { connectToDatabase } from "../../database/mongoose";
import { Ingredient } from "../../models/Ingredient";
import { InventoryMovement } from "../../models/InventoryMovement";
import { RecipeService } from "./RecipeService";
import { StockAlertService } from "./StockAlertService";

export class InventoryService {
  /**
   * Manually adjust stock (e.g., waste, spoilage, or purchase delivery)
   * This instantly impacts currentQuantity.
   */
  static async adjustStock(
    ingredientId: string,
    kitchenId: string,
    quantityChange: number,
    type: "purchase" | "manual_adjustment" | "waste" | "spoilage" | "return",
    userId: string,
    reason?: string,
    referenceId?: string,
  ) {
    await connectToDatabase();

    const ingredient = await Ingredient.findOne({ _id: ingredientId, kitchenId });
    if (!ingredient) throw new Error("Ingredient not found in this kitchen");

    const previousQuantity = ingredient.currentQuantity;
    const newQuantity = previousQuantity + quantityChange;

    if (newQuantity < 0) throw new Error("Cannot reduce stock below 0");

    ingredient.currentQuantity = newQuantity;
    await ingredient.save();

    // Log movement
    await InventoryMovement.create({
      ingredientId,
      kitchenId,
      type,
      quantityChange,
      previousQuantity,
      newQuantity,
      reason,
      userId,
      referenceId,
    });

    // Evaluate alerts and menu availability
    await StockAlertService.evaluateStockLevel(ingredient);
    await RecipeService.evaluateMenuAvailability(kitchenId);

    return ingredient;
  }

  /**
   * Reserves stock when an order is placed.
   * Modifies reservedQuantity but leaves currentQuantity intact.
   */
  static async reserveStock(order: any) {
    await connectToDatabase();

    const kitchenId = order.kitchen.toString();

    for (const item of order.items) {
      const recipe = await RecipeService.getRecipeForMenuItem(item.dishId, kitchenId);
      if (!recipe) continue; // If no recipe exists, skip stock management for this item

      for (const reqIngredient of recipe.ingredients) {
        const totalNeeded = reqIngredient.quantity * item.quantity;

        const ingredient = await Ingredient.findOne({ _id: reqIngredient.ingredientId, kitchenId });
        if (ingredient) {
          ingredient.reservedQuantity += totalNeeded;
          await ingredient.save();
          await StockAlertService.evaluateStockLevel(ingredient);
        }
      }
    }

    await RecipeService.evaluateMenuAvailability(kitchenId);
  }

  /**
   * Deducts stock when preparation begins.
   * Reduces both currentQuantity and reservedQuantity. Logs as 'consumption'.
   */
  static async deductStock(order: any, userId: string) {
    await connectToDatabase();

    const kitchenId = order.kitchen.toString();

    for (const item of order.items) {
      const recipe = await RecipeService.getRecipeForMenuItem(item.dishId, kitchenId);
      if (!recipe) continue;

      for (const reqIngredient of recipe.ingredients) {
        const totalNeeded = reqIngredient.quantity * item.quantity;

        const ingredient = await Ingredient.findOne({ _id: reqIngredient.ingredientId, kitchenId });
        if (ingredient) {
          const previousQuantity = ingredient.currentQuantity;
          ingredient.currentQuantity = Math.max(0, ingredient.currentQuantity - totalNeeded);
          ingredient.reservedQuantity = Math.max(0, ingredient.reservedQuantity - totalNeeded);
          await ingredient.save();

          await InventoryMovement.create({
            ingredientId: ingredient._id,
            kitchenId,
            type: "consumption",
            quantityChange: -totalNeeded,
            previousQuantity,
            newQuantity: ingredient.currentQuantity,
            reason: "Order preparation",
            userId,
            referenceId: order._id.toString(),
          });

          await StockAlertService.evaluateStockLevel(ingredient);
        }
      }
    }

    await RecipeService.evaluateMenuAvailability(kitchenId);
  }

  /**
   * Releases reserved stock if an order is cancelled before preparation.
   */
  static async releaseStock(order: any) {
    await connectToDatabase();

    const kitchenId = order.kitchen.toString();

    for (const item of order.items) {
      const recipe = await RecipeService.getRecipeForMenuItem(item.dishId, kitchenId);
      if (!recipe) continue;

      for (const reqIngredient of recipe.ingredients) {
        const totalNeeded = reqIngredient.quantity * item.quantity;

        const ingredient = await Ingredient.findOne({ _id: reqIngredient.ingredientId, kitchenId });
        if (ingredient) {
          ingredient.reservedQuantity = Math.max(0, ingredient.reservedQuantity - totalNeeded);
          await ingredient.save();
          await StockAlertService.evaluateStockLevel(ingredient);
        }
      }
    }

    await RecipeService.evaluateMenuAvailability(kitchenId);
  }
}
