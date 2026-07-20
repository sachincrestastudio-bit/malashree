import { requireKitchenAccess } from '@/actions/kitchen/auth';
import { KitchenQueueService } from '@/services/kitchen/KitchenQueueService';
import { History, Search } from 'lucide-react';
import Link from 'next/link';

export default async function KitchenHistoryPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await requireKitchenAccess();
  const page = parseInt(searchParams.page || '1', 10);
  const data = await KitchenQueueService.getHistory(user.kitchenId, page);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-orange-500" /> Order History
          </h2>
          <p className="text-slate-400 mt-1">Completed and cancelled orders for your kitchen.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No historical orders found.
                </td>
              </tr>
            ) : (
              data.orders.map((order: any) => (
                <tr key={order._id.toString()} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {order.customer?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                      ${order.orderStatus === 'delivered' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 
                        order.orderStatus === 'cancelled' ? 'bg-red-950/50 text-red-400 border-red-900/50' : 
                        'bg-slate-800 text-slate-300 border-slate-700'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    ₹{order.grandTotal?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/kitchen/order/${order._id}`} className="text-orange-500 hover:text-orange-400 font-medium text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {data.pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-center gap-2">
            <Link 
              href={`/kitchen/history?page=${Math.max(1, data.page - 1)}`}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${data.page === 1 ? 'bg-slate-800 text-slate-500 pointer-events-none' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
              Previous
            </Link>
            <span className="px-4 py-2 text-slate-400 text-sm">Page {data.page} of {data.pages}</span>
            <Link 
              href={`/kitchen/history?page=${Math.min(data.pages, data.page + 1)}`}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${data.page === data.pages ? 'bg-slate-800 text-slate-500 pointer-events-none' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
