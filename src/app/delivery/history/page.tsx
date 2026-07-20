import { requireDriverAccess } from '@/actions/delivery/auth';
import { EarningsService } from '@/services/delivery/EarningsService';
import { History, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DeliveryHistoryPage({ searchParams }: { searchParams: { page?: string } }) {
  const { driverId } = await requireDriverAccess();
  const page = parseInt(searchParams.page || '1', 10);
  const data = await EarningsService.getDeliveryHistory(driverId, page);

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" /> Past Deliveries
        </h2>
      </div>

      <div className="space-y-3">
        {data.orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            No past deliveries found.
          </div>
        ) : (
          data.orders.map((order: any) => (
            <div key={order._id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${order.orderStatus === 'delivered' ? 'bg-emerald-950/50 text-emerald-500' : 'bg-red-950/50 text-red-500'}
                `}>
                  {order.orderStatus === 'delivered' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-white font-bold">{order.orderNumber}</p>
                  <p className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.grandTotal?.toFixed(2)}</p>
                </div>
              </div>
              <Link href={`/delivery/order/${order._id}`} className="text-blue-500 text-sm font-bold">
                View
              </Link>
            </div>
          ))
        )}
      </div>

      {data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Link 
            href={`/delivery/history?page=${Math.max(1, data.page - 1)}`}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${data.page === 1 ? 'bg-slate-900 text-slate-600 pointer-events-none' : 'bg-slate-800 text-white'}`}
          >
            Prev
          </Link>
          <Link 
            href={`/delivery/history?page=${Math.min(data.pages, data.page + 1)}`}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${data.page === data.pages ? 'bg-slate-900 text-slate-600 pointer-events-none' : 'bg-slate-800 text-white'}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
