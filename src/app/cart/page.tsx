"use client";

import Link from "next/link";

import { Minus, Plus, Trash2, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { findDish, getBranch } from "@/lib/data";
import { syncCart } from "@/actions/cart";



function Cart() {
  const cart = useStore(s => s.cart);
  const setQty = useStore(s => s.setQty);
  const remove = useStore(s => s.removeFromCart);
  const branch = getBranch(useStore(s => s.branchId));
  const profile = useStore(s => s.profile);
  const cartTotals = useStore(s => s.cartTotals);
  const setCartTotals = useStore(s => s.setCartTotals);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sync cart with server whenever local cart or applied coupon changes
  useEffect(() => {
    let mounted = true;
    const fetchTotals = async () => {
      if (cart.length === 0) {
        setCartTotals(null);
        return;
      }
      setIsCalculating(true);
      const res = await syncCart(cart, applied);
      if (mounted && res) {
        setCartTotals(res);
        setIsCalculating(false);
      }
    };
    
    // Debounce to prevent spamming the backend when rapidly changing quantities
    const timer = setTimeout(fetchTotals, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [cart, applied, setCartTotals]);

  const items = cart.map(c => ({ ...c, dish: findDish(c.dishId)! })).filter(i => i.dish);
  
  const subtotal = cartTotals?.subtotal || 0;
  const discount = cartTotals?.discount || 0;
  const delivery = cartTotals?.deliveryFee || 0;
  const gst = cartTotals?.tax || 0;
  const total = cartTotals?.grandTotal || 0;

  const apply = () => {
    const valid = branch.offers.find(o => o.code.toLowerCase() === coupon.toLowerCase());
    if (valid) setApplied(valid.code);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h1 className="font-display text-5xl leading-[0.95]">your <span className="italic">cart</span></h1>
        <p className="mt-2 text-olive-dark text-sm">From {branch.name}</p>

        {isCalculating && <div className="absolute top-4 right-4 text-xs font-mono uppercase tracking-widest text-lime-deep animate-pulse">Calculating totals...</div>}

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="font-display text-3xl">nothing here yet.</div>
            <p className="mt-2 text-olive-dark">Let's fix that.</p>
            <Link href="/menu" className="inline-flex mt-6 h-12 px-6 rounded-full bg-ink text-cream items-center font-medium">Browse menu</Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ dish, qty, dishId }) => (
                <div key={dishId} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center relative shadow-sm border border-ink/5">
                  <div className="flex gap-4 items-center flex-1">
                    <img src={dish.image} alt={dish.name} className="size-16 sm:size-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base text-ink truncate">{dish.name}</div>
                      <div className="text-xs text-olive-dark mt-0.5">₹{dish.price} each</div>
                    </div>
                  </div>
                  
                  {/* Mobile delete button placed in top right */}
                  <button 
                    onClick={() => remove(dishId)} 
                    className="absolute sm:relative top-3 right-3 sm:top-auto sm:right-auto size-8 sm:size-9 grid place-items-center rounded-full hover:bg-red-50 text-olive-dark hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-ink/5 sm:border-none pt-3 sm:pt-0">
                    <div className="flex items-center gap-2 bg-cream rounded-full p-1">
                      <button onClick={() => setQty(dishId, qty - 1)} className="size-7 grid place-items-center rounded-full hover:bg-ink/5"><Minus className="size-3" /></button>
                      <span className="text-sm font-medium w-5 text-center">{qty}</span>
                      <button onClick={() => setQty(dishId, qty + 1)} className="size-7 grid place-items-center rounded-full hover:bg-ink/5"><Plus className="size-3" /></button>
                    </div>
                    <div className="font-display text-lg sm:w-24 text-right text-ink">₹{dish.price * qty}</div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white rounded-3xl p-6 h-fit sticky top-24 border border-ink/5">
              <div className="text-xs uppercase tracking-widest text-olive">Order summary</div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({applied})</span><span>−₹{discount}</span></div>}
                <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? <span className="text-green-700">FREE</span> : `₹${delivery}`}</span></div>
                <div className="flex justify-between text-olive-dark"><span>GST (5%)</span><span>₹{gst}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-ink/10 flex justify-between items-baseline">
                <span className="text-sm">Total</span>
                <span className="font-display text-3xl">₹{total}</span>
              </div>

              <div className="mt-5">
                <div className="text-xs text-olive-dark mb-2 flex items-center gap-1"><Tag className="size-3" /> Try: {branch.offers[0].code}</div>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code"
                    className="flex-1 h-11 px-4 rounded-full bg-cream border border-ink/10 text-sm outline-none focus:border-ink" />
                  <button onClick={apply} className="h-11 px-5 rounded-full bg-ink text-cream text-sm font-medium">Apply</button>
                </div>
                {applied && <div className="mt-2 text-xs text-green-700">Coupon {applied} applied!</div>}
              </div>

              {!profile ? (
                <div className="mt-6 flex gap-2">
                  <Link href="/register" className="h-12 flex-1 rounded-full bg-ink text-cream font-semibold flex items-center justify-center hover:brightness-95 transition">
                    Register
                  </Link>
                  <Link href="/login" className="h-12 flex-1 rounded-full bg-ink/5 text-ink font-semibold flex items-center justify-center hover:bg-ink/10 transition">
                    Log in
                  </Link>
                </div>
              ) : (
                <Link href="/checkout" className="mt-6 h-12 w-full rounded-full bg-lime text-ink font-semibold flex items-center justify-center hover:brightness-95 transition">
                  Proceed to checkout
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
