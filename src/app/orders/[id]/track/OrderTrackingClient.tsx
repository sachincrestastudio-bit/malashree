"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Store,
  Package,
  Bike,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { getOrderTrackingData } from "@/actions/delivery/orders";

interface OrderTrackingClientProps {
  initialData: any;
  orderId: string;
}

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "preparing", label: "Preparing in Kitchen", icon: Clock },
  { key: "ready", label: "Ready for Pickup", icon: Store },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderTrackingClient({ initialData, orderId }: OrderTrackingClientProps) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const order = data?.order || {};
  const driverProfile = data?.driverProfile;

  // Poll for live status updates from Pidge Webhooks & DB
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      setRefreshing(true);
      const updated = await getOrderTrackingData(orderId);
      if (mounted && updated) {
        setData(updated);
      }
      if (mounted) setRefreshing(false);
    }, 6000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const currentStepIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s.key === (order.orderStatus || order.status))
  );

  const pidgeRiderName = order.pidgeRiderName || driverProfile?.name || "Pidge Logistics Partner";
  const pidgeRiderPhone = order.pidgeRiderPhone || driverProfile?.phone;
  const pidgeTrackingUrl = order.pidgeTrackingUrl;

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-32">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-xs font-bold text-[#0d261e] bg-white px-3.5 py-2 rounded-xl border border-[#e6e2d8] shadow-2xs hover:bg-gray-50 transition"
          >
            <ArrowLeft className="size-4 text-[#064e3b]" />
            <span>Back to Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            {refreshing && <RefreshCw className="size-3.5 animate-spin text-[#064e3b]" />}
            <span className="text-xs font-bold text-[#52635c]">Order #{order.orderNumber}</span>
          </div>
        </div>

        {/* Live Arrival ETA Hero Banner */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-[#064e3b] uppercase tracking-wider block">
                {order.orderStatus === "delivered" ? "Order Delivered" : "Estimated Delivery Time"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight mt-0.5">
                {order.orderStatus === "delivered"
                  ? "Arrived at Doorstep"
                  : order.orderStatus === "out_for_delivery"
                  ? "Arriving in 15-20 mins"
                  : "Arriving in 25-30 mins"}
              </h2>
              {order.kitchenName && (
                <p className="text-xs text-[#52635c] mt-1 font-medium">
                  Prepared at <span className="font-bold text-[#0d261e]">{order.kitchenName}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#064e3b] animate-pulse" />
                Pidge Dispatch Active
              </span>
            </div>
          </div>

          {/* Visual Order Progress Stepper */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-1 text-center">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center space-y-1.5">
                    <div
                      className={`size-9 rounded-2xl grid place-items-center transition ${
                        isCurrent
                          ? "bg-[#064e3b] text-[#d4af37] shadow-md ring-4 ring-[#064e3b]/20"
                          : isCompleted
                          ? "bg-[#064e3b] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold leading-tight ${
                        isCurrent ? "text-[#064e3b] font-black" : isCompleted ? "text-[#0d261e]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pidge Live Tracking Button */}
        {pidgeTrackingUrl && (
          <section className="bg-gradient-to-r from-[#0d261e] to-[#064e3b] rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold">
                Pidge Live GPS Tracking
              </span>
              <h3 className="text-xl font-bold">Track Rider on Pidge Map</h3>
              <p className="text-xs text-white/80">
                View real-time GPS location and delivery route on Pidge.
              </p>
            </div>
            <a
              href={pidgeTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#d4af37] text-[#0d261e] font-mono text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition flex items-center gap-2 shrink-0"
            >
              <span>Open Pidge Map</span>
              <ExternalLink className="size-4" />
            </a>
          </section>
        )}

        {/* Pidge Delivery Partner Details Card */}
        <section className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-200 grid place-items-center shrink-0">
              <Bike className="size-6 text-[#064e3b]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-[#0d261e]">
                  {pidgeRiderName}
                </h4>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#064e3b] border border-emerald-300 text-[10px] font-bold">
                  Pidge Express
                </span>
              </div>
              <p className="text-xs text-[#52635c] mt-0.5">
                Assigned Logistics Partner · Malashree Delivery
              </p>
            </div>
          </div>

          {pidgeRiderPhone && (
            <a
              href={`tel:${pidgeRiderPhone}`}
              className="size-11 rounded-2xl bg-[#064e3b] text-[#d4af37] grid place-items-center shadow-xs hover:bg-[#0a5c46] transition shrink-0 border border-[#d4af37]/30"
              title="Call Rider"
            >
              <Phone className="size-5" />
            </a>
          )}
        </section>

        {/* Order Details Summary */}
        <section className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider">
            Order Summary
          </h3>

          <div className="space-y-1.5 text-xs text-[#0d261e] pt-1">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                <span>
                  {item.quantity}x {item.dishName || item.name || "Dish Item"}
                </span>
                <span className="font-bold text-[#0d261e]">₹{(item.price || 0) * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#0d261e]">
            <span>Total Paid ({order.paymentMethod?.toUpperCase() || "PAID"})</span>
            <span className="text-sm text-[#064e3b] font-black">₹{order.grandTotal || order.totalAmount || 0}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
