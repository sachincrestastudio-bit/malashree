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
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { DeliveryMap } from "@/components/DeliveryMap";
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

  const order = data.order;
  const driverProfile = data.driverProfile;

  // Poll for live driver movement & order status updates
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

  const kitchenLat = order.kitchen?.location?.coordinates?.[1] || 18.5987;
  const kitchenLng = order.kitchen?.location?.coordinates?.[0] || 73.7978;
  const driverLat = driverProfile?.location?.lat;
  const driverLng = driverProfile?.location?.lng;
  const customerLat = order.deliveryAddress?.latitude || kitchenLat + 0.015;
  const customerLng = order.deliveryAddress?.longitude || kitchenLng + 0.015;

  const currentStepIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s.key === order.status)
  );

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
                {order.status === "delivered" ? "Order Delivered" : "Estimated Delivery Time"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight mt-0.5">
                {order.status === "delivered"
                  ? "Arrived at Doorstep"
                  : order.status === "out_for_delivery"
                  ? "Arriving in 15-20 mins"
                  : "Arriving in 25-30 mins"}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#064e3b] animate-pulse" />
                Live Dispatch
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

        {/* Live GPS Interactive Map */}
        <section className="bg-white rounded-3xl p-3 border border-[#e6e2d8] shadow-2xs overflow-hidden">
          <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden relative border border-[#e6e2d8]">
            <DeliveryMap
              kitchenLocation={{ lat: kitchenLat, lng: kitchenLng }}
              driverLocation={driverLat && driverLng ? { lat: driverLat, lng: driverLng } : undefined}
              customerLocation={{ lat: customerLat, lng: customerLng }}
              className="w-full h-full"
            />
          </div>
        </section>

        {/* Delivery Partner Card */}
        {driverProfile && (
          <section className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-[#e6e2d8]">
                <img
                  src={driverProfile.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={driverProfile.name || "Delivery Partner"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-[#0d261e]">
                    {driverProfile.name || "Malashree Valet"}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-[#064e3b] border border-emerald-300 text-[10px] font-bold">
                    Vaccinated
                  </span>
                </div>
                <p className="text-xs text-[#52635c] mt-0.5">
                  {driverProfile.vehicle ? `${driverProfile.vehicle.model} · ${driverProfile.vehicle.number}` : "Two Wheeler"}
                </p>
              </div>
            </div>

            {driverProfile.phone && (
              <a
                href={`tel:${driverProfile.phone}`}
                className="size-11 rounded-2xl bg-[#064e3b] text-[#d4af37] grid place-items-center shadow-xs hover:bg-[#0a5c46] transition shrink-0 border border-[#d4af37]/30"
                title="Call Valet"
              >
                <Phone className="size-5" />
              </a>
            )}
          </section>
        )}

        {/* Order Details Drawer Card */}
        <section className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider">
            Order Summary
          </h3>

          <div className="space-y-1.5 text-xs text-[#0d261e] pt-1">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                <span>
                  {item.quantity}x {item.name || item.dish?.name || "Dish Item"}
                </span>
                <span className="font-bold text-[#0d261e]">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#0d261e]">
            <span>Total Paid ({order.paymentMethod?.toUpperCase() || "PAID"})</span>
            <span className="text-sm text-[#064e3b] font-black">₹{order.totalAmount}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
