"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Receipt,
  Crown,
  Heart,
  Info,
  Check,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface BillSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  packagingCharge?: number;
  deliveryFee: number;
  distanceKm?: number;
  platformFee?: number;
  donation?: number;
  gst: number;
  discount?: number;
  couponCode?: string | null;
  tipAmount?: number;
  grandTotal: number;
  selectedTip?: number | null;
  onSelectTip?: (tip: number | null) => void;
}

export function BillSummaryDrawer({
  isOpen,
  onClose,
  subtotal,
  packagingCharge = 15,
  deliveryFee,
  distanceKm = 2.1,
  platformFee = 5.0,
  donation = 3.0,
  gst,
  discount = 0,
  couponCode,
  tipAmount = 0,
  grandTotal,
  selectedTip,
  onSelectTip,
}: BillSummaryDrawerProps) {
  const [includeDonation, setIncludeDonation] = useState(true);
  const [hasGold, setHasGold] = useState(false);

  const effectiveDelivery = hasGold ? 0 : deliveryFee;
  const effectiveDonation = includeDonation ? donation : 0;
  const effectiveTotal = Math.max(
    0,
    subtotal + packagingCharge + effectiveDelivery + platformFee + effectiveDonation + gst + tipAmount - discount
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Close button floating above card (matching Zomato design) */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            className="absolute z-60 top-4 right-4 sm:top-auto sm:bottom-[calc(100%-10px)] sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mb-3 size-10 rounded-full bg-[#1c2421]/90 text-white hover:bg-black transition shadow-lg grid place-items-center cursor-pointer border border-white/20"
          >
            <X className="size-5" />
          </motion.button>

          {/* Slide-up Card Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-50 w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#e6e2d8] overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Scrollable Bill Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#0d261e] tracking-tight">
                  Bill Summary
                </h2>
                <span className="text-[11px] font-bold text-[#064e3b] bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                  100% PURE VEG
                </span>
              </div>

              {/* Itemized breakdown table */}
              <div className="space-y-3.5 text-xs text-[#52635c] font-medium">
                {/* 1. Item Total */}
                <div className="flex justify-between items-center">
                  <span className="text-[#0d261e] font-semibold text-xs">Item total</span>
                  <span className="text-[#0d261e] font-extrabold text-sm">₹{subtotal}</span>
                </div>

                {/* 2. Restaurant Packaging Charges */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="underline decoration-dotted decoration-gray-400 font-semibold text-[#0d261e]">
                      Restaurant packaging charges
                    </span>
                    <span className="text-[#0d261e] font-bold">₹{packagingCharge}</span>
                  </div>
                  <p className="text-[10px] text-[#52635c]">
                    This is decided & charged by the restaurant
                  </p>
                </div>

                {/* 3. Delivery Partner Fee */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="underline decoration-dotted decoration-gray-400 font-semibold text-[#0d261e]">
                      Delivery partner fee for {distanceKm} km
                    </span>
                    <span className="text-[#0d261e] font-bold">
                      {effectiveDelivery === 0 ? (
                        <span className="text-[#064e3b] font-black">FREE</span>
                      ) : (
                        `₹${effectiveDelivery}`
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#52635c]">
                    Goes to them for their time and effort
                  </p>
                </div>

                {/* 4. Malashree Gold Free Delivery Banner */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-6 rounded-full bg-[#d4af37]/20 text-[#064e3b] grid place-items-center shrink-0">
                      <Crown className="size-3.5 fill-[#d4af37] text-[#064e3b]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-amber-950 text-xs block truncate">
                        {hasGold ? "Free delivery active with Gold" : `Save ₹${deliveryFee} with free delivery`}
                      </span>
                      <span className="text-[10px] text-amber-800 block truncate">
                        {hasGold ? "Malashree Gold Member" : "Malashree Gold at ₹30 for 3 months"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setHasGold(!hasGold)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 border ${
                      hasGold
                        ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                        : "bg-white text-rose-900 border-rose-300 hover:bg-rose-50"
                    }`}
                  >
                    {hasGold ? "Active ✓" : "Add Gold"}
                  </button>
                </div>

                {/* 5. Platform Fee */}
                <div className="flex justify-between items-center">
                  <span>Platform fee</span>
                  <span className="text-[#0d261e] font-bold">₹{platformFee.toFixed(2)}</span>
                </div>

                {/* 6. Feeding India Donation */}
                <div className="flex justify-between items-center">
                  <span>Feeding India donation</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIncludeDonation(!includeDonation)}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      {includeDonation ? "Edit" : "Add"}
                    </button>
                    <span className="text-[#0d261e] font-bold">
                      {includeDonation ? `₹${donation}` : "₹0"}
                    </span>
                  </div>
                </div>

                {/* 7. GST (govt. taxes) */}
                <div className="flex justify-between items-center">
                  <span className="underline decoration-dotted decoration-gray-400">
                    GST (govt. taxes)
                  </span>
                  <span className="text-[#0d261e] font-bold">₹{gst.toFixed(2)}</span>
                </div>

                {/* 8. Coupon Discount (if active) */}
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#064e3b] font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#064e3b]" />
                      <span>Coupon Discount ({couponCode || "PROMO"})</span>
                    </div>
                    <span>-₹{discount}</span>
                  </div>
                )}

                {/* 9. Tip Amount (if added) */}
                {tipAmount > 0 && (
                  <div className="flex justify-between items-center text-[#064e3b] font-bold">
                    <span>Delivery Partner Tip</span>
                    <span>₹{tipAmount}</span>
                  </div>
                )}
              </div>

              {/* Total To Pay Row */}
              <div className="pt-3 border-t border-[#e6e2d8] flex justify-between items-center">
                <span className="font-extrabold text-base text-[#0d261e]">To pay</span>
                <span className="font-black text-xl text-[#0d261e]">
                  ₹{effectiveTotal.toFixed(2)}
                </span>
              </div>

              {/* Gratitude Corner: Tip your delivery partner */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#52635c]">
                    GRATITUDE CORNER
                  </span>
                </div>

                <div className="bg-[#fbf9f4] rounded-2xl p-4 border border-[#e6e2d8] flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#0d261e] flex items-center gap-1.5">
                      <Heart className="size-3.5 text-[#d4af37] fill-[#d4af37]" />
                      Tip your delivery partner
                    </h4>
                    <p className="text-[10px] text-[#52635c]">
                      They'll get notified instantly. The full tip is sent after delivery.
                    </p>

                    {/* Tip Selection Pills */}
                    <div className="flex gap-2 pt-2">
                      {[20, 30, 50].map((t) => (
                        <button
                          key={t}
                          onClick={() => onSelectTip?.(selectedTip === t ? null : t)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            selectedTip === t
                              ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                              : "bg-white text-[#0d261e] border-[#e6e2d8] hover:border-[#d4af37]"
                          }`}
                        >
                          ₹{t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center shrink-0">
                    <span className="text-2xl">🙏</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action inside modal */}
            <div className="p-4 bg-[#fbf9f4] border-t border-[#e6e2d8] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#52635c] block uppercase">
                  TOTAL AMOUNT
                </span>
                <span className="text-lg font-black text-[#0d261e]">
                  ₹{effectiveTotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-extrabold text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition border border-[#d4af37]/30 cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
