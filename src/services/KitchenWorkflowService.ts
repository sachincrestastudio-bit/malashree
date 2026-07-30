import { connectToDatabase } from "../database/mongoose";
import { Order } from "../models/Order";

export class KitchenWorkflowService {
  /**
   * Retrieves active orders for a given kitchen.
   * Active orders are those that are not cancelled or delivered.
   */
  static async getActiveOrders(kitchenId: string) {
    await connectToDatabase();

    return Order.find({
      kitchen: kitchenId,
      orderStatus: { $nin: ["delivered", "cancelled"] },
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  /**
   * Retrieves all orders (history) for a kitchen with pagination.
   */
  static async getOrderHistory(kitchenId: string, limit = 50, skip = 0) {
    await connectToDatabase();

    return Order.find({ kitchen: kitchenId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}
