"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Navigation, Phone, CheckCircle, Store, MapPin, Package, RefreshCw, Compass
} from "lucide-react";
import { DeliveryMap } from "@/components/DeliveryMap";
import { updateOrderStatus, updateDriverGps } from "@/actions/delivery/orders";

interface DeliveryOrderDetailClientProps {
  order: any;
  driverId: string;
}

export function DeliveryOrderDetailClient({ order, driverId }: DeliveryOrderDetailClientProps) {
  const router = useRouter();
  const [driverGps, setDriverGps] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingGps, setTrackingGps] = useState(false);

  // Parse Kitchen Location
  const kitchenLat = order.kitchen?.location?.coordinates?.[1] || 18.5987;
  const kitchenLng = order.kitchen?.location?.coordinates?.[0] || 73.7978;

  // Parse Customer Location (fallback based on address or branch coordinates)
  const customerLat = order.deliveryAddress?.latitude || kitchenLat + 0.015;
  const customerLng = order.deliveryAddress?.longitude || kitchenLng + 0.015;

  // Watch Driver GPS position
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    setTrackingGps(true);

    // Initial position lookup
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverGps(coords);
        updateDriverGps(driverId, coords.lat, coords.lng);
      },
      (err) => console.log("Initial driver GPS error:", err),
      { enableHighAccuracy: true }
    );

    // Watch position while on page
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverGps(coords);
        updateDriverGps(driverId, coords.lat, coords.lng);
      },
      (err) => console.log("Driver GPS watch error:", err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId]);

  const handleStatusUpdate = async (nextStatus: string) => {
    setLoading(true);
    setError(null);
    const res = await updateOrderStatus(order._id, nextStatus);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  };

  const getGoogleMapsNavUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-8">
      {/* Header Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/delivery/orders"
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-bold w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Live Orders
        </Link>
        {trackingGps && (
          <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 px-2.5 py-1 rounded-full text-[10px] font-mono text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Live GPS Tracking
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-4">
        {/* Order Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Order #{order.orderNumber}
              </p>
              <h2 className="text-2xl font-bold text-white leading-none">
                ₹{order.grandTotal.toFixed(2)}
              </h2>
            </div>
            <span className="bg-blue-950 text-blue-400 border border-blue-800/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {order.orderStatus.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-slate-300 text-sm font-medium">
            {order.items.length} Item{order.items.length !== 1 ? "s" : ""} • {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
          </p>
        </div>

        {/* Live GPS Map Section */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" /> GPS Route Map
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Real-time GPS</span>
          </div>
          <DeliveryMap
            height="280px"
            kitchenLocation={{
              lat: kitchenLat,
              lng: kitchenLng,
              label: order.kitchenName,
              sublabel: "Pickup Kitchen",
            }}
            driverLocation={
              driverGps
                ? {
                    lat: driverGps.lat,
                    lng: driverGps.lng,
                    label: "Your Position",
                    sublabel: "Live Driver Location",
                  }
                : undefined
            }
            customerLocation={{
              lat: customerLat,
              lng: customerLng,
              label: order.customer?.name || "Customer",
              sublabel: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`,
            }}
          />
        </div>

        {/* Pickup Details */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
            <Store className="w-4 h-4 text-orange-500" /> 1. Pickup Point
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <p className="text-white font-bold text-sm">{order.kitchenName}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {order.kitchen?.address || order.kitchen?.location?.address || "Kitchen Branch Address"}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <a
                href={getGoogleMapsNavUrl(kitchenLat, kitchenLng)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700/50"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" /> Navigate
              </a>
              {order.kitchen?.contact && (
                <a
                  href={`tel:${order.kitchen.contact}`}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700/50"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Kitchen
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-emerald-500" /> 2. Delivery Destination
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <p className="text-white font-bold text-sm">{order.customer?.name || "Customer"}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city} ({order.deliveryAddress?.zipCode})
              </p>
            </div>
            {order.specialInstructions && (
              <div className="bg-orange-950/30 p-3 rounded-lg border border-orange-900/40">
                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  Customer Instructions
                </p>
                <p className="text-slate-300 text-xs italic">{order.specialInstructions}</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <a
                href={getGoogleMapsNavUrl(customerLat, customerLng)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700/50"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" /> Navigate
              </a>
              {order.customer?.phone && (
                <a
                  href={`tel:${order.customer.phone}`}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700/50"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Customer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0">
          {order.orderStatus === "ready" && (
            <button
              disabled={loading}
              onClick={() => handleStatusUpdate("out_for_delivery")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all text-base shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
              Confirm Order Pickup
            </button>
          )}

          {order.orderStatus === "out_for_delivery" && (
            <button
              disabled={loading}
              onClick={() => handleStatusUpdate("delivered")}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all text-base shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Mark Order Delivered
            </button>
          )}

          {order.orderStatus === "delivered" && (
            <div className="w-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-bold py-3 rounded-xl text-center text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Delivery Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
