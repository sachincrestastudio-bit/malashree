import { connectToDatabase } from "../../database/mongoose";
import { OrderLifecycleService } from "../OrderLifecycleService";
import { Order } from "../../models/Order";
import { requireKitchenAccess } from "../../actions/kitchen/auth";

export class KitchenOrderService {
  /**
   * Updates an order status, ensuring the kitchen only modifies its own orders.
   */
  static async updateOrderStatus(orderId: string, newStatus: string) {
    await connectToDatabase();
    const user = await requireKitchenAccess();

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const kitchenIdStr = order.kitchen ? order.kitchen.toString() : order.kitchenId?.toString();
    if (kitchenIdStr !== user.kitchenId) {
      throw new Error("Forbidden: Order belongs to a different kitchen");
    }

    // Use the existing Phase 7 lifecycle service for strict validations & audit logging
    const updatedOrder = await OrderLifecycleService.updateStatus(
      orderId,
      user.kitchenId,
      newStatus,
      user.id,
      "kitchen_staff",
      "127.0.0.1",
      `Kitchen staff updated status to ${newStatus}`
    );

    return JSON.parse(JSON.stringify(updatedOrder));
  }
}
