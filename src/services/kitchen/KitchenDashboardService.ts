import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { Kitchen } from "../../models/Kitchen";
import mongoose from "mongoose";

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

    const isObjectId = mongoose.Types.ObjectId.isValid(kitchenId);
    const kitchen = isObjectId ? await Kitchen.findById(kitchenId).lean() : await Kitchen.findOne({ code: kitchenId }).lean();
    
    const targetKitchenId = kitchen ? (kitchen as any)._id : kitchenId;

    const kitchenMatch = {
      $or: [
        { kitchen: targetKitchenId },
        { kitchenId: targetKitchenId },
        { kitchenName: kitchen ? (kitchen as any).name : kitchenId },
      ],
    };

    const todaysOrders = await Order.find({
      ...kitchenMatch,
      createdAt: { $gte: todayStart, $lte: todayEnd },
      orderStatus: { $ne: "cancelled" },
    }).lean();

    const todaysRevenue = todaysOrders.reduce((sum: number, order: any) => sum + (order.grandTotal || 0), 0);
    const completedOrders = todaysOrders.filter(
      (o: any) => o.orderStatus === "delivered" || o.orderStatus === "ready",
    ).length;

    const pendingOrders = await Order.countDocuments({ ...kitchenMatch, orderStatus: "placed" });
    const preparingOrders = await Order.countDocuments({ ...kitchenMatch, orderStatus: "preparing" });
    const readyOrders = await Order.countDocuments({ ...kitchenMatch, orderStatus: "ready" });

    // Compute average prep time if completed orders exist
    let avgPrepMinutes = 15;
    if (completedOrders > 0) {
      let totalMins = 0;
      let count = 0;
      todaysOrders.forEach((o: any) => {
        if (o.actualReadyTime && o.createdAt) {
          const diffMins = Math.round((new Date(o.actualReadyTime).getTime() - new Date(o.createdAt).getTime()) / 60000);
          if (diffMins > 0 && diffMins < 180) {
            totalMins += diffMins;
            count++;
          }
        }
      });
      if (count > 0) {
        avgPrepMinutes = Math.round(totalMins / count);
      }
    }

    return {
      kitchenName: kitchen ? (kitchen as any).name : "Kitchen Branch",
      kitchenStatus: (kitchen as any)?.isActive !== false ? "Open" : "Closed",
      todaysRevenue,
      todaysOrders: todaysOrders.length,
      completedOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      avgPrepTime: `${avgPrepMinutes} mins`,
    };
  }
}
