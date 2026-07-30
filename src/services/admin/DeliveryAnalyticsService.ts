import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { AnalyticsCoreService } from "./AnalyticsCoreService";

export class DeliveryAnalyticsService {
  /**
   * Analyzes delivery times and performance.
   */
  static async getDeliveryPerformance(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "30d",
  ) {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);
    match.orderStatus = "delivered"; // Only analyze completed deliveries
    match.actualDeliveryTime = { $exists: true };
    match.actualReadyTime = { $exists: true };

    const pipeline = [
      { $match: match },
      {
        $project: {
          deliveryTimeMs: { $subtract: ["$actualDeliveryTime", "$actualReadyTime"] },
          prepTimeMs: { $subtract: ["$actualReadyTime", "$createdAt"] },
        },
      },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          avgDeliveryTimeMs: { $avg: "$deliveryTimeMs" },
          avgPrepTimeMs: { $avg: "$prepTimeMs" },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    if (result.length === 0) {
      return { totalDeliveries: 0, avgDeliveryTimeMins: 0, avgPrepTimeMins: 0 };
    }

    return {
      totalDeliveries: result[0].totalDeliveries,
      avgDeliveryTimeMins: result[0].avgDeliveryTimeMs / (1000 * 60),
      avgPrepTimeMins: result[0].avgPrepTimeMs / (1000 * 60),
    };
  }
}
