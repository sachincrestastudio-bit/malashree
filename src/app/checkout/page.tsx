"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Check, CreditCard, Wallet, Banknote, MapPin, RefreshCw, AlertTriangle, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { findDish, getBranch } from "@/lib/data";
import { placeOrder } from "@/actions/checkout";
import { getKitchenMenu } from "@/actions/menu";
import Link from "next/link";

function Checkout() {
  const branchId = useStore((s) => s.branchId);
  const cart = useStore((s) => s.cart);
  const kitchenMenu = useStore((s) => s.kitchenMenu);
  const setKitchenMenu = useStore((s) => s.setKitchenMenu);
  const branch = getBranch(branchId);
  const profile = useStore((s) => s.profile);
  const locationResolved = useStore((s) => s.locationResolved);
  const clearCart = useStore((s) => s.clearCart);
  const cartTotals = useStore((s) => s.cartTotals);

  const [pay, setPay] = useState("upi");
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useRouter();

  // Load kitchen menu if not already populated in store
  useEffect(() => {
    let mounted = true;
    if (kitchenMenu.length === 0) {
      getKitchenMenu(branchId).then((menu) => {
        if (mounted && menu && menu.length > 0) {
          setKitchenMenu(menu);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [branchId, kitchenMenu.length, setKitchenMenu]);

  // Resolve dish objects dynamically from database menu or static fallback
  const items = useMemo(() => {
    return cart
      .map((c) => {
        const dish = kitchenMenu.find((d) => d.id === c.dishId) || findDish(c.dishId);
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

  useEffect(() => {
    if (!locationResolved) {
      nav.push("/");
    }
  }, [locationResolved, nav]);

  const submit = async () => {
    if (!profile) {
      nav.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    const address = profile.address || "Pimple Saudagar, Pune";
    const res = await placeOrder(cart, coupon, address, pay);

    setLoading(false);

    if (res.success && res.orderNumber) {
      setDone(res.orderNumber);
      clearCart();
      setTimeout(() => nav.push(`/orders/${res.orderNumber}/track`), 2500);
    } else {
      setError(res.error || "Failed to place order. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white border-2 border-ink p-8 rounded-3xl max-w-md shadow-lg"
        >
          <div className="size-20 rounded-full bg-lime grid place-items-center mx-auto mb-4 border border-ink">
            <Check className="size-10 text-ink" />
          </div>
          <h1 className="font-display text-4xl text-ink">Order Placed!</h1>
          <p className="mt-3 text-sm text-olive-dark font-mono">
            Order <span className="font-bold text-ink">#{done}</span> · Arriving in ~{branch.etaMin} mins from {branch.area}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={`/orders/${done}/track`}
              className="px-6 py-3 bg-ink text-lime text-xs font-mono font-bold uppercase tracking-widest rounded-full hover:bg-emerald transition flex items-center justify-center gap-2"
            >
              Track Live Order 🛵 <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0 || (kitchenMenu.length > 0 && items.length === 0)) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-display text-4xl text-ink">Your cart is empty</h1>
          <p className="text-olive-dark text-sm mt-2">Add your favorite pure-veg dishes to proceed with checkout.</p>
          <Link
            href="/menu"
            className="inline-flex mt-6 px-8 py-3 bg-ink text-lime font-mono text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald transition"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const methods = [
    { id: "upi", label: "UPI Instant Pay", icon: Wallet, sub: "Google Pay, PhonePe, Paytm" },
    { id: "card", label: "Credit / Debit Card", icon: CreditCard, sub: "Visa, MasterCard, RuPay" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="border-b border-ink/10 pb-4 mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.95]">
            check<span className="italic text-emerald">out</span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-olive mt-2">
            Cooking at {branch.name} ({branch.area})
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink/10">
              <div className="text-xs font-mono uppercase tracking-widest text-olive mb-3 font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-lime-deep" /> Delivery Address
              </div>
              <div className="font-display text-lg font-bold text-ink">{profile?.name ?? "Guest Customer"}</div>
              <div className="text-sm text-olive-dark mt-1 leading-relaxed">
                {profile?.address ? profile.address : "Pimple Saudagar, Pune"}
              </div>
              <div className="text-xs text-olive-dark font-mono mt-1">{profile?.phone ?? "Phone number linked"}</div>

              {!profile && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <span>Please sign in or register to place your order.</span>
                  <Link href="/login" className="font-bold text-ink underline">Log In</Link>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink/10">
              <div className="text-xs font-mono uppercase tracking-widest text-olive mb-4 font-semibold">
                Select Payment Method
              </div>
              <div className="space-y-3">
                {methods.map((m) => {
                  const Icon = m.icon;
                  const selected = pay === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPay(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${
                        selected ? "border-ink bg-cream/70 shadow-sm" : "border-ink/10 bg-white hover:border-ink/30"
                      }`}
                    >
                      <Icon className={`size-5 ${selected ? "text-emerald" : "text-olive"}`} />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-ink">{m.label}</div>
                        <div className="text-xs text-olive-dark">{m.sub}</div>
                      </div>
                      <div
                        className={`size-5 rounded-full border-2 grid place-items-center ${
                          selected ? "border-ink bg-ink" : "border-ink/20"
                        }`}
                      >
                        {selected && <Check className="size-3 text-lime" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="md:col-span-2 bg-ink text-cream rounded-3xl p-6 h-fit shadow-md border border-lime/30">
            <div className="text-xs font-mono uppercase tracking-widest text-lime font-bold">
              {branch.area} Kitchen Zone
            </div>
            <div className="font-display text-2xl mt-1 text-cream">
              {items.length} dish{items.length > 1 ? "es" : ""} in order
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono border-t border-cream/10 pt-4">
              {items.map((i) => {
                if (!i.dish) return null;
                return (
                  <div key={i.dishId} className="flex justify-between text-cream/80">
                    <span className="truncate pr-2">
                      {i.qty}× {i.dish.name}
                    </span>
                    <span className="text-lime font-bold">₹{i.dish.price * i.qty}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-cream/10 space-y-1.5 text-xs font-mono text-cream/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-cream">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-lime font-bold">
                  <span>Discount ({coupon})</span>
                  <span>−₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-cream/20 flex justify-between items-baseline">
              <span className="text-sm font-mono uppercase tracking-widest">Grand Total</span>
              <span className="font-display text-3xl text-lime font-bold">₹{total}</span>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="mt-6 w-full h-13 rounded-full bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest hover:bg-lime/90 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-4 animate-spin text-ink" /> Placing Order…
                </>
              ) : (
                "Confirm & Place Order"
              )}
            </button>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Checkout;
