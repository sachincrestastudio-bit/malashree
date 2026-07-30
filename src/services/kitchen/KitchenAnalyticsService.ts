import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";

export class KitchenAnalyticsService {
  /**
   * Retrieves specific analytics for the assigned kitchen.
   */
  static async getKitchenEfficiency(kitchenId: string) {
    await connectToDatabase();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      kitchenId,
      createdAt: { $gte: thirtyDaysAgo },
      orderStatus: "delivered",
    }).lean();

    const cancelledOrders = await Order.countDocuments({
      kitchenId,
      createdAt: { $gte: thirtyDaysAgo },
      orderStatus: "cancelled",
    });

    const totalOrders = orders.length;
    const avgOrderValue =
      totalOrders > 0 ? orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) / totalOrders : 0;

    return {
      totalOrders,
      cancelledOrders,
      avgOrderValue,
      efficiencyScore:
        totalOrders > 0 ? ((totalOrders / (totalOrders + cancelledOrders)) * 100).toFixed(1) : 0,
    };
  }
}
