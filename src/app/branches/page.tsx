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
  AlertTriangle,
  LocateFixed,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { setAssignedKitchen, getActiveKitchens, findNearestKitchenAndAssign } from "@/actions/kitchen";
import { requestGPSLocation } from "@/services/client/LocationService";

export default function BranchesPage() {
  const currentBranchId = useStore((s) => s.branchId);
  const setBranch = useStore((s) => s.setBranch);
  const resolveLocation = useStore((s) => s.resolveLocation);
  const userLocation = useStore((s) => s.userLocation);
  const setUserLocation = useStore((s) => s.setUserLocation);

  const [activeKitchens, setActiveKitchens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getActiveKitchens().then((kitchens) => {
      if (kitchens && kitchens.length > 0) {
        setActiveKitchens(kitchens);
      }
      setLoading(false);
    });
  }, []);

  const handleSelectKitchen = async (branchId: string) => {
    setSwitching(branchId);
    await setAssignedKitchen(branchId);
    setBranch(branchId);
    resolveLocation(branchId);
    setSwitching(null);
  };

  const handleDetectGPS = async () => {
    setDetecting(true);
    setStatusMsg(null);

    try {
      const coords = await requestGPSLocation();
      const res = await findNearestKitchenAndAssign(coords.latitude, coords.longitude);

      if (res.success && res.nearestKitchen) {
        setBranch(res.nearestKitchen.id);
        resolveLocation(res.nearestKitchen.id);
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          distanceKm: res.nearestKitchen.distanceKm,
          etaMin: res.nearestKitchen.etaMin,
          kitchenName: res.nearestKitchen.name,
          label: `Near ${res.nearestKitchen.area}`,
        });

        if (res.allKitchens) {
          setActiveKitchens(res.allKitchens);
        }

        setStatusMsg({
          type: "success",
          text: `Located! Assigned to nearest kitchen: ${res.nearestKitchen.name} (${res.nearestKitchen.distanceKm} km away).`,
        });
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to locate nearest kitchen." });
      }
    } catch (err: any) {
      console.error("GPS Detection error:", err);
      setStatusMsg({
        type: "error",
        text: err.message || "GPS location permission denied or unavailable.",
      });
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-32">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Masthead Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight">
              Malashree Cloud Kitchens
            </h1>
            <p className="text-xs text-[#52635c] mt-1">
              Select your delivery kitchen in Pune. Freshly cooked & dispatched in 20-25 minutes.
            </p>
          </div>

          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="px-5 py-3 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-md flex items-center gap-2 border border-[#d4af37]/30 cursor-pointer self-start sm:self-center"
          >
            {detecting ? (
              <>
                <RefreshCw className="size-4 animate-spin text-[#d4af37]" />
                <span>Locating Nearest Branch...</span>
              </>
            ) : (
              <>
                <LocateFixed className="size-4 text-[#d4af37]" />
                <span>Auto-Detect Nearest Kitchen</span>
              </>
            )}
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xs ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 text-rose-700 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Branches Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e6e2d8] shadow-2xs space-y-3">
            <RefreshCw className="size-8 animate-spin mx-auto text-[#064e3b]" />
            <p className="text-xs font-bold text-[#52635c]">Connecting to Malashree Kitchen Network...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeKitchens.map((b: any) => {
              const isSelected =
                currentBranchId === b.id || currentBranchId === b.code || currentBranchId === b._id;

              return (
                <div
                  key={b.id || b._id}
                  className={`bg-white rounded-3xl p-5 border transition shadow-2xs flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "border-[#064e3b] ring-2 ring-[#064e3b]/20"
                      : "border-[#e6e2d8] hover:border-[#d4af37]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="size-20 rounded-2xl bg-gray-100 overflow-hidden shadow-2xs shrink-0 border border-[#e6e2d8]">
                      <img
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
                        alt={b.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-[#0d261e] leading-snug truncate">
                          {b.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-[10px]">
                            CONNECTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#52635c] mt-0.5 flex items-center gap-1">
                        <MapPin className="size-3 text-[#d4af37]" />
                        {b.area || b.address || "Pune"}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#52635c] font-medium mt-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#064e3b] text-[#d4af37] font-extrabold text-[10px] flex items-center gap-0.5">
                          4.8 <Star className="size-2.5 fill-[#d4af37]" />
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#064e3b] font-bold">
                          <Clock className="size-3 text-[#064e3b]" />
                          {b.etaMin || 25} mins ETA
                        </span>
                        {b.distanceKm !== undefined && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-[#0d261e]">{b.distanceKm} km away</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-[#52635c] font-semibold">
                      Service Radius: {((b.deliveryRadius || 10000) / 1000).toFixed(0)} km
                    </span>

                    {isSelected ? (
                      <div className="flex items-center gap-1 text-xs font-black text-[#064e3b]">
                        <CheckCircle2 className="size-4 text-[#064e3b]" />
                        <span>Active Kitchen</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectKitchen(b.id || b._id || b.code)}
                        disabled={switching === (b.id || b._id)}
                        className="px-4 py-2 rounded-xl bg-[#fbf9f4] hover:bg-[#064e3b] hover:text-[#d4af37] transition text-xs font-bold text-[#0d261e] flex items-center gap-1.5 cursor-pointer shadow-2xs border border-[#e6e2d8]"
                      >
                        {switching === (b.id || b._id) ? (
                          <>
                            <RefreshCw className="size-3.5 animate-spin" />
                            <span>Switching...</span>
                          </>
                        ) : (
                          <>
                            <span>Select Kitchen</span>
                            <ArrowRight className="size-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
