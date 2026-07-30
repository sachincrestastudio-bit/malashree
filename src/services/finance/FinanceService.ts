import { connectToDatabase } from "../../database/mongoose";
import { Transaction } from "../../models/Transaction";
import { Invoice } from "../../models/Invoice";

export class FinanceService {
  /**
   * Aggregates revenue data for the Admin Dashboard.
   */
  static async getFinancialOverview() {
    await connectToDatabase();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const pipeline = [
      { $match: { status: "captured" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ];

    const todayPipeline = [
      { $match: { status: "captured", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ];

    const [totalRes, todayRes, totalRefunds] = await Promise.all([
      Transaction.aggregate(pipeline),
      Transaction.aggregate(todayPipeline),
      Transaction.aggregate([
        { $match: { status: { $in: ["refunded", "partially_refunded"] } } },
        { $group: { _id: null, totalRefunded: { $sum: "$refundAmount" } } },
      ]),
    ]);

    return {
      totalRevenue: totalRes[0]?.totalRevenue || 0,
      todayRevenue: todayRes[0]?.totalRevenue || 0,
      totalRefunded: totalRefunds[0]?.totalRefunded || 0,
    };
  }
}
