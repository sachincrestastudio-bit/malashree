"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, Package, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { updateKitchenOrderStatus } from "@/actions/kitchen/orders";

interface Ticket {
  _id: string;
  orderNumber: string;
  orderStatus: "placed" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";
  customer?: { name: string; phone?: string };
  items: any[];
  createdAt: string;
}

interface Props {
  initialQueue: Ticket[];
  kitchenName: string;
}

export default function KitchenLiveQueueClient({ initialQueue, kitchenName }: Props) {
  const router = useRouter();
  const [queue, setQueue] = useState<Ticket[]>(initialQueue || []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    const res = await updateKitchenOrderStatus(orderId, nextStatus);
    setUpdatingId(null);

    if (res.success) {
      router.refresh();
    }
  };

  const placedOrders = queue.filter((o) => o.orderStatus === "placed" || o.orderStatus === "accepted");
  const preparingOrders = queue.filter((o) => o.orderStatus === "preparing");
  const readyOrders = queue.filter((o) => o.orderStatus === "ready");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Live Kitchen Queue
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Live Order <span className="italic text-emerald">Tickets</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Real-time incoming tickets and prep queue for {kitchenName}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest bg-white border border-ink/10 px-4 py-2 text-ink">
          <span className="size-2 rounded-full bg-lime animate-pulse" /> Live DB Dispatch
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
              {placedOrders.length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[350px]">
            {placedOrders.length === 0 ? (
              <div className="py-12 text-center text-olive font-mono text-xs italic">
                No new pending tickets.
              </div>
            ) : (
              placedOrders.map((order) => (
                <TicketCard
                  key={order._id}
                  order={order}
                  accent="border-l-amber-500"
                  updatingId={updatingId}
                  onUpdateStatus={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-white rounded-2xl border border-ink/10 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-cream/40">
            <h3 className="font-mono font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" /> In Preparation
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[350px]">
            {preparingOrders.length === 0 ? (
              <div className="py-12 text-center text-olive font-mono text-xs italic">
                No orders currently on stove.
              </div>
            ) : (
              preparingOrders.map((order) => (
                <TicketCard
                  key={order._id}
                  order={order}
                  accent="border-l-blue-500"
                  updatingId={updatingId}
                  onUpdateStatus={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-white rounded-2xl border border-ink/10 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-cream/40">
            <h3 className="font-mono font-bold text-ink uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="size-2 rounded-full bg-lime" /> Ready for Pickup
            </h3>
            <span className="bg-lime/20 text-emerald text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[350px]">
            {readyOrders.length === 0 ? (
              <div className="py-12 text-center text-olive font-mono text-xs italic">
                No orders awaiting pickup.
              </div>
            ) : (
              readyOrders.map((order) => (
                <TicketCard
                  key={order._id}
                  order={order}
                  accent="border-l-lime"
                  updatingId={updatingId}
                  onUpdateStatus={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({
  order,
  accent,
  updatingId,
  onUpdateStatus,
}: {
  order: Ticket;
  accent: string;
  updatingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const isUpdating = updatingId === order._id;
  const itemCount = (order.items || []).reduce((n: number, i: any) => n + (i.quantity || 1), 0);

  return (
    <div className={`bg-cream/30 p-4 rounded-xl border border-ink/10 shadow-sm border-l-4 ${accent} space-y-3`}>
      <div className="flex justify-between items-start">
        <span className="font-mono font-bold text-ink text-sm bg-white px-2 py-0.5 border border-ink/10">
          {order.orderNumber}
        </span>
        <span className="text-[10px] font-mono text-olive flex items-center gap-1">
          <Timer className="size-3 text-olive/60" />{" "}
          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
        </span>
      </div>

      <div className="text-xs text-ink font-mono">
        <div className="font-bold">{order.customer?.name || "Customer"}</div>
        <div className="text-olive text-[11px] mt-0.5">{itemCount} items in ticket</div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-ink/5">
        <Link
          href={`/kitchen/order/${order._id}`}
          className="flex-1 bg-white border border-ink/10 hover:border-ink text-ink text-center py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider transition-colors"
        >
          KOT Details
        </Link>
        {(order.orderStatus === "placed" || order.orderStatus === "accepted") && (
          <button
            onClick={() => onUpdateStatus(order._id, "preparing")}
            disabled={isUpdating}
            className="flex-1 bg-ink text-lime hover:bg-emerald py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {isUpdating ? <RefreshCw className="size-3 animate-spin text-lime" /> : "Start Prep"}
          </button>
        )}
        {order.orderStatus === "preparing" && (
          <button
            onClick={() => onUpdateStatus(order._id, "ready")}
            disabled={isUpdating}
            className="flex-1 bg-lime text-ink hover:bg-lime/90 py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {isUpdating ? <RefreshCw className="size-3 animate-spin text-ink" /> : "Mark Ready"}
          </button>
        )}
      </div>
    </div>
  );
}
