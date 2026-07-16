"use client";

import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { findDish, getBranch } from "@/lib/data";
import { Heart, MapPin, Package, Sparkles } from "lucide-react";



import { logoutUser } from "@/actions/auth";

function Profile() {
  const profile = useStore(s => s.profile);
  const setProfile = useStore(s => s.setProfile);
  const orders = useStore(s => s.orders);
  const favs = useStore(s => s.favorites);
  const branch = getBranch(useStore(s => s.branchId));
  const favDishes = favs.map(id => findDish(id)).filter(Boolean);

  const handleLogout = async () => {
    await logoutUser();
    setProfile(null);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="bg-ink text-cream rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 size-72 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-lime">{profile ? "Welcome back" : "Guest"}</div>
            <h1 className="font-display text-5xl md:text-6xl mt-2 leading-[0.95]">
              {profile ? `hi, ${profile.name.split(" ")[0]}.` : <>let's get you <span className="italic">signed up.</span></>}
            </h1>
            {!profile ? (
              <div className="mt-6 flex gap-3">
                 <Link href="/register" className="inline-flex h-12 px-6 rounded-full bg-lime text-ink items-center font-medium">Create account</Link>
                 <Link href="/login" className="inline-flex h-12 px-6 rounded-full bg-white/10 text-white items-center font-medium hover:bg-white/20 transition">Log in</Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-cream/80 items-center">
                <div className="flex items-center gap-2"><MapPin className="size-4 text-lime" /> {profile.address}</div>
                <div>{profile.phone}</div>
                <div>Branch: <span className="text-lime">{branch.area}</span></div>
                <button onClick={handleLogout} className="text-lime hover:text-white transition-colors underline underline-offset-4">Logout</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-5">
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-ink/5">
            <Package className="size-4 md:size-5 text-olive-dark" />
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-olive mt-2 md:mt-3 font-semibold">Orders</div>
            <div className="font-display text-2xl md:text-4xl mt-0.5 md:mt-1 text-ink">{orders.length}</div>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-ink/5">
            <Heart className="size-4 md:size-5 text-olive-dark" />
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-olive mt-2 md:mt-3 font-semibold">Favorites</div>
            <div className="font-display text-2xl md:text-4xl mt-0.5 md:mt-1 text-ink">{favs.length}</div>
          </div>
          <div className="bg-lime rounded-3xl p-4 md:p-6 shadow-sm">
            <Sparkles className="size-4 md:size-5 text-ink" />
            <div className="text-[10px] md:text-xs uppercase tracking-widest mt-2 md:mt-3 font-semibold text-ink">Tier</div>
            <div className="font-display text-2xl md:text-4xl mt-0.5 md:mt-1 text-ink">Regular</div>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-3xl mb-4">order history</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-sm text-olive-dark">No orders yet. <Link href="/menu" className="underline">Browse menu</Link></div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="bg-white rounded-2xl p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-olive">#{o.id}</div>
                        <div className="mt-1 font-medium">{o.items.length} item(s)</div>
                        <div className="mt-1 text-xs text-olive-dark">{new Date(o.date).toLocaleString()}</div>
                      </div>
                      <div className="font-display text-2xl">₹{o.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl mb-4">favorites</h2>
            {favDishes.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-sm text-olive-dark">Tap the heart on any dish to save it here.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {favDishes.map(d => d && (
                  <div key={d.id} className="bg-white rounded-2xl p-3">
                    <img src={d.image} alt={d.name} className="w-full aspect-square object-cover rounded-xl" />
                    <div className="text-sm font-medium mt-2 truncate">{d.name}</div>
                    <div className="text-xs text-olive-dark">₹{d.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
export default Profile;
