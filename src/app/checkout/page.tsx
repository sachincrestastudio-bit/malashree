"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, CreditCard, Wallet, Banknote } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { findDish, getBranch } from "@/lib/data";



function Checkout() {
  const cart = useStore(s => s.cart);
  const branch = getBranch(useStore(s => s.branchId));
  const profile = useStore(s => s.profile);
  const locationResolved = useStore(s => s.locationResolved);
  const placeOrder = useStore(s => s.placeOrder);
  const items = cart.map(c => ({ ...c, dish: findDish(c.dishId)! })).filter(i => i.dish);
  const subtotal = items.reduce((n, i) => n + i.dish.price * i.qty, 0);
  const total = subtotal + (subtotal > 499 ? 0 : 39) + Math.round(subtotal * 0.05);
  const [pay, setPay] = useState("upi");
  const [done, setDone] = useState<string | null>(null);
  const nav = useRouter();

  useEffect(() => {
    if (!locationResolved) {
      nav.push("/");
    } else if (!profile) {
      nav.push("/register");
    }
  }, [profile, locationResolved, nav]);

  const submit = () => {
    const id = placeOrder(total);
    setDone(id);
    setTimeout(() => nav.push("/profile"), 2500);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="size-20 rounded-full bg-lime grid place-items-center mx-auto">
            <Check className="size-10" />
          </div>
          <h1 className="font-display text-5xl mt-6">order placed!</h1>
          <p className="mt-3 text-olive-dark">#{done} · arriving in {branch.etaMin} min from {branch.area}</p>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-display text-4xl">your cart is empty</h1>
        </div>
      </div>
    );
  }

  const methods = [
    { id: "upi", label: "UPI", icon: Wallet, sub: "Google Pay, PhonePe, Paytm" },
    { id: "card", label: "Card", icon: CreditCard, sub: "Credit / Debit / Netbanking" },
    { id: "cod", label: "Cash on delivery", icon: Banknote, sub: "Pay when it arrives" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h1 className="font-display text-5xl leading-[0.95]">check<span className="italic">out</span></h1>

        <div className="mt-8 grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-ink/5">
              <div className="text-xs uppercase tracking-widest text-olive mb-3 font-semibold">Delivering to</div>
              <div className="font-medium">{profile?.name ?? "Guest"}</div>
              <div className="text-sm text-olive-dark mt-1">{profile?.address ?? "Add an address in your profile"}</div>
              <div className="text-sm text-olive-dark">{profile?.phone ?? "—"}</div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-ink/5">
              <div className="text-xs uppercase tracking-widest text-olive mb-4 font-semibold">Payment method</div>
              <div className="space-y-2">
                {methods.map(m => (
                  <button key={m.id} onClick={() => setPay(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${pay === m.id ? "border-ink bg-cream" : "border-transparent bg-cream/50 hover:bg-cream"}`}>
                    <m.icon className="size-5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-olive-dark">{m.sub}</div>
                    </div>
                    <div className={`size-5 rounded-full border-2 ${pay === m.id ? "border-ink bg-ink" : "border-ink/20"}`}>
                      {pay === m.id && <Check className="size-3 text-lime m-0.5" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="md:col-span-2 bg-ink text-cream rounded-3xl p-5 sm:p-6 h-fit shadow-lift">
            <div className="text-xs uppercase tracking-widest text-lime font-semibold">From {branch.area}</div>
            <div className="font-display text-2xl mt-1">{items.length} item{items.length > 1 ? "s" : ""}</div>
            <div className="mt-4 space-y-2 text-sm">
              {items.map(i => (
                <div key={i.dishId} className="flex justify-between text-cream/80">
                  <span className="truncate pr-2">{i.qty}× {i.dish.name}</span>
                  <span>₹{i.dish.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-cream/10 flex justify-between items-baseline">
              <span className="text-sm">Total</span>
              <span className="font-display text-3xl text-lime">₹{total}</span>
            </div>
            <button onClick={submit} className="mt-6 w-full h-12 rounded-full bg-lime text-ink font-semibold hover:brightness-95 transition">
              Place order
            </button>
            <p className="mt-3 text-[11px] text-cream/50 text-center">Demo build · no real payment</p>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}
export default Checkout;
