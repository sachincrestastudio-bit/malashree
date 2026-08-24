"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHat,
  TrendingUp,
  Clock,
  AlertCircle,
  Package,
  CheckCircle2,
  RefreshCw,
  Store,
  ArrowRight,
  Flame,
  Bike,
  Sparkles,
  UtensilsCrossed,
  Phone,
} from "lucide-react";
import { updateKitchenOrderStatus } from "@/actions/kitchen/orders";

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface Ticket {
  id: string;
  orderNumber: string;
  orderStatus: string;
  customerName: string;
  customerPhone?: string;
  grandTotal: number;
  items: TicketItem[];
  createdAt: string;
}

interface KitchenDashboardData {
  kitchenId: string;
  kitchenName: string;
  kitchenArea: string;
  kitchenStatus: string;
  preparationTime: number;
  deliveryRadius: number;
  todaysRevenue: number;
  todaysOrders: number;
  completedOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  avgPrepTime: string;
  activeTickets: Ticket[];
}

interface Props {
  data: KitchenDashboardData;
}

export default function KitchenDashboardClient({ data }: Props) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    await updateKitchenOrderStatus(orderId, nextStatus);
    setUpdatingId(null);
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Branch Masthead */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#064e3b] uppercase font-bold">
            <Store className="size-4 text-[#d4af37]" />
            <span>Dedicated Branch Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight mt-1">
            {data.kitchenName}
          </h1>
          <p className="text-xs text-[#52635c] mt-0.5">
            {data.kitchenArea} · Delivery Radius: {(data.deliveryRadius / 1000).toFixed(1)} km · Target Prep: {data.preparationTime} mins
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5 border ${
              data.kitchenStatus === "Open"
                ? "bg-emerald-50 text-[#064e3b] border-emerald-300"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                data.kitchenStatus === "Open" ? "bg-[#064e3b] animate-pulse" : "bg-rose-600"
              }`}
            />
            <span>Kitchen {data.kitchenStatus}</span>
          </div>

          <Link
            href={`/kitchen/menu?kitchenId=${data.kitchenId}`}
            className="px-4 py-2 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition flex items-center gap-1.5 shadow-2xs border border-[#d4af37]/30"
          >
            <UtensilsCrossed className="size-3.5" />
            <span>Menu & Stock</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e2d8] shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#52635c] flex items-center justify-between">
            <span>Pending Queue</span>
            <Package className="size-3.5 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0d261e]">
            {data.pendingOrders}
          </div>
          <p className="text-[10px] text-amber-700 font-bold">Awaiting prep</p>
        </div>

        {/* Preparing */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e2d8] shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#52635c] flex items-center justify-between">
            <span>On Stoves</span>
            <Flame className="size-3.5 text-orange-600 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#064e3b]">
            {data.preparingOrders}
          </div>
          <p className="text-[10px] text-orange-700 font-bold">Cooking live</p>
        </div>

        {/* Ready */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e2d8] shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#52635c] flex items-center justify-between">
            <span>Ready for Rider</span>
            <CheckCircle2 className="size-3.5 text-[#064e3b]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0d261e]">
            {data.readyOrders}
          </div>
          <p className="text-[10px] text-[#064e3b] font-bold">Packed & hot</p>
        </div>

        {/* Avg Speed */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e2d8] shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#52635c] flex items-center justify-between">
            <span>Avg Ticket Speed</span>
            <Clock className="size-3.5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0d261e]">
            {data.avgPrepTime}
          </div>
          <p className="text-[10px] text-purple-700 font-bold">Prep time</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e2d8] shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#52635c] flex items-center justify-between">
            <span>Today's Tickets</span>
            <TrendingUp className="size-3.5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0d261e]">
            {data.todaysOrders}
          </div>
          <p className="text-[10px] text-blue-700 font-bold">{data.completedOrders} completed</p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e2d8] shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#52635c] flex items-center justify-between">
            <span>Branch Revenue</span>
            <span className="text-xs font-black text-[#064e3b]">₹</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#064e3b] truncate">
            ₹{data.todaysRevenue.toFixed(0)}
          </div>
          <p className="text-[10px] text-[#064e3b] font-bold">Today's net sales</p>
        </div>
      </div>

      {/* Live Order Queue Table */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e6e2d8] bg-[#fbf9f4]/40 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-[#0d261e] uppercase tracking-wider flex items-center gap-2">
              <Package className="size-4 text-[#064e3b]" />
              Live Kitchen Prep Queue ({data.activeTickets.length} Active Tickets)
            </h3>
            <p className="text-xs text-[#52635c] mt-0.5">
              Instant action buttons to move tickets through preparation and rider handover.
            </p>
          </div>

          <Link
            href={`/kitchen/orders?kitchenId=${data.kitchenId}`}
            className="text-xs font-bold text-[#064e3b] hover:text-[#d4af37] flex items-center gap-1"
          >
            <span>Full Queue</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbf9f4] border-b border-[#e6e2d8] text-[10px] font-black font-mono tracking-wider uppercase text-[#52635c]">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Dish Items</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3 text-right">Kitchen Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e2d8]/60">
              {data.activeTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#52635c] font-bold">
                    No active tickets right now for this kitchen. Ready for incoming orders!
                  </td>
                </tr>
              ) : (
                data.activeTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#fbf9f4]/50 transition">
                    {/* Order Number */}
                    <td className="px-5 py-3.5 font-mono font-black text-sm text-[#0d261e]">
                      #{ticket.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5 font-bold text-[#0d261e]">
                      <div>{ticket.customerName}</div>
                      {ticket.customerPhone && (
                        <div className="text-[10px] text-[#52635c] flex items-center gap-1 font-mono">
                          <Phone className="size-2.5" />
                          {ticket.customerPhone}
                        </div>
                      )}
                    </td>

                    {/* Dish Items */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="space-y-0.5">
                        {ticket.items.map((it, idx) => (
                          <div key={idx} className="text-xs text-[#0d261e] font-semibold truncate">
                            <span className="font-black text-[#064e3b]">{it.quantity}x</span>{" "}
                            {it.name}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 font-black text-[#064e3b]">
                      ₹{ticket.grandTotal}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ticket.orderStatus === "placed" || ticket.orderStatus === "accepted"
                            ? "bg-amber-50 text-amber-800 border border-amber-300"
                            : ticket.orderStatus === "preparing"
                            ? "bg-blue-50 text-blue-800 border border-blue-300"
                            : ticket.orderStatus === "ready"
                            ? "bg-emerald-50 text-[#064e3b] border border-emerald-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ticket.orderStatus}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-5 py-3.5 font-mono text-[#52635c]">
                      {ticket.createdAt}
                    </td>

                    {/* Kitchen Action Buttons */}
                    <td className="px-5 py-3.5 text-right">
                      {ticket.orderStatus === "placed" || ticket.orderStatus === "accepted" ? (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, "preparing")}
                          disabled={updatingId === ticket.id}
                          className="px-3.5 py-1.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition shadow-2xs border border-[#d4af37]/30 cursor-pointer"
                        >
                          Start Cooking
                        </button>
                      ) : ticket.orderStatus === "preparing" ? (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, "ready")}
                          disabled={updatingId === ticket.id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition shadow-2xs cursor-pointer"
                        >
                          Mark Ready
                        </button>
                      ) : ticket.orderStatus === "ready" ? (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, "out_for_delivery")}
                          disabled={updatingId === ticket.id}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition shadow-2xs cursor-pointer"
                        >
                          Hand to Rider
                        </button>
                      ) : null}
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
