import { connectToDatabase } from "../../database/mongoose";
import { StockAlert } from "../../models/StockAlert";

export class StockAlertService {
  /**
   * Checks stock levels against thresholds and generates alerts if needed.
   */
  static async evaluateStockLevel(ingredient: any) {
    await connectToDatabase();

    // Total usable stock is current - reserved
    const available = ingredient.currentQuantity - ingredient.reservedQuantity;

    let type = null;
    let message = "";

    if (available <= 0) {
      type = "out_of_stock";
      message = `Out of stock: ${ingredient.name}`;
    } else if (available <= ingredient.minQuantity / 2) {
      type = "critical";
      message = `Critical stock level for ${ingredient.name} (${available}${ingredient.unit} remaining)`;
    } else if (available <= ingredient.minQuantity) {
      type = "warning";
      message = `Low stock warning for ${ingredient.name} (${available}${ingredient.unit} remaining)`;
    }

    if (type) {
      // Create alert if one doesn't already exist for this type and ingredient
      const existingAlert = await StockAlert.findOne({
        ingredientId: ingredient._id,
        isResolved: false,
      });

      if (!existingAlert || existingAlert.type !== type) {
        if (existingAlert) {
          existingAlert.isResolved = true;
          await existingAlert.save();
        }

        await StockAlert.create({
          ingredientId: ingredient._id,
          kitchenId: ingredient.kitchenId,
          type,
          message,
        });
      }
    } else {
      // Resolve existing alerts if stock is healthy
      await StockAlert.updateMany(
        { ingredientId: ingredient._id, isResolved: false },
        { isResolved: true },
      );
    }
  }

  static async getAlertsByKitchen(kitchenId: string) {
    await connectToDatabase();
    return await StockAlert.find({ kitchenId, isResolved: false })
      .populate("ingredientId", "name sku unit")
      .sort({ createdAt: -1 })
      .lean();
  }
}
