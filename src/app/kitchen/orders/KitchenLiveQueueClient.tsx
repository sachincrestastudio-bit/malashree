"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Timer, Package, CheckCircle2, ArrowRight, Loader2, Flame, Bike, RefreshCw, Phone } from "lucide-react";
import Link from "next/link";
import { updateKitchenOrderStatus } from "@/actions/kitchen/orders";

interface Ticket {
  _id: string;
  orderNumber: string;
  orderStatus: "placed" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  customer?: { name: string; phone?: string };
  items: any[];
  createdAt: string;
  grandTotal?: number;
}

interface Props {
  initialQueue: Ticket[];
  kitchenName: string;
}

export default function KitchenLiveQueueClient({ initialQueue, kitchenName }: Props) {
  const router = useRouter();
  const [queue, setQueue] = useState<Ticket[]>(initialQueue || []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setQueue(initialQueue || []);
  }, [initialQueue]);

  // Live Auto-Refresh every 5 seconds for incoming live orders
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [router]);

  const handleStatusUpdate = async (orderId: string, nextStatus: any) => {
    setUpdatingId(orderId);

    // Optimistic UI state update
    setQueue((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, orderStatus: nextStatus } : o))
    );

    const res = await updateKitchenOrderStatus(orderId, nextStatus);
    setUpdatingId(null);

    if (res?.error) {
      alert(`Error updating order: ${res.error}`);
      setQueue(initialQueue || []);
    } else {
      router.refresh();
    }
  };

  const placedOrders = queue.filter((o) => o.orderStatus === "placed" || o.orderStatus === "accepted");
  const preparingOrders = queue.filter((o) => o.orderStatus === "preparing");
  const readyOrders = queue.filter((o) => o.orderStatus === "ready");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6e2d8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            <span className="size-2 rounded-full bg-[#064e3b] animate-pulse" />
            Real-Time Kitchen Ops
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight">
            Live Kitchen Prep Queue
          </h1>
          <p className="text-xs text-[#52635c] mt-0.5">
            Active incoming tickets and live kitchen fulfillment for <b>{kitchenName}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#064e3b] bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
          <span className="size-2 rounded-full bg-[#064e3b] animate-pulse" />
          <span>Live Auto-Sync Active</span>
        </div>
      </div>

      {/* Kanban Ticket Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. New / Pending Column */}
        <div className="bg-white rounded-3xl border border-[#e6e2d8] flex flex-col overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#e6e2d8] flex justify-between items-center bg-[#fbf9f4]">
            <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-2">
              <Package className="size-4 text-amber-600" />
              <span>New / Pending</span>
            </h3>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              {placedOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[360px] bg-[#fbf9f4]/30">
            {placedOrders.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#52635c] font-semibold">
                No new pending tickets in queue.
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

        {/* 2. In Preparation Column */}
        <div className="bg-white rounded-3xl border border-[#e6e2d8] flex flex-col overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#e6e2d8] flex justify-between items-center bg-[#fbf9f4]">
            <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-2">
              <Flame className="size-4 text-orange-600 animate-pulse" />
              <span>In Preparation</span>
            </h3>
            <span className="bg-orange-100 text-orange-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[360px] bg-[#fbf9f4]/30">
            {preparingOrders.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#52635c] font-semibold">
                No dishes currently cooking on stove.
              </div>
            ) : (
              preparingOrders.map((order) => (
                <TicketCard
                  key={order._id}
                  order={order}
                  accent="border-l-orange-500"
                  updatingId={updatingId}
                  onUpdateStatus={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* 3. Ready for Rider Column */}
        <div className="bg-white rounded-3xl border border-[#e6e2d8] flex flex-col overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#e6e2d8] flex justify-between items-center bg-[#fbf9f4]">
            <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#064e3b]" />
              <span>Ready for Pickup</span>
            </h3>
            <span className="bg-emerald-100 text-[#064e3b] text-xs font-black px-2.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[360px] bg-[#fbf9f4]/30">
            {readyOrders.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#52635c] font-semibold">
                No tickets awaiting rider handover.
              </div>
            ) : (
              readyOrders.map((order) => (
                <TicketCard
                  key={order._id}
                  order={order}
                  accent="border-l-[#064e3b]"
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
    <div
      className={`bg-white p-4 rounded-2xl border border-[#e6e2d8] shadow-2xs border-l-4 ${accent} space-y-3 hover:shadow-md transition`}
    >
      <div className="flex justify-between items-start">
        <span className="font-mono font-black text-[#0d261e] text-sm bg-[#fbf9f4] px-2 py-0.5 rounded border border-[#e6e2d8]">
          #{order.orderNumber}
        </span>
        <span className="text-[11px] font-semibold text-[#52635c] flex items-center gap-1">
          <Timer className="size-3 text-[#52635c]" />
          {order.createdAt
            ? new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just now"}
        </span>
      </div>

      <div className="text-xs text-[#0d261e]">
        <div className="font-bold flex items-center justify-between">
          <span>{order.customer?.name || "Customer"}</span>
          {order.grandTotal ? (
            <span className="font-black text-[#064e3b]">₹{order.grandTotal}</span>
          ) : null}
        </div>
        {order.customer?.phone && (
          <div className="text-[11px] text-[#52635c] flex items-center gap-1 mt-0.5">
            <Phone className="size-3" />
            <span>{order.customer.phone}</span>
          </div>
        )}
      </div>

      {/* Dish Items summary */}
      <div className="bg-[#fbf9f4] p-2.5 rounded-xl border border-[#e6e2d8]/70 space-y-1">
        {(order.items || []).map((it: any, idx: number) => (
          <div key={idx} className="text-xs text-[#0d261e] font-semibold flex items-center justify-between">
            <span className="truncate">
              <span className="font-black text-[#064e3b]">{it.quantity}x</span>{" "}
              {it.dishName || it.name || "Dish"}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/kitchen/order/${order._id}`}
          className="flex-1 bg-[#fbf9f4] hover:bg-gray-100 border border-[#e6e2d8] text-[#0d261e] text-center py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>KOT</span>
          <ArrowRight className="size-3" />
        </Link>

        {(order.orderStatus === "placed" || order.orderStatus === "accepted") && (
          <button
            onClick={() => onUpdateStatus(order._id, "preparing")}
            disabled={isUpdating}
            className="flex-1 bg-[#064e3b] text-[#d4af37] hover:bg-[#0a5c46] py-2 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border border-[#d4af37]/30"
          >
            {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Flame className="size-3.5" />}
            <span>Start Prep</span>
          </button>
        )}

        {order.orderStatus === "preparing" && (
          <button
            onClick={() => onUpdateStatus(order._id, "ready")}
            disabled={isUpdating}
            className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800 py-2 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
            <span>Mark Ready</span>
          </button>
        )}

        {order.orderStatus === "ready" && (
          <button
            onClick={() => onUpdateStatus(order._id, "out_for_delivery")}
            disabled={isUpdating}
            className="flex-1 bg-purple-700 text-white hover:bg-purple-800 py-2 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Bike className="size-3.5" />}
            <span>Hand to Rider</span>
          </button>
        )}
      </div>
    </div>
  );
}
