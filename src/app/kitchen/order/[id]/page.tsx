import { requireKitchenAccess } from '@/actions/kitchen/auth';
import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/models/Order';
import { ArrowLeft, Timer, CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default async function KitchenOrderDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireKitchenAccess();
  await connectToDatabase();

  const order = await Order.findOne({ _id: params.id, kitchenId: user.kitchenId })
    .populate('customer', 'name phone')
    .lean() as any;

  if (!order) {
    return <div className="text-white p-8">Order not found or access denied.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/kitchen/orders" className="text-orange-500 hover:text-orange-400 flex items-center gap-2 text-sm font-medium w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{order.orderNumber}</h2>
            <div className="flex gap-3 text-sm font-medium">
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{order.customer?.name}</span>
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full uppercase">{order.orderStatus}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm mb-1">Placed At</p>
            <p className="text-white font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-slate-800 text-orange-500 flex items-center justify-center font-bold">
                    {item.quantity}x
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    {item.variants && item.variants.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">Variants: {item.variants.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="mt-6 bg-orange-950/30 border border-orange-900/50 p-4 rounded-xl">
              <h4 className="text-orange-500 font-bold mb-1 text-sm uppercase tracking-wider">Special Instructions</h4>
              <p className="text-slate-300">{order.specialInstructions}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {order.orderStatus === 'placed' && (
              <button className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-colors">
                Start Preparing
              </button>
            )}
            {order.orderStatus === 'preparing' && (
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors">
                Mark Ready for Delivery
              </button>
            )}
            <button className="px-8 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors">
              Print KOT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
