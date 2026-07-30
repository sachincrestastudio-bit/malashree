"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Bike, ExternalLink, Loader2, Compass } from "lucide-react";
import { dispatchOrderToPidgeAction } from "@/actions/delivery/pidge";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  kitchenName: string;
  grandTotal: number;
  orderStatus: string;
  createdAt: string;
  pidgeOrderId?: string;
  pidgeTrackingUrl?: string;
  pidgeStatus?: string;
}

export default function AdminOrdersClient({ orders }: { orders: OrderItem[] }) {
  const router = useRouter();
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const handleDispatchPidge = async (id: string) => {
    setDispatchingId(id);
    const res = await dispatchOrderToPidgeAction(id);
    setDispatchingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · System Orders & Pidge Logistics
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Order <span className="italic text-emerald">Dispatch</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Manage customer orders and dispatch to Pidge Hyperlocal Delivery.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Order ID", "Customer", "Kitchen", "Total", "Status", "Pidge Hyperlocal", "Action"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <ShoppingBag className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">No orders found.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-ink font-bold">{order.orderNumber}</td>
                    <td className="px-5 py-4 text-xs text-olive-dark">{order.customerName}</td>
                    <td className="px-5 py-4 text-xs text-olive-dark font-mono">{order.kitchenName}</td>
                    <td className="px-5 py-4 font-display text-ink font-bold">₹{order.grandTotal.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-ink/20 text-ink bg-ink/5">
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {order.pidgeTrackingUrl ? (
                        <a
                          href={order.pidgeTrackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-lime/20 border border-lime/50 text-lime-deep hover:bg-lime/40 transition"
                        >
                          <Bike className="size-3" /> Pidge Track <ExternalLink className="size-2.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-olive/50">Not Dispatched</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.id}/track`}
                          target="_blank"
                          className="p-1.5 text-olive hover:text-ink transition"
                          title="Open Customer Live GPS Map"
                        >
                          <Compass className="size-4" />
                        </Link>

                        {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && !order.pidgeOrderId && (
                          <button
                            disabled={dispatchingId === order.id}
                            onClick={() => handleDispatchPidge(order.id)}
                            className="px-3 py-1.5 bg-ink text-lime text-[9px] font-mono uppercase tracking-widest hover:bg-emerald hover:text-white transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {dispatchingId === order.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Bike className="size-3" />
                            )}
                            Dispatch Pidge
                          </button>
                        )}
                      </div>
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
