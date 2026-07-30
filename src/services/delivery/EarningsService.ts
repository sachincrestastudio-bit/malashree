import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { DriverProfile } from "../../models/DriverProfile";

export class EarningsService {
  /**
   * Retrieves the earnings history for a driver.
   */
  static async getEarnings(driverId: string) {
    await connectToDatabase();

    const profile = await DriverProfile.findOne({ user: driverId }).lean();

    // In a real application, you would calculate this based on a ledger of Delivery payouts.
    // For this prototype, we'll return the aggregated fields from the profile.

    return {
      todaysEarnings: profile?.todaysEarnings || 0,
      weeklyEarnings: profile?.weeklyEarnings || 0,
      monthlyEarnings: profile?.monthlyEarnings || 0,
      totalDeliveries: profile?.totalDeliveries || 0,
      averageRating: profile?.averageRating || 5.0,
      averageDeliveryTime: "24 mins", // Mocked derived metric
    };
  }

  /**
   * Retrieves paginated delivery history.
   */
  static async getDeliveryHistory(driverId: string, page = 1, limit = 20) {
    await connectToDatabase();
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      driverId,
      orderStatus: { $in: ["delivered", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("kitchen", "name")
      .lean();

    const total = await Order.countDocuments({
      driverId,
      orderStatus: { $in: ["delivered", "cancelled"] },
    });

    return {
      orders: JSON.parse(JSON.stringify(orders)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}
