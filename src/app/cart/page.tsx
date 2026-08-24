"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Ticket,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Heart,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { getBranch, findDish, ALL_CATEGORY_DISHES, Dish } from "@/lib/data";
import { syncCartWithServer, applyCouponCode } from "@/actions/cart";

export default function CartPage() {
  const branchId = useStore((s) => s.branchId);
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const setQty = useStore((s) => s.setQty);
  const clearCart = useStore((s) => s.clearCart);
  const cartTotals = useStore((s) => s.cartTotals);
  const setCartTotals = useStore((s) => s.setCartTotals);
  const kitchenMenu = useStore((s) => s.kitchenMenu) || [];
  const profile = useStore((s) => s.profile);
  const branch = getBranch(branchId);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [cookingNote, setCookingNote] = useState("");
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [deliveryInstruction, setDeliveryInstruction] = useState<string | null>(null);

  // Sync cart totals with server
  useEffect(() => {
    let mounted = true;
    const updateTotals = async () => {
      if (cart.length > 0) {
        try {
          const res = await syncCartWithServer(cart);
          if (mounted && res && res.totals) {
            setCartTotals(res.totals);
          }
        } catch (e) {
          console.error("Cart sync notice:", e);
        }
      }
    };
    const timer = setTimeout(updateTotals, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [cart, setCartTotals]);

  // Combined dish map
  const dishMap = useMemo(() => {
    const map = new Map<string, Dish>();
    for (const d of branch.menu) map.set(d.id, d);
    for (const d of ALL_CATEGORY_DISHES) if (!map.has(d.id)) map.set(d.id, d);
    for (const k of kitchenMenu) {
      map.set(k.id, {
        id: k.id,
        name: k.name,
        desc: k.desc || "",
        price: k.price,
        category: k.category,
        tag: k.tag,
        rating: k.rating || 4.8,
        reviews: k.reviews || 120,
        veg: k.veg !== undefined ? k.veg : true,
        spice: k.spice || 1,
        time: k.time || "25 mins",
        image: k.image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
      });
    }
    return map;
  }, [branch.menu, kitchenMenu]);

  // Cart item objects
  const items = useMemo(() => {
    return cart
      .map((c) => ({
        ...c,
        dish: dishMap.get(c.dishId) || findDish(c.dishId),
      }))
      .filter((i) => i.dish);
  }, [cart, dishMap]);

  const localSubtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.dish?.price || 0) * i.qty, 0);
  }, [items]);

  const subtotal = cartTotals?.subtotal ?? localSubtotal;
  const discount = cartTotals?.discount ?? 0;
  const delivery = cartTotals?.deliveryFee ?? (localSubtotal > 500 || localSubtotal === 0 ? 0 : 40);
  const gst = cartTotals?.tax ?? Math.round(localSubtotal * 0.05);
  const tipAmount = selectedTip || 0;
  const grandTotal = Math.max(0, subtotal + gst + delivery + tipAmount - discount);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;
    setCouponError(null);
    setCouponSuccess(null);

    const res = await applyCouponCode(code);
    if (res.success && res.totals) {
      setCartTotals(res.totals);
      setCouponSuccess(`Coupon ${code} applied successfully!`);
      setCouponInput("");
    } else {
      setCouponError(res.error || "Invalid coupon code.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-28">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="size-28 rounded-full bg-white border border-[#e6e2d8] shadow-xs mx-auto grid place-items-center">
            <ShoppingBag className="size-12 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-black text-[#0d261e] tracking-tight">Your cart is empty</h2>
          <p className="text-xs text-[#52635c] max-w-sm mx-auto">
            You have no dishes in your cart yet. Explore Malashree's pure veg menu to start ordering!
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-md border border-[#d4af37]/30"
          >
            <span>Explore Menu</span>
            <ArrowRight className="size-4" />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-36">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Restaurant Badge Header */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e6e2d8] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
              <img src={branch.hero} alt={branch.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#0d261e] leading-tight">
                Malashree Pure Veg
              </h2>
              <p className="text-xs text-[#52635c] mt-0.5">
                {branch.area}, Pune · <span className="text-[#064e3b] font-bold">{branch.etaMin} mins delivery</span>
              </p>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-[#52635c] hover:text-[#b91c1c] transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Clear Cart</span>
          </button>
        </section>

        {/* Selected Items List Card */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-4 divide-y divide-gray-100">
          <div className="space-y-4">
            {items.map((item) => {
              const dish = item.dish!;
              const itemPrice = dish.price * item.qty;

              return (
                <div key={item.dishId} className="flex items-center justify-between gap-3 pt-2 first:pt-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-3.5 rounded-sm border border-[#064e3b] grid place-items-center shrink-0">
                      <div className="size-1.5 rounded-full bg-[#064e3b]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#0d261e] truncate">{dish.name}</h4>
                      <p className="text-xs text-[#52635c] font-medium">₹{dish.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="h-8 bg-emerald-50 border border-emerald-300 text-[#064e3b] rounded-xl flex items-center justify-between px-1.5 shadow-2xs w-20">
                      <button
                        onClick={() => removeFromCart(dish.id)}
                        className="p-1 hover:bg-emerald-200/60 rounded cursor-pointer"
                      >
                        <Minus className="size-3 stroke-[3]" />
                      </button>
                      <span className="text-xs font-black">{item.qty}</span>
                      <button
                        onClick={() => setQty(dish.id, item.qty + 1)}
                        className="p-1 hover:bg-emerald-200/60 rounded cursor-pointer"
                      >
                        <Plus className="size-3 stroke-[3]" />
                      </button>
                    </div>

                    <span className="font-black text-sm text-[#0d261e] w-14 text-right">
                      ₹{itemPrice}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4">
            <input
              type="text"
              value={cookingNote}
              onChange={(e) => setCookingNote(e.target.value)}
              placeholder="Add cooking instructions (e.g. less spicy, extra green chutney)..."
              className="w-full h-10 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
            />
          </div>
        </section>

        {/* Delivery Instructions Chips */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e6e2d8] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider">
            Delivery Instructions
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Avoid calling",
              "Leave at door",
              "Don't ring bell",
              "Directions to reach",
              "Leave with guard",
            ].map((instruction) => (
              <button
                key={instruction}
                onClick={() =>
                  setDeliveryInstruction((prev) => (prev === instruction ? null : instruction))
                }
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  deliveryInstruction === instruction
                    ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                    : "bg-[#fbf9f4] text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
                }`}
              >
                {instruction}
              </button>
            ))}
          </div>
        </section>

        {/* Tip Delivery Partner Section */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e6e2d8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="size-3.5 text-[#d4af37] fill-[#d4af37]" />
              Tip your delivery partner
            </h3>
            {selectedTip && (
              <button
                onClick={() => setSelectedTip(null)}
                className="text-[11px] font-bold text-[#064e3b] hover:underline"
              >
                Remove tip
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[20, 30, 50, 100].map((tip) => (
              <button
                key={tip}
                onClick={() => setSelectedTip((prev) => (prev === tip ? null : tip))}
                className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  selectedTip === tip
                    ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                    : "bg-[#fbf9f4] text-[#0d261e] border-[#e6e2d8] hover:border-[#d4af37]"
                }`}
              >
                ₹{tip}
              </button>
            ))}
          </div>
        </section>

        {/* Promo Coupons Card */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e6e2d8] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider flex items-center gap-1.5">
            <Ticket className="size-4 text-[#d4af37]" />
            Apply Coupons & Discounts
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Enter coupon code (e.g. ROYAL60)"
              className="flex-1 h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-bold text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b] uppercase"
            />
            <button
              onClick={() => handleApplyCoupon()}
              className="px-5 h-11 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition cursor-pointer border border-[#d4af37]/30"
            >
              Apply
            </button>
          </div>

          <div
            onClick={() => handleApplyCoupon("ROYAL60")}
            className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px]">
                ROYAL60
              </span>
              <span className="text-xs font-bold text-amber-950">
                Flat 60% OFF up to ₹120 on your order
              </span>
            </div>
            <span className="text-xs font-black text-[#064e3b]">Apply</span>
          </div>

          {couponSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-700 shrink-0" />
              <span>{couponSuccess}</span>
            </div>
          )}

          {couponError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-700 shrink-0" />
              <span>{couponError}</span>
            </div>
          )}
        </section>

        {/* Itemized Bill Details Card */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-[#0d261e] uppercase tracking-wider">
            Bill Details
          </h3>

          <div className="space-y-2 text-xs text-[#52635c] font-medium pt-1">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="text-[#0d261e] font-bold">₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-[#064e3b] font-bold">
                <span>Coupon Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span>
                {delivery === 0 ? (
                  <span className="text-[#064e3b] font-bold">FREE</span>
                ) : (
                  `₹${delivery}`
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Taxes & Restaurant Charges (5% GST)</span>
              <span>₹{gst}</span>
            </div>

            {selectedTip && (
              <div className="flex justify-between text-[#064e3b] font-bold">
                <span>Delivery Partner Tip</span>
                <span>₹{selectedTip}</span>
              </div>
            )}

            <div className="border-t border-[#e6e2d8] pt-3 flex justify-between items-center text-sm font-black text-[#0d261e]">
              <span>To Pay</span>
              <span className="text-base text-[#064e3b]">₹{grandTotal}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Checkout Action Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e6e2d8] p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#52635c] block leading-none">TOTAL</span>
            <span className="text-xl font-black text-[#0d261e]">₹{grandTotal}</span>
          </div>

          <Link
            href="/checkout"
            className="px-8 py-3.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-md flex items-center gap-2 border border-[#d4af37]/30"
          >
            <span>Proceed to Checkout</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
