import { connectToDatabase } from '../../database/mongoose';
import { Order } from '../../models/Order';

export class AnalyticsService {
  /**
   * Returns revenue grouped by date for the last 30 days.
   */
  static async getRevenueTrend() {
    await connectToDatabase();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const result = await Order.aggregate(pipeline);
    return JSON.parse(JSON.stringify(result));
  }
}
