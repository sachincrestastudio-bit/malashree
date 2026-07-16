"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Navigation, AlertTriangle, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import { requestGPSLocation } from "@/services/client/LocationService";
import { assignNearestKitchen } from "@/services/client/KitchenAssignmentService";
import { useLocationStore } from "@/store/locationStore";

export function LocationModal() {
  const resolved = useStore(s => s.locationResolved);
  const resolve = useStore(s => s.resolveLocation);
  
  const { setLocation, setPermissionError, setLoading } = useLocationStore();

  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolved) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    } else {
      setOpen(false);
    }
  }, [resolved]);

  const detect = async () => {
    setDetecting(true);
    setError(null);
    setLoading(true);

    try {
      const coords = await requestGPSLocation();
      const assignment = assignNearestKitchen(coords.latitude, coords.longitude);

      if (assignment.isOutsideDeliveryArea || !assignment.kitchenId) {
        setError("Outside Delivery Area. Currently we only deliver within our kitchen radius.");
        setPermissionError('error');
        setDetecting(false);
        setLoading(false);
        return;
      }

      setLocation(coords.latitude, coords.longitude, assignment.kitchenId, assignment.distance, 'gps');
      resolve(assignment.kitchenId);
      
      setOpen(false);
      setDetecting(false);
    } catch (err: any) {
      console.error("GPS Error:", err);
      let msg = "GPS is off or permission was denied. Location is required to order.";
      if (err.code === 1 || err.code === err.PERMISSION_DENIED) {
        msg = "Location permission denied. Please allow location access in your browser settings to place an order.";
        setPermissionError('denied');
      } else if (err.code === 2 || err.code === err.POSITION_UNAVAILABLE) {
        msg = "GPS location unavailable. Please make sure your device GPS is turned on and try again.";
        setPermissionError('error');
      } else if (err.code === 3 || err.code === err.TIMEOUT) {
        msg = "GPS location request timed out. Please try again.";
        setPermissionError('error');
      } else {
        setPermissionError('error');
      }
      setError(msg);
      setDetecting(false);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-md grid place-items-center p-4"
        >
          <motion.div
            initial={{ y: 45, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 45, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-full max-w-md bg-cream rounded-3xl p-8 border border-ink/5 shadow-[0_30px_70px_-15px_rgba(30,26,23,0.35)]"
          >
            <div className="size-16 rounded-2xl bg-lime grid place-items-center mb-6 shadow-sm">
              <MapPin className="size-8 text-ink" />
            </div>

            <h2 className="font-display text-3xl leading-tight text-ink">
              locate your nearest <span className="italic">malashree</span>
            </h2>

            <p className="mt-3 text-sm text-olive-dark leading-relaxed">
              To guarantee your food arrives piping hot, we cook and deliver directly from our local kitchen zones. GPS access is required to place an order.
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-xs text-red-700 flex gap-3 items-start"
              >
                <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium leading-normal">{error}</span>
              </motion.div>
            )}

            <button
              onClick={detect}
              disabled={detecting}
              className="mt-6 w-full h-13 rounded-full bg-ink text-cream hover:bg-ink/90 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 disabled:opacity-75 disabled:active:scale-100"
            >
              {detecting ? (
                <>
                  <RefreshCw className="size-4 animate-spin text-lime" />
                  Requesting GPS satellites...
                </>
              ) : (
                <>
                  <Navigation className="size-4 text-lime fill-lime" />
                  Enable GPS Location
                </>
              )}
            </button>

            <div className="mt-4 text-[10px] text-center text-olive font-semibold tracking-wide uppercase">
              GPS Location is Mandatory
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
