"use client";

import { useEffect, useState } from "react";
import { ChefHat, Timer, CheckCircle, Package } from "lucide-react";
import Link from "next/link";

export default function KitchenLiveQueuePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real implementation, we would fetch initial data and then subscribe to SSE.
  // For prototype visualization, we will render a UI shell that expects realtime data.

  useEffect(() => {
    // const eventSource = new EventSource('/api/kitchen/events');
    // eventSource.onmessage = (e) => { ... merge new orders ... }

    // Mock initial data fetch
    setTimeout(() => {
      setOrders([
        {
          _id: "1",
          orderNumber: "ORD-1024",
          status: "placed",
          items: 3,
          time: "2 mins ago",
          customer: "Rahul K.",
        },
        {
          _id: "2",
          orderNumber: "ORD-1023",
          status: "preparing",
          items: 1,
          time: "8 mins ago",
          customer: "Priya S.",
        },
        {
          _id: "3",
          orderNumber: "ORD-1020",
          status: "ready",
          items: 5,
          time: "15 mins ago",
          customer: "Amit T.",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" /> Live Order Queue
          </h2>
          <p className="text-slate-400 mt-1">Real-time incoming tickets.</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Placed Column */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> New / Pending
            </h3>
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
              {orders.filter((o) => o.status === "placed").length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {orders
              .filter((o) => o.status === "placed")
              .map((order) => (
                <TicketCard key={order._id} order={order} accent="border-l-orange-500" />
              ))}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Preparing
            </h3>
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
              {orders.filter((o) => o.status === "preparing").length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {orders
              .filter((o) => o.status === "preparing")
              .map((order) => (
                <TicketCard key={order._id} order={order} accent="border-l-blue-500" />
              ))}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ready for Pickup
            </h3>
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
              {orders.filter((o) => o.status === "ready").length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {orders
              .filter((o) => o.status === "ready")
              .map((order) => (
                <TicketCard key={order._id} order={order} accent="border-l-emerald-500" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ order, accent }: { order: any; accent: string }) {
  return (
    <div
      className={`bg-slate-950 p-4 rounded-lg border border-slate-800 shadow-sm hover:border-slate-600 transition-colors cursor-pointer border-l-4 ${accent}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-white font-bold">{order.orderNumber}</span>
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Timer className="w-3 h-3" /> {order.time}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        {order.customer} • {order.items} Items
      </p>

      <div className="flex gap-2 mt-2">
        <Link
          href={`/kitchen/order/${order._id}`}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-center py-2 rounded font-medium text-xs transition-colors"
        >
          View Details
        </Link>
        {order.status === "placed" && (
          <button className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 rounded font-medium text-xs transition-colors">
            Start Prep
          </button>
        )}
        {order.status === "preparing" && (
          <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-medium text-xs transition-colors">
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );
}
