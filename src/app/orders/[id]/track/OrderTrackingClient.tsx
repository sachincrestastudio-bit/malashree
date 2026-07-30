"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, MapPin, Navigation, Phone, Store, Package, Bike, RefreshCw, Compass
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DeliveryMap } from "@/components/DeliveryMap";
import { getOrderTrackingData } from "@/actions/delivery/orders";

interface OrderTrackingClientProps {
  initialData: any;
  orderId: string;
}

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "preparing", label: "Preparing", icon: Clock },
  { key: "ready", label: "Ready", icon: Store },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderTrackingClient({ initialData, orderId }: OrderTrackingClientProps) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const order = data.order;
  const driverProfile = data.driverProfile;

  // Poll for live driver movement & order status updates every 6s
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

  // Coordinates
  const kitchenLat = order.kitchen?.location?.coordinates?.[1] || 18.5987;
  const kitchenLng = order.kitchen?.location?.coordinates?.[0] || 73.7978;

  const driverLat = driverProfile?.location?.lat;
  const driverLng = driverProfile?.location?.lng;

  const customerLat = order.deliveryAddress?.latitude || kitchenLat + 0.015;
  const customerLng = order.deliveryAddress?.longitude || kitchenLng + 0.015;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-olive-dark hover:text-ink transition"
          >
            <ArrowLeft className="size-4" /> Back to Profile
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-mono text-lime-deep uppercase tracking-widest bg-lime/10 px-3 py-1 border border-lime/30">
            {refreshing ? (
              <>
                <RefreshCw className="size-3 animate-spin" /> Live Syncing...
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-lime animate-pulse" /> Live GPS Dispatch
              </>
            )}
          </div>
        </div>

        {/* Masthead */}
        <div className="border-b-2 border-ink pb-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
              <span className="h-px w-8 bg-lime" />
              Order Dispatch Status
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.95]">
              Track <span className="italic text-emerald">Order #{order.orderNumber}</span>
            </h1>
            <p className="text-sm text-olive-dark mt-2 italic font-light">
              Cooking fresh at {order.kitchenName} · Real-time GPS tracking.
            </p>
          </div>
        </div>

        {/* Progress Tracker Stepper */}
        <div className="bg-white border border-ink/10 p-6 space-y-6">
          <h2 className="font-display text-xl text-ink flex items-center justify-between">
            <span>Order Progress</span>
            <span className="text-xs font-mono uppercase tracking-widest text-lime-deep border border-lime/40 bg-lime/10 px-3 py-1">
              {order.orderStatus.replace(/_/g, " ")}
            </span>
          </h2>

          <div className="grid grid-cols-5 gap-2 relative">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center text-center group">
                  <div
                    className={`size-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-ink border-ink text-lime scale-110 shadow-md"
                        : isCompleted
                        ? "bg-lime/20 border-lime text-lime-deep"
                        : "bg-cream border-ink/10 text-olive/40"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider mt-2.5 leading-tight ${
                      isCurrent ? "font-bold text-ink" : isCompleted ? "text-olive-dark" : "text-olive/40"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive GPS Delivery Map */}
        <div className="bg-white border border-ink/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink flex items-center gap-2">
              <Compass className="size-5 text-lime-deep" /> Live Delivery Map
            </h2>
            <span className="text-[10px] font-mono text-olive uppercase tracking-widest">
              Kitchen ➔ Driver ➔ Address
            </span>
          </div>

          <DeliveryMap
            height="380px"
            kitchenLocation={{
              lat: kitchenLat,
              lng: kitchenLng,
              label: order.kitchenName,
              sublabel: "Cooking Kitchen",
            }}
            driverLocation={
              driverLat && driverLng
                ? {
                    lat: driverLat,
                    lng: driverLng,
                    label: order.driverId?.name || "Delivery Driver",
                    sublabel: "Live GPS Position",
                  }
                : undefined
            }
            customerLocation={{
              lat: customerLat,
              lng: customerLng,
              label: "Your Address",
              sublabel: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`,
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Kitchen Info Card */}
            <div className="border border-ink/10 p-4 bg-cream/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-lime-deep">Kitchen Branch</span>
                <Store className="size-4 text-olive" />
              </div>
              <p className="font-display text-lg text-ink leading-tight">{order.kitchenName}</p>
              <p className="text-xs text-olive-dark font-mono truncate">{order.kitchen?.address || "Kitchen Location"}</p>
            </div>

            {/* Driver / Pidge Info Card */}
            <div className="border border-ink/10 p-4 bg-cream/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-widest uppercase text-lime-deep">
                  {order.pidgeOrderId ? "Pidge Hyperlocal Partner" : "Assigned Executive"}
                </span>
                <Bike className="size-4 text-olive" />
              </div>
              <p className="font-display text-lg text-ink leading-tight">
                {order.pidgeRiderName || order.driverId?.name || "Assigning Nearest Partner..."}
              </p>
              {(order.pidgeRiderPhone || order.driverId?.phone) && (
                <a
                  href={`tel:${order.pidgeRiderPhone || order.driverId?.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald font-bold hover:underline"
                >
                  <Phone className="size-3" /> Call Delivery Partner ({order.pidgeRiderPhone || order.driverId?.phone})
                </a>
              )}
              {order.pidgeTrackingUrl && (
                <div className="pt-1">
                  <a
                    href={order.pidgeTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-lime font-mono text-[10px] uppercase tracking-wider hover:bg-emerald hover:text-white transition"
                  >
                    Open Pidge Live Tracker ➔
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details & Items Summary */}
        <div className="bg-white border border-ink/10 p-6 space-y-4">
          <h2 className="font-display text-xl text-ink border-b border-ink/10 pb-3">Items Registered</h2>
          <div className="divide-y divide-ink/5">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-ink">{item.dishName}</span>
                  <span className="text-xs text-olive font-mono ml-2">× {item.quantity}</span>
                </div>
                <span className="font-display text-ink">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink/10 pt-4 flex items-center justify-between font-display text-xl text-ink">
            <span>Grand Total</span>
            <span>₹{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
