import { requireDriverAccess } from '@/actions/delivery/auth';
import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/models/Order';
import { ArrowLeft, Navigation, Phone, CheckCircle, Package, Store } from 'lucide-react';
import Link from 'next/link';

export default async function DeliveryOrderDetailsPage({ params }: { params: { id: string } }) {
  const { driverId } = await requireDriverAccess();
  await connectToDatabase();

  const order = await Order.findOne({ _id: params.id, driverId })
    .populate('customer', 'name phone')
    .populate('kitchen', 'name location contact')
    .lean() as any;

  if (!order) {
    return <div className="text-white p-8">Order not found or access denied.</div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-6">
      <Link href="/delivery/orders" className="text-blue-500 hover:text-blue-400 flex items-center gap-2 text-sm font-bold w-fit mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Order Number</p>
              <h2 className="text-2xl font-bold text-white leading-none">{order.orderNumber}</h2>
            </div>
            <span className="bg-blue-950/50 text-blue-400 border border-blue-900/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {order.orderStatus}
            </span>
          </div>
          <p className="text-slate-300 text-sm">{order.items.length} Items • ₹{order.grandTotal.toFixed(2)}</p>
        </div>

        {/* Pickup Details */}
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-500" /> Pickup Details
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-white font-bold mb-1">{order.kitchenName}</p>
            <p className="text-slate-400 text-sm mb-4">{order.kitchen?.location?.address || 'Kitchen Address'}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Navigation className="w-4 h-4 text-blue-400" /> Navigate
              </button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Phone className="w-4 h-4 text-emerald-400" /> Call
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" /> Delivery Details
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-white font-bold mb-1">{order.customer?.name}</p>
            <p className="text-slate-400 text-sm mb-4">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
            {order.specialInstructions && (
              <div className="mb-4 bg-orange-950/20 p-3 rounded-lg border border-orange-900/30">
                <p className="text-orange-500 text-xs font-bold uppercase mb-1">Instructions</p>
                <p className="text-slate-300 text-sm">{order.specialInstructions}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Navigation className="w-4 h-4 text-blue-400" /> Navigate
              </button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Phone className="w-4 h-4 text-emerald-400" /> Call
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 bg-slate-900 sticky bottom-16 md:bottom-0">
          {order.orderStatus === 'ready' && (
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-blue-900/20">
              Confirm Pickup
            </button>
          )}
          {order.orderStatus === 'out_for_delivery' && (
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Mark Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
