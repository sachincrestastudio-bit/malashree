"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Building,
  Smartphone,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { getAssignedKitchenDetails } from "@/actions/kitchen";
import { getKitchenMenu } from "@/actions/menu";
import { placeOrder } from "@/actions/checkout";

export default function CheckoutPage() {
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);
  const cartTotals = useStore((s) => s.cartTotals);
  const profile = useStore((s) => s.profile);
  const branchId = useStore((s) => s.branchId);
  const kitchenMenu = useStore((s) => s.kitchenMenu);
  const setKitchenMenu = useStore((s) => s.setKitchenMenu);

  const [kitchenDetails, setKitchenDetails] = useState<any>(null);
  const [pay, setPay] = useState<string>("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(
    profile?.address || "Flat 402, Green Acres, Pimple Saudagar, Pune"
  );

  const nav = useRouter();

  useEffect(() => {
    getAssignedKitchenDetails().then((details) => {
      if (details) setKitchenDetails(details);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!kitchenMenu || kitchenMenu.length === 0) {
      getKitchenMenu(branchId).then((menu) => {
        if (mounted && menu && menu.length > 0) {
          setKitchenMenu(menu);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [branchId, kitchenMenu, setKitchenMenu]);

  const items = useMemo(() => {
    return cart
      .map((c) => {
        const dish = (kitchenMenu || []).find((d) => d.id === c.dishId);
        return { ...c, dish };
      })
      .filter((i) => i.dish);
  }, [cart, kitchenMenu]);

  const localSubtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.dish?.price || 0) * i.qty, 0);
  }, [items]);

  const subtotal = cartTotals?.subtotal ?? localSubtotal;
  const discount = cartTotals?.discount ?? 0;
  const delivery = cartTotals?.deliveryFee ?? (localSubtotal > 500 || localSubtotal === 0 ? 0 : 40);
  const gst = cartTotals?.tax ?? Math.round(localSubtotal * 0.05);
  const total = cartTotals?.grandTotal ?? Math.max(0, localSubtotal + gst + delivery - discount);
  const coupon = cartTotals?.couponCode || null;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    const address = deliveryAddress.trim() || "Pimple Saudagar, Pune";
    const res = await placeOrder(cart, coupon, address, pay);

    setLoading(false);

    if (res.success && res.orderNumber) {
      setDone(res.orderNumber);
      clearCart();
      setTimeout(() => nav.push(`/orders/${res.orderNumber}/track`), 1800);
    } else {
      setError(res.error || "Failed to place order. Please check your credentials.");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#fbf9f4] grid place-items-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-[#e6e2d8] space-y-4"
        >
          <div className="size-20 bg-emerald-100 text-[#064e3b] rounded-full grid place-items-center mx-auto">
            <CheckCircle2 className="size-10" />
          </div>
          <h2 className="text-2xl font-black text-[#0d261e] tracking-tight">Order Placed!</h2>
          <p className="text-xs text-[#52635c]">
            Order <span className="font-bold text-[#0d261e]">#{done}</span> has been transmitted to Malashree Kitchen.
          </p>
          <div className="pt-2">
            <Link
              href={`/orders/${done}/track`}
              className="w-full py-3.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-bold text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition flex items-center justify-center gap-2 border border-[#d4af37]/30"
            >
              <span>Track Live Delivery</span>
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-36">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/cart" className="p-2 rounded-xl bg-white border border-[#e6e2d8] text-[#0d261e] hover:bg-[#fbf9f4] transition shadow-2xs">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#0d261e] tracking-tight">
            Checkout & Payment
          </h1>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Delivery Address Card */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="size-4 text-[#d4af37]" />
              Delivery Address
            </h3>
            <span className="text-[10px] bg-emerald-50 text-[#064e3b] border border-emerald-300 font-black px-2 py-0.5 rounded-md">
              HOME
            </span>
          </div>

          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Flat, House no, Building, Street, Area"
            className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-semibold text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
          />
          <p className="text-[11px] text-[#52635c]">
            Assigned Kitchen: <span className="font-bold text-[#0d261e]">{kitchenDetails?.name || "Malashree Kitchen"}</span> ({kitchenDetails?.area || "Pimple Saudagar"})
          </p>
        </section>

        {/* 2. Payment Options Selector */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-4">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="size-4 text-[#d4af37]" />
            Choose Payment Method
          </h3>

          <div className="space-y-2.5">
            {/* UPI Option */}
            <label
              onClick={() => setPay("upi")}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                pay === "upi"
                  ? "border-[#064e3b] bg-emerald-50/50 text-[#0d261e]"
                  : "border-[#e6e2d8] hover:border-[#d4af37]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 grid place-items-center text-[#d4af37]">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0d261e]">UPI Instant Payment</h4>
                  <p className="text-xs text-[#52635c]">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <input type="radio" name="payment" checked={pay === "upi"} onChange={() => setPay("upi")} className="accent-[#064e3b]" />
            </label>

            {/* Card Option */}
            <label
              onClick={() => setPay("card")}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                pay === "card"
                  ? "border-[#064e3b] bg-emerald-50/50 text-[#0d261e]"
                  : "border-[#e6e2d8] hover:border-[#d4af37]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-500/10 grid place-items-center text-[#064e3b]">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0d261e]">Credit / Debit Cards</h4>
                  <p className="text-xs text-[#52635c]">Visa, Mastercard, RuPay, Diners</p>
                </div>
              </div>
              <input type="radio" name="payment" checked={pay === "card"} onChange={() => setPay("card")} className="accent-[#064e3b]" />
            </label>

            {/* Net Banking */}
            <label
              onClick={() => setPay("netbanking")}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                pay === "netbanking"
                  ? "border-[#064e3b] bg-emerald-50/50 text-[#0d261e]"
                  : "border-[#e6e2d8] hover:border-[#d4af37]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/10 grid place-items-center text-purple-700">
                  <Building className="size-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0d261e]">Net Banking</h4>
                  <p className="text-xs text-[#52635c]">All major Indian banks supported</p>
                </div>
              </div>
              <input type="radio" name="payment" checked={pay === "netbanking"} onChange={() => setPay("netbanking")} className="accent-[#064e3b]" />
            </label>

            {/* COD */}
            <label
              onClick={() => setPay("cod")}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                pay === "cod"
                  ? "border-[#064e3b] bg-emerald-50/50 text-[#0d261e]"
                  : "border-[#e6e2d8] hover:border-[#d4af37]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 grid place-items-center text-[#064e3b]">
                  <Banknote className="size-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0d261e]">Cash on Delivery</h4>
                  <p className="text-xs text-[#52635c]">Pay cash upon doorstep arrival</p>
                </div>
              </div>
              <input type="radio" name="payment" checked={pay === "cod"} onChange={() => setPay("cod")} className="accent-[#064e3b]" />
            </label>
          </div>
        </section>

        {/* 3. Order Summary Details */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider">
            Order Breakdown
          </h3>
          <div className="space-y-2 text-xs text-[#52635c] font-medium">
            <div className="flex justify-between">
              <span>Items Total ({items.length} items)</span>
              <span className="text-[#0d261e] font-bold">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#064e3b] font-bold">
                <span>Coupon Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{delivery === 0 ? <span className="text-[#064e3b] font-bold">FREE</span> : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & GST (5%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="border-t border-[#e6e2d8] pt-3 flex justify-between items-center text-sm font-black text-[#0d261e]">
              <span>Grand Total</span>
              <span className="text-base text-[#064e3b]">₹{total}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Payment Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e6e2d8] p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#52635c] block leading-none">TOTAL TO PAY</span>
            <span className="text-xl font-black text-[#0d261e]">₹{total}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer border border-[#d4af37]/30"
          >
            {loading ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Place Order & Pay</span>
                <ChevronRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
