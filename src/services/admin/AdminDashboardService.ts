import { connectToDatabase } from '../../database/mongoose';
import { Order } from '../../models/Order';
import { User } from '../../models/User';
import { Kitchen } from '../../models/Kitchen';

export class AdminDashboardService {
  /**
   * Retrieves high-level metrics for the Admin Dashboard.
   */
  static async getDashboardMetrics() {
    await connectToDatabase();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Today's Revenue and Orders
    const todaysOrders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      orderStatus: { $ne: 'cancelled' }
    });

    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const todaysOrderCount = todaysOrders.length;
    
    // 2. Active Orders (not delivered or cancelled)
    const activeOrdersCount = await Order.countDocuments({
      orderStatus: { $nin: ['delivered', 'cancelled'] }
    });

    // 3. Customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 4. Kitchens
    const activeKitchens = await Kitchen.countDocuments({ isActive: true });

    // 5. Recent Orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .lean();

    return {
      todaysRevenue,
      todaysOrderCount,
      activeOrdersCount,
      totalCustomers,
      activeKitchens,
      recentOrders: JSON.parse(JSON.stringify(recentOrders)) // Serialize for Server Components
    };
  }
}
