import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { Kitchen } from "../../models/Kitchen";

export class KitchenDashboardService {
  /**
   * Retrieves high-level metrics strictly for a specific kitchen.
   */
  static async getDashboardMetrics(kitchenId: string) {
    await connectToDatabase();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const kitchen = await Kitchen.findById(kitchenId).lean();
    if (!kitchen) throw new Error("Kitchen not found");

    const todaysOrders = await Order.find({
      kitchenId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
      orderStatus: { $ne: "cancelled" },
    });

    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const completedOrders = todaysOrders.filter(
      (o) => o.orderStatus === "delivered" || o.orderStatus === "ready",
    ).length;

    const pendingOrders = await Order.countDocuments({ kitchenId, orderStatus: "placed" });
    const preparingOrders = await Order.countDocuments({ kitchenId, orderStatus: "preparing" });
    const readyOrders = await Order.countDocuments({ kitchenId, orderStatus: "ready" });

    // Calculate Average Preparation Time (mocked logic or based on actual timeline diff)
    // For now we will just use a hardcoded value or simple average if timeline data exists.
    const avgPrepTime = "18 mins";

    return {
      kitchenStatus: kitchen.isActive ? "Open" : "Closed",
      todaysRevenue,
      todaysOrders: todaysOrders.length,
      completedOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      avgPrepTime,
    };
  }
}
