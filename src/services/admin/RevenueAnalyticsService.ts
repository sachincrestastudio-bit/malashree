import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { AnalyticsCoreService } from "./AnalyticsCoreService";

export class RevenueAnalyticsService {
  /**
   * Aggregates key revenue metrics: Total Revenue, Orders, AOV
   */
  static async getRevenueKPIs(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "30d",
  ) {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);
    // Only count successful orders (not cancelled or pending gateway)
    match.orderStatus = { $nin: ["cancelled", "pending"] };

    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    if (result.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, aov: 0 };
    }

    return {
      totalRevenue: result[0].totalRevenue,
      totalOrders: result[0].totalOrders,
      aov: result[0].totalRevenue / result[0].totalOrders,
    };
  }

  /**
   * Aggregates revenue time-series data for line/area charts.
   */
  static async getRevenueTrend(kitchenId?: string, period: "7d" | "30d" | "year" = "30d") {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);
    match.orderStatus = { $nin: ["cancelled", "pending"] };

    let formatString = "%Y-%m-%d"; // Daily grouping
    if (period === "year") {
      formatString = "%Y-%m"; // Monthly grouping for year view
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: formatString, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    return await Order.aggregate(pipeline);
  }
}
