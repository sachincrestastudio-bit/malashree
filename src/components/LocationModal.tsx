"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  LocateFixed,
  X,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Building,
  Navigation,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { requestGPSLocation } from "@/services/client/LocationService";
import { findNearestKitchenAndAssign } from "@/actions/kitchen";

interface LocationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LocationModal({ isOpen: externalIsOpen, onClose: externalOnClose }: LocationModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const setBranch = useStore((s) => s.setBranch);
  const resolveLocation = useStore((s) => s.resolveLocation);
  const userLocation = useStore((s) => s.userLocation);
  const setUserLocation = useStore((s) => s.setUserLocation);
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);

  const [detecting, setDetecting] = useState(false);
  const [addressInput, setAddressInput] = useState(
    profile?.address || userLocation?.label || ""
  );
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-detect GPS location
  const handleGPSDetect = async () => {
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

        setStatusMsg({
          type: "success",
          text: `Auto-routed to closest kitchen: ${res.nearestKitchen.name} (${res.nearestKitchen.distanceKm} km away)!`,
        });

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Failed to locate nearest kitchen.",
        });
      }
    } catch (err: any) {
      console.error("GPS detection error:", err);
      setStatusMsg({
        type: "error",
        text: err.message || "GPS location permission denied.",
      });
    } finally {
      setDetecting(false);
    }
  };

  // Quick area selection that auto-calculates coordinates in Pune
  const PUNE_AREAS: { [key: string]: { lat: number; lng: number; label: string } } = {
    "Pimple Saudagar": { lat: 18.5989, lng: 73.7978, label: "Pimple Saudagar, Pune" },
    "Chinchwad Station": { lat: 18.6275, lng: 73.7997, label: "Chinchwad Station, Pune" },
    "Chinchwad Gaon": { lat: 18.6350, lng: 73.7850, label: "Chinchwad Gaon, Pune" },
    "Sangvi": { lat: 18.5814, lng: 73.8174, label: "Old & New Sangvi, Pune" },
    "Aundh": { lat: 18.5580, lng: 73.8075, label: "Aundh, Pune" },
    "Kalewadi": { lat: 18.6080, lng: 73.7890, label: "Kalewadi, Pune" },
    "Wakad": { lat: 18.5985, lng: 73.7667, label: "Wakad, Pune" },
    "Baner": { lat: 18.5590, lng: 73.7868, label: "Baner, Pune" },
    "Ravet / Nigdi": { lat: 18.6480, lng: 73.7550, label: "Ravet / Nigdi, Pune" },
  };

  const handleSelectArea = async (areaKey: string) => {
    const target = PUNE_AREAS[areaKey];
    if (!target) return;

    setDetecting(true);
    setStatusMsg(null);

    const res = await findNearestKitchenAndAssign(target.lat, target.lng);
    setDetecting(false);

    if (res.success && res.nearestKitchen) {
      setBranch(res.nearestKitchen.id);
      resolveLocation(res.nearestKitchen.id);
      setUserLocation({
        lat: target.lat,
        lng: target.lng,
        distanceKm: res.nearestKitchen.distanceKm,
        etaMin: res.nearestKitchen.etaMin,
        kitchenName: res.nearestKitchen.name,
        label: target.label,
      });

      if (profile) {
        updateProfile({ address: target.label });
      }

      setStatusMsg({
        type: "success",
        text: `Assigned closest branch: ${res.nearestKitchen.name} (${res.nearestKitchen.distanceKm} km away)!`,
      });

      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative z-50 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#e6e2d8] space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-50 text-[#064e3b] grid place-items-center">
                  <MapPin className="size-4.5 text-[#064e3b]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0d261e] tracking-tight">
                    Set Delivery Location
                  </h3>
                  <span className="text-[10px] text-[#52635c]">
                    Closest branch is automatically assigned
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0d261e] grid place-items-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Status Alert */}
            {statusMsg && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xs ${
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

            {/* Auto GPS Detection Button */}
            <button
              onClick={handleGPSDetect}
              disabled={detecting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-sm flex items-center justify-center gap-2 border border-[#d4af37]/30 cursor-pointer disabled:opacity-50"
            >
              {detecting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Locating Closest Kitchen...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="size-4 text-[#d4af37]" />
                  <span>Detect My Current GPS Location</span>
                </>
              )}
            </button>

            {/* Current Assigned Kitchen Notice */}
            {userLocation?.kitchenName && (
              <div className="bg-[#fbf9f4] rounded-2xl p-3.5 border border-[#e6e2d8] space-y-1">
                <div className="text-[10px] font-black uppercase text-[#064e3b] tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3 text-[#d4af37]" />
                  <span>Assigned Fulfilling Kitchen</span>
                </div>
                <div className="text-xs font-bold text-[#0d261e]">
                  {userLocation.kitchenName} ({userLocation.label || "Pune"})
                </div>
                <div className="text-[11px] text-[#52635c]">
                  Distance: <b>{userLocation.distanceKm || 1.2} km</b> · Delivery in{" "}
                  <b>{userLocation.etaMin || 22} mins</b>
                </div>
              </div>
            )}

            {/* Quick Pune Delivery Areas */}
            <div className="space-y-2.5">
              <span className="text-xs font-extrabold text-[#0d261e] block">
                Or Select Your Delivery Area in Pune:
              </span>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {Object.keys(PUNE_AREAS).map((area) => (
                  <button
                    key={area}
                    onClick={() => handleSelectArea(area)}
                    disabled={detecting}
                    className="p-2.5 rounded-xl bg-white border border-[#e6e2d8] hover:border-[#064e3b] hover:bg-emerald-50/50 text-left transition cursor-pointer text-xs font-bold text-[#0d261e] flex items-center justify-between"
                  >
                    <span className="truncate">{area}</span>
                    <Navigation className="size-3 text-[#52635c] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#52635c] text-center pt-2">
              Note: Orders are always prepared at the nearest kitchen to guarantee hot, fresh delivery.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
