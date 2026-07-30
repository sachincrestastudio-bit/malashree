import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { AnalyticsCoreService } from "./AnalyticsCoreService";

export class ReportingService {
  /**
   * Generates a raw CSV export of orders.
   */
  static async generateOrdersCSV(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "all",
  ) {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);

    const orders = await Order.find(match)
      .populate("customer", "name email phone")
      .populate("kitchen", "name")
      .lean();

    // CSV Header
    let csv = "Order ID,Date,Customer,Kitchen,Amount,Status,Payment Method\n";

    // CSV Rows
    for (const order of orders) {
      const customerName = order.customer ? (order.customer as any).name : "Unknown";
      const kitchenName = order.kitchen ? (order.kitchen as any).name : "Unknown";
      const date = order.createdAt ? new Date(order.createdAt).toISOString() : "";

      // Escape commas in strings
      const safeCustomer = `"${customerName}"`;
      const safeKitchen = `"${kitchenName}"`;

      csv += `${order.orderNumber},${date},${safeCustomer},${safeKitchen},${order.totalAmount},${order.orderStatus},${order.paymentMethod}\n`;
    }

    return csv;
  }
}
