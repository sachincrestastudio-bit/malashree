import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/models/Order';
import { ShoppingBag } from 'lucide-react';

export default async function AdminOrdersPage() {
  await connectToDatabase();
  
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(100) // basic pagination for prototype
    .populate('customer', 'name')
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-500">View and manage all system orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Kitchen</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 flex flex-col items-center">
                    <ShoppingBag className="h-10 w-10 text-gray-300 mb-2" />
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id.toString()} className="hover:bg-gray-50">
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
                      {new Date(order.createdAt).toLocaleString()}
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
