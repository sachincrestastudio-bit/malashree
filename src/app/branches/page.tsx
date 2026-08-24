"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  RefreshCw,
  Navigation,
  LocateFixed,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { getActiveKitchens } from "@/actions/kitchen";
import { LocationModal } from "@/components/LocationModal";

export default function BranchesPage() {
  const userLocation = useStore((s) => s.userLocation);

  const [activeKitchens, setActiveKitchens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    getActiveKitchens().then((kitchens) => {
      if (kitchens && kitchens.length > 0) {
        setActiveKitchens(kitchens);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-32">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Masthead Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#064e3b] uppercase font-bold">
              <Sparkles className="size-4 text-[#d4af37]" />
              <span>HYPERLOCAL CLOUD KITCHEN NETWORK</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0d261e] tracking-tight mt-1">
              Malashree Kitchen Network
            </h1>
            <p className="text-xs sm:text-sm text-[#52635c] mt-1.5 max-w-xl">
              We operate 6 cloud kitchens across Pune. Every order is automatically routed to your closest branch to ensure hot, 20-minute delivery.
            </p>
          </div>

          <button
            onClick={() => setShowLocationModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-md flex items-center gap-2 border border-[#d4af37]/30 cursor-pointer self-start md:self-center shrink-0"
          >
            <LocateFixed className="size-4 text-[#d4af37]" />
            <span>Update My Delivery Location</span>
          </button>
        </div>

        {/* Auto Dispatch Guarantee Card */}
        <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-[#064e3b] text-[#d4af37] grid place-items-center shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#064e3b]">
                Smart Distance Auto-Routing Active
              </h3>
              <p className="text-xs text-[#52635c] mt-0.5">
                Currently fulfilling your orders from:{" "}
                <b className="text-[#0d261e]">{userLocation?.kitchenName || "Nearest Malashree Branch"}</b>{" "}
                ({userLocation?.distanceKm ? `${userLocation.distanceKm} km away` : "Pune"})
              </p>
            </div>
          </div>

          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] text-xs font-black uppercase tracking-wider hover:bg-[#0a5c46] transition shrink-0"
          >
            <span>Order Food</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Branches Grid (Read-only Informational) */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#e6e2d8] shadow-2xs space-y-3">
            <RefreshCw className="size-8 animate-spin mx-auto text-[#064e3b]" />
            <p className="text-xs font-bold text-[#52635c]">Connecting to Malashree Kitchen Network...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeKitchens.map((b: any) => {
              const isAssigned =
                userLocation?.kitchenName === b.name ||
                userLocation?.label?.includes(b.area);

              return (
                <div
                  key={b.id || b._id}
                  className={`bg-white rounded-3xl p-6 border transition shadow-2xs flex flex-col justify-between space-y-5 ${
                    isAssigned
                      ? "border-[#064e3b] ring-2 ring-[#064e3b]/20"
                      : "border-[#e6e2d8]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="size-20 sm:size-24 rounded-2xl bg-gray-100 overflow-hidden shadow-2xs shrink-0 border border-[#e6e2d8]">
                      <img
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
                        alt={b.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base sm:text-lg text-[#0d261e] leading-snug truncate">
                          {b.name}
                        </h3>
                      </div>
                      {isAssigned && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-[10px]">
                          FULFILLING YOUR ORDERS
                        </span>
                      )}
                      <p className="text-xs text-[#52635c] mt-1.5 flex items-center gap-1">
                        <MapPin className="size-3.5 text-[#d4af37] shrink-0" />
                        <span className="truncate">{b.area || b.address || "Pune"}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#52635c] font-medium mt-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#064e3b] text-[#d4af37] font-extrabold text-[10px] flex items-center gap-0.5">
                          4.8 <Star className="size-2.5 fill-[#d4af37]" />
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#064e3b] font-bold">
                          <Clock className="size-3 text-[#064e3b]" />
                          {b.etaMin || 22} mins ETA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#52635c]">
                    <span className="font-semibold">
                      Service Radius: {((b.deliveryRadius || 10000) / 1000).toFixed(0)} km
                    </span>
                    <span className="font-bold text-[#064e3b]">100% Pure Veg</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
