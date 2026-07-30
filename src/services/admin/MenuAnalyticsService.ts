import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { AnalyticsCoreService } from "./AnalyticsCoreService";

export class MenuAnalyticsService {
  /**
   * Aggregates best and worst selling dishes.
   */
  static async getDishPerformance(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "30d",
  ) {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);
    match.orderStatus = { $nin: ["cancelled", "pending"] };

    const pipeline: any[] = [
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dishId",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenueGenerated: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
    ];

    const results = await Order.aggregate(pipeline);

    return {
      bestSellers: results.slice(0, 10),
      worstSellers: results.slice(-10).reverse(), // bottom 10, least sold first
    };
  }
}
