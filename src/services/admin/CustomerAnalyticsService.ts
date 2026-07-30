import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { User } from "../../models/User";
import { AnalyticsCoreService } from "./AnalyticsCoreService";

export class CustomerAnalyticsService {
  /**
   * Identifies new vs returning customers based on their order history in the given period.
   */
  static async getCustomerMetrics(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "30d",
  ) {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);
    match.orderStatus = { $nin: ["cancelled", "pending"] };

    // Find unique customers who ordered in this period
    const customersInPeriod = await Order.distinct("customer", match);

    // Now count how many of these customers had their FIRST order in this period vs before
    let newCustomers = 0;
    let returningCustomers = 0;

    for (const customerId of customersInPeriod) {
      const firstOrder = await Order.findOne({
        customer: customerId,
        orderStatus: { $nin: ["cancelled", "pending"] },
      }).sort({ createdAt: 1 });
      if (!firstOrder) continue;

      const firstOrderDate = firstOrder.createdAt;
      const periodRange = AnalyticsCoreService.getDateRange(period) as any;

      if (
        period === "all" ||
        (firstOrderDate >= periodRange.$gte && firstOrderDate <= periodRange.$lte)
      ) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }

    return {
      totalCustomers: newCustomers + returningCustomers,
      newCustomers,
      returningCustomers,
      returningPercentage:
        newCustomers + returningCustomers > 0
          ? (returningCustomers / (newCustomers + returningCustomers)) * 100
          : 0,
    };
  }
}
