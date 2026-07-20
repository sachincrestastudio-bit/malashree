import { AdminDashboardService } from '@/services/admin/AdminDashboardService';
import { IndianRupee, ShoppingBag, Users, Store, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // Fetch metrics server-side
  const metrics = await AdminDashboardService.getDashboardMetrics();

  const statCards = [
    { name: "Today's Revenue", value: `₹${metrics.todaysRevenue.toFixed(2)}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: "Today's Orders", value: metrics.todaysOrderCount.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Orders', value: metrics.activeOrdersCount.toString(), icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Total Customers', value: metrics.totalCustomers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Active Kitchens', value: metrics.activeKitchens.toString(), icon: Store, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Kitchen</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              ) : (
                metrics.recentOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4">{order.customer?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">{order.kitchenName}</td>
                    <td className="px-6 py-4 font-medium">₹{order.grandTotal.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          order.orderStatus === 'preparing' ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
