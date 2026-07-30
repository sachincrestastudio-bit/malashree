"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { findDish, getBranch } from "@/lib/data";
import { Heart, MapPin, Package, Sparkles, RefreshCw, Clock, CheckCircle2, Truck, AlertTriangle, LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { getCurrentUser, getUserOrders } from "@/actions/user";

function Profile() {
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const favs = useStore((s) => s.favorites);
  const branch = getBranch(useStore((s) => s.branchId));
  const favDishes = favs.map((id) => findDish(id)).filter(Boolean);

  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadProfileData = async () => {
      setLoadingOrders(true);
      const user = await getCurrentUser();
      if (mounted && user) {
        setProfile({
          name: user.name,
          phone: user.phone || "",
          address: user.address || "Pimple Saudagar, Pune",
          branchId: useStore.getState().branchId,
          email: user.email,
          role: user.role,
          joinedDate: user.joinedDate,
        });
      }

      const orders = await getUserOrders();
      if (mounted) {
        setDbOrders(orders);
        setLoadingOrders(false);
      }
    };
    loadProfileData();

    return () => {
      mounted = false;
    };
  }, [setProfile]);

  const handleLogout = async () => {
    await logoutUser();
    setProfile(null);
    window.location.href = "/";
  };

  const statusBadges: Record<string, { label: string; color: string; icon: any }> = {
    placed: { label: "Placed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    preparing: { label: "Preparing", color: "bg-amber-50 text-amber-700 border-amber-200", icon: RefreshCw },
    out_for_delivery: { label: "Out for Delivery", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
    delivered: { label: "Delivered", color: "bg-lime/20 text-emerald border-lime/50", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Profile Card Header */}
        <div className="bg-ink text-cream rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden shadow-lg border border-lime/20">
          <div className="absolute -right-12 -top-12 size-72 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-lime">
              {profile ? "Gourmet Member Profile" : "Guest Mode"}
            </div>
            <h1 className="font-display text-5xl md:text-6xl mt-2 leading-[0.95]">
              {profile ? (
                `hi, ${profile.name.split(" ")[0]}.`
              ) : (
                <>
                  let's get you <span className="italic text-lime">signed up.</span>
                </>
              )}
            </h1>
            {!profile ? (
              <div className="mt-6 flex gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-12 px-6 rounded-full bg-lime text-ink items-center font-bold text-xs uppercase tracking-widest hover:bg-emerald transition"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 px-6 rounded-full bg-white/10 text-white items-center font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition"
                >
                  Log In
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-6 text-xs font-mono text-cream/80 items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-lime" /> {profile.address || "Pimple Saudagar, Pune"}
                </div>
                <div>{profile.email}</div>
                <div>{profile.phone}</div>
                <div>
                  Zone: <span className="text-lime font-bold">{branch.area}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-lime hover:text-white transition-colors underline underline-offset-4 flex items-center gap-1 font-bold"
                >
                  <LogOut className="size-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-5">
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-ink/10">
            <Package className="size-4 md:size-5 text-olive-dark" />
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-olive mt-2 md:mt-3 font-mono">
              Total Orders
            </div>
            <div className="font-display text-2xl md:text-4xl mt-0.5 md:mt-1 text-ink font-bold">
              {dbOrders.length}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-ink/10">
            <Heart className="size-4 md:size-5 text-olive-dark" />
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-olive mt-2 md:mt-3 font-mono">
              Favorites
            </div>
            <div className="font-display text-2xl md:text-4xl mt-0.5 md:mt-1 text-ink font-bold">
              {favs.length}
            </div>
          </div>
          <div className="bg-lime rounded-3xl p-4 md:p-6 shadow-sm border border-ink">
            <Sparkles className="size-4 md:size-5 text-ink" />
            <div className="text-[10px] md:text-xs uppercase tracking-widest mt-2 md:mt-3 font-mono font-bold text-ink">
              Tier Status
            </div>
            <div className="font-display text-2xl md:text-4xl mt-0.5 md:mt-1 text-ink font-bold">Gold Patron</div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-3xl text-ink mb-4">order history</h2>
            {loadingOrders ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs font-mono text-olive border border-ink/10">
                <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-lime-deep" />
                Loading order history from database…
              </div>
            ) : dbOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-sm text-olive-dark border border-ink/10">
                No orders found for this account yet.{" "}
                <Link href="/menu" className="underline font-bold text-ink">
                  Browse Menu & Order
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dbOrders.map((o) => {
                  const badge = statusBadges[o.status] || statusBadges.placed;
                  const Icon = badge.icon;
                  return (
                    <div key={o.id} className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-ink bg-cream px-2 py-0.5 border border-ink/10">
                              #{o.id}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border rounded-full flex items-center gap-1 ${badge.color}`}>
                              <Icon className="size-3" /> {badge.label}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-olive-dark font-mono">
                            {o.dateFormatted} · {o.kitchenName}
                          </div>
                        </div>
                        <div className="font-display text-2xl text-ink font-bold">₹{o.total}</div>
                      </div>

                      {/* Items Preview */}
                      <div className="text-xs text-olive-dark border-t border-ink/5 pt-2 font-mono">
                        {o.items.map((i: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-0.5">
                            <span>{i.qty}× {i.dishName}</span>
                            <span>₹{i.price * i.qty}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Action Buttons */}
                      <div className="pt-2 border-t border-ink/5 flex items-center justify-between gap-2">
                        <Link
                          href={`/orders/${o.id}/track`}
                          className="px-3.5 py-1.5 bg-ink text-lime font-mono text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-emerald transition flex items-center gap-1"
                        >
                          Track Live Order 🛵
                        </Link>
                        <Link
                          href={`/complaints?orderId=${o.id}`}
                          className="px-3.5 py-1.5 bg-cream border border-ink/10 text-olive-dark font-mono text-[10px] font-bold uppercase tracking-wider rounded-full hover:text-ink hover:border-ink transition flex items-center gap-1"
                        >
                          Report Issue ⚠️
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Favorites Column */}
          <div>
            <h2 className="font-display text-3xl text-ink mb-4">saved favorites</h2>
            {favDishes.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-sm text-olive-dark border border-ink/10">
                Tap the heart on any dish in the menu to save it here.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {favDishes.map(
                  (d) =>
                    d && (
                      <div key={d.id} className="bg-white border border-ink/10 rounded-2xl p-3 shadow-sm">
                        <img
                          src={d.image}
                          alt={d.name}
                          className="w-full aspect-square object-cover rounded-xl border border-ink/10"
                        />
                        <div className="text-sm font-bold text-ink mt-2 truncate font-display">{d.name}</div>
                        <div className="text-xs text-olive font-mono">₹{d.price}</div>
                      </div>
                    ),
                )}
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
