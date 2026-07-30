"use client";

import { useEffect, useState } from "react";
import { ChefHat, Timer, CheckCircle2, Package, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function KitchenLiveQueuePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    }, 500);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Order Dispatch
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Live Order <span className="italic text-emerald">Queue</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Real-time incoming kitchen tickets and prep status boards.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest bg-white border border-ink/10 px-4 py-2 text-ink">
          <span className="size-2 rounded-full bg-lime animate-pulse" /> Live Dispatch Sync
        </div>
      </div>

      {/* Kanban Ticket Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placed Column */}
        <div className="bg-white rounded-2xl border border-ink/10 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-cream/40">
            <h3 className="font-mono font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" /> New / Pending
            </h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {orders.filter((o) => o.status === "placed").length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[350px]">
            {orders
              .filter((o) => o.status === "placed")
              .map((order) => (
                <TicketCard key={order._id} order={order} accent="border-l-amber-500" />
              ))}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-white rounded-2xl border border-ink/10 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-cream/40">
            <h3 className="font-mono font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" /> In Preparation
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {orders.filter((o) => o.status === "preparing").length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[350px]">
            {orders
              .filter((o) => o.status === "preparing")
              .map((order) => (
                <TicketCard key={order._id} order={order} accent="border-l-blue-500" />
              ))}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-white rounded-2xl border border-ink/10 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-cream/40">
            <h3 className="font-mono font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="size-2 rounded-full bg-lime" /> Ready for Pickup
            </h3>
            <span className="bg-lime/20 text-emerald text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {orders.filter((o) => o.status === "ready").length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[350px]">
            {orders
              .filter((o) => o.status === "ready")
              .map((order) => (
                <TicketCard key={order._id} order={order} accent="border-l-lime" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ order, accent }: { order: any; accent: string }) {
  return (
    <div className={`bg-cream/30 p-4 rounded-xl border border-ink/10 shadow-sm border-l-4 ${accent} space-y-3`}>
      <div className="flex justify-between items-start">
        <span className="font-mono font-bold text-ink text-sm bg-white px-2 py-0.5 border border-ink/10">
          {order.orderNumber}
        </span>
        <span className="text-xs font-mono text-olive flex items-center gap-1">
          <Timer className="size-3" /> {order.time}
        </span>
      </div>
      <p className="text-xs text-olive-dark font-mono">
        {order.customer} • {order.items} Items
      </p>

      <div className="flex gap-2 pt-2 border-t border-ink/5">
        <Link
          href={`/kitchen/order/${order._id}`}
          className="flex-1 bg-white border border-ink/10 hover:border-ink text-ink text-center py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider transition-colors"
        >
          Details
        </Link>
        {order.status === "placed" && (
          <button className="flex-1 bg-ink text-lime hover:bg-emerald py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider transition-colors">
            Start Prep
          </button>
        )}
        {order.status === "preparing" && (
          <button className="flex-1 bg-lime text-ink hover:bg-lime/90 py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider transition-colors">
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );
}
