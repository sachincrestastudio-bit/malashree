"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Receipt,
  Sparkles,
} from "lucide-react";

interface BillSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  packagingCharge?: number;
  deliveryFee: number;
  distanceKm?: number;
  platformFee?: number;
  gst: number;
  gstPercentage?: number;
  discount?: number;
  couponCode?: string | null;
  grandTotal: number;
}

export function BillSummaryDrawer({
  isOpen,
  onClose,
  subtotal,
  packagingCharge = 15,
  deliveryFee,
  distanceKm = 2.1,
  platformFee = 5.0,
  gst,
  gstPercentage = 5,
  discount = 0,
  couponCode,
  grandTotal,
}: BillSummaryDrawerProps) {
  const effectiveTotal = Math.max(
    0,
    subtotal + packagingCharge + deliveryFee + platformFee + gst - discount
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
          />

          {/* Card Container (Responsive: Bottom Sheet on Mobile, Centered Modal on Laptop/Desktop) */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative z-50 w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#e6e2d8] overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
          >
            {/* Modal Header with Close Button */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-emerald-50 text-[#064e3b] grid place-items-center">
                  <Receipt className="size-4 text-[#064e3b]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#0d261e] tracking-tight leading-tight">
                    Bill Summary
                  </h2>
                  <span className="text-[10px] font-bold text-[#064e3b]">
                    Malashree Pure Veg · 100% Verified
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0d261e] transition grid place-items-center cursor-pointer"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Bill Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Itemized breakdown table */}
              <div className="space-y-3.5 text-xs text-[#52635c] font-medium">
                {/* 1. Item Total */}
                <div className="flex justify-between items-center">
                  <span className="text-[#0d261e] font-semibold text-xs">Item total</span>
                  <span className="text-[#0d261e] font-extrabold text-sm">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* 2. Restaurant Packaging Charges */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="underline decoration-dotted decoration-gray-400 font-semibold text-[#0d261e]">
                      Restaurant packaging charges
                    </span>
                    <span className="text-[#0d261e] font-bold">₹{packagingCharge.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-[#52635c]">
                    Hygienic tamper-proof food packaging
                  </p>
                </div>

                {/* 3. Delivery Fee */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="underline decoration-dotted decoration-gray-400 font-semibold text-[#0d261e]">
                      Delivery fee ({distanceKm} km)
                    </span>
                    <span className="text-[#0d261e] font-bold">
                      {deliveryFee === 0 ? (
                        <span className="text-[#064e3b] font-black">FREE</span>
                      ) : (
                        `₹${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#52635c]">
                    Express hot delivery from nearest branch
                  </p>
                </div>

                {/* 4. Platform Fee */}
                <div className="flex justify-between items-center">
                  <span>Platform fee</span>
                  <span className="text-[#0d261e] font-bold">₹{platformFee.toFixed(2)}</span>
                </div>

                {/* 5. GST (govt. taxes) - Dynamic percentage configured from Admin */}
                <div className="flex justify-between items-center">
                  <span className="underline decoration-dotted decoration-gray-400">
                    GST ({gstPercentage}% govt. taxes)
                  </span>
                  <span className="text-[#0d261e] font-bold">₹{gst.toFixed(2)}</span>
                </div>

                {/* 6. Coupon Discount (if active) */}
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#064e3b] font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#064e3b]" />
                      <span>Coupon Discount ({couponCode || "PROMO"})</span>
                    </div>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total To Pay Row */}
              <div className="pt-4 border-t border-[#e6e2d8] flex justify-between items-center">
                <span className="font-extrabold text-base text-[#0d261e]">To pay</span>
                <span className="font-black text-xl text-[#0d261e]">
                  ₹{effectiveTotal.toFixed(2)}
                </span>
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
                className="px-7 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-extrabold text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition border border-[#d4af37]/30 cursor-pointer shadow-xs"
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
