"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, Tag, ShoppingBag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { findDish, getBranch } from "@/lib/data";
import { syncCart } from "@/actions/cart";
import { getKitchenMenu } from "@/actions/menu";

function Cart() {
  const branchId = useStore((s) => s.branchId);
  const cart = useStore((s) => s.cart);
  const kitchenMenu = useStore((s) => s.kitchenMenu);
  const setKitchenMenu = useStore((s) => s.setKitchenMenu);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.removeFromCart);
  const branch = getBranch(branchId);
  const profile = useStore((s) => s.profile);
  const cartTotals = useStore((s) => s.cartTotals);
  const setCartTotals = useStore((s) => s.setCartTotals);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Ensure menu items are loaded so dynamic dish IDs match
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

  // Sync cart with server whenever local cart or applied coupon changes
  useEffect(() => {
    let mounted = true;
    const fetchTotals = async () => {
      if (cart.length === 0) {
        setCartTotals(null);
        setIsCalculating(false);
        return;
      }
      setIsCalculating(true);
      const res = await syncCart(cart, applied);
      if (mounted) {
        if (res) {
          setCartTotals(res);
        }
        setIsCalculating(false);
      }
    };

    const timer = setTimeout(fetchTotals, 200);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [cart, applied, setCartTotals]);

  // Resolve dish objects dynamically from database menu or static fallback
  const items = useMemo(() => {
    return cart
      .map((c) => {
        const dish = kitchenMenu.find((d) => d.id === c.dishId) || findDish(c.dishId);
        return { ...c, dish };
      })
      .filter((i) => i.dish);
  }, [cart, kitchenMenu]);

  // Calculate prices (fallback to local sum if server response is pending)
  const localSubtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.dish?.price || 0) * i.qty, 0);
  }, [items]);

  const subtotal = cartTotals?.subtotal ?? localSubtotal;
  const discount = cartTotals?.discount ?? 0;
  const delivery = cartTotals?.deliveryFee ?? (localSubtotal > 500 || localSubtotal === 0 ? 0 : 40);
  const gst = cartTotals?.tax ?? Math.round(localSubtotal * 0.05);
  const total = cartTotals?.grandTotal ?? Math.max(0, localSubtotal + gst + delivery - discount);

  const applyCoupon = () => {
    if (!coupon.trim()) return;
    setApplied(coupon.trim().toUpperCase());
    setCouponMessage(`Applied coupon ${coupon.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.95]">
              your <span className="italic text-emerald">cart</span>
            </h1>
            <p className="mt-2 text-olive-dark text-sm">Delivering from {branch.name}</p>
          </div>
          {isCalculating && (
            <div className="text-xs font-mono uppercase tracking-widest text-lime-deep animate-pulse">
              Syncing cart...
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-16 text-center py-16 bg-white border border-ink/10 rounded-3xl">
            <ShoppingBag className="size-12 text-olive/30 mx-auto mb-3" />
            <div className="font-display text-3xl text-ink">nothing in your cart yet.</div>
            <p className="mt-2 text-olive-dark text-sm">Browse our gourmet pure-veg menu and add your favorite dishes.</p>
            <Link
              href="/menu"
              className="inline-flex mt-6 h-12 px-8 rounded-full bg-ink text-lime font-bold text-xs uppercase tracking-widest items-center hover:bg-emerald transition shadow-sm"
            >
              Browse Full Menu
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ dish, qty, dishId }) => {
                if (!dish) return null;
                return (
                  <div
                    key={dishId}
                    className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center relative shadow-sm border border-ink/10"
                  >
                    <div className="flex gap-4 items-center flex-1">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="size-16 sm:size-20 rounded-xl object-cover shrink-0 border border-ink/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-base sm:text-lg font-bold text-ink truncate">
                          {dish.name}
                        </div>
                        <div className="text-xs text-olive-dark font-mono mt-0.5">₹{dish.price} each</div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => remove(dishId)}
                      className="absolute sm:relative top-3 right-3 sm:top-auto sm:right-auto size-8 sm:size-9 grid place-items-center rounded-full hover:bg-red-50 text-olive-dark hover:text-red-600 transition-colors"
                      title="Remove dish"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-ink/5 sm:border-none pt-3 sm:pt-0">
                      <div className="flex items-center gap-1 bg-cream rounded-full p-1 border border-ink/10">
                        <button
                          onClick={() => setQty(dishId, qty - 1)}
                          className="size-7 grid place-items-center rounded-full hover:bg-ink hover:text-cream transition"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-mono font-bold w-6 text-center">{qty}</span>
                        <button
                          onClick={() => setQty(dishId, qty + 1)}
                          className="size-7 grid place-items-center rounded-full hover:bg-ink hover:text-cream transition"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="font-display text-xl sm:w-24 text-right text-ink font-bold">
                        ₹{dish.price * qty}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="bg-white rounded-3xl p-6 h-fit sticky top-24 border border-ink/10 shadow-sm space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-olive border-b border-ink/10 pb-3">
                Order Summary
              </div>

              <div className="space-y-2 text-xs font-mono text-olive-dark">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-ink font-bold">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald font-bold">
                    <span>Discount ({applied})</span>
                    <span>−₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {delivery === 0 ? (
                      <span className="text-emerald font-bold uppercase">Free Delivery</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="text-ink">₹{gst}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-ink/10 flex justify-between items-baseline">
                <span className="font-display text-xl text-ink">Total Due</span>
                <span className="font-display text-3xl font-bold text-ink">
                  <span className="text-lime">₹</span>
                  {total}
                </span>
              </div>

              {/* Coupon input */}
              <div className="pt-2">
                <div className="text-[10px] font-mono text-olive uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Tag className="size-3 text-lime-deep" /> Coupon Promo Code
                </div>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="e.g. WELCOME20"
                    className="flex-1 h-11 px-4 rounded-xl bg-cream/50 border border-ink/10 text-xs font-mono outline-none focus:border-ink uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="h-11 px-5 rounded-xl bg-ink text-lime text-xs font-mono font-bold uppercase tracking-wider hover:bg-emerald transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <div className="mt-2 text-[10px] font-mono text-emerald">{couponMessage}</div>
                )}
              </div>

              {!profile ? (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/register"
                    className="h-12 w-full rounded-full bg-ink text-lime font-bold text-xs uppercase tracking-widest flex items-center justify-center hover:bg-emerald transition shadow-sm"
                  >
                    Register to Order
                  </Link>
                  <Link
                    href="/login"
                    className="h-12 w-full rounded-full bg-cream border border-ink/10 text-ink font-bold text-xs uppercase tracking-widest flex items-center justify-center hover:bg-ink/5 transition"
                  >
                    Log In
                  </Link>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="h-12 w-full rounded-full bg-lime text-ink font-bold text-xs uppercase tracking-widest flex items-center justify-center hover:bg-lime/90 transition shadow-sm"
                >
                  Proceed to Checkout
                </Link>
              )}
            </aside>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

export default Cart;
