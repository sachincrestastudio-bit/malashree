import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { DriverProfile } from "../../models/DriverProfile";

export class DeliveryDashboardService {
  /**
   * Retrieves high-level metrics for the driver's dashboard.
   */
  static async getDashboardMetrics(driverId: string) {
    await connectToDatabase();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const profile = await DriverProfile.findOne({ user: driverId }).lean();
    if (!profile) throw new Error("Driver profile not found");

    const todaysOrders = await Order.find({
      driverId,
      createdAt: { $gte: todayStart },
    }).lean();

    const pendingPickups = todaysOrders.filter((o) => o.orderStatus === "ready").length;
    const activeDeliveries = todaysOrders.filter(
      (o) => o.orderStatus === "out_for_delivery",
    ).length;
    const completedDeliveries = todaysOrders.filter((o) => o.orderStatus === "delivered").length;
    const cancelledDeliveries = todaysOrders.filter((o) => o.orderStatus === "cancelled").length;

    return {
      driverName: profile.user.name,
      currentStatus: profile.isOnline ? "Online" : "Offline",
      todaysDeliveries: todaysOrders.length,
      pendingPickups,
      activeDeliveries,
      completedDeliveries,
      cancelledDeliveries,
      todaysEarnings: profile.todaysEarnings || 0,
      weeklyEarnings: profile.weeklyEarnings || 0,
      monthlyEarnings: profile.monthlyEarnings || 0,
      currentRating: profile.averageRating || 5.0,
    };
  }
}
