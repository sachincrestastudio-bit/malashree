"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Phone,
  Mail,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { logoutUser } from "@/actions/auth";
import { getUserOrders } from "@/actions/user";
import { findDish } from "@/lib/data";

export default function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const favorites = useStore((s) => s.favorites);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "favorites">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const favDishes = favorites.map((id) => findDish(id)).filter(Boolean);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await getUserOrders();
        if (mounted && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    };
    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setProfile(null);
    window.location.href = "/";
  };

  const statusBadges: Record<string, { label: string; color: string; icon: any }> = {
    placed: { label: "Order Placed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    preparing: { label: "Kitchen Preparing", color: "bg-amber-50 text-[#064e3b] border-amber-200", icon: RefreshCw },
    ready: { label: "Ready for Pickup", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Package },
    out_for_delivery: { label: "Out for Delivery", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
    delivered: { label: "Delivered", color: "bg-emerald-50 text-[#064e3b] border-emerald-300", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle },
  };

  const userInitials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "JD";

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-32">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Profile Masthead Card */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xl grid place-items-center shadow-xs border border-[#d4af37]/30">
                {userInitials}
              </div>
              <div>
                <h1 className="text-xl font-black text-[#0d261e] tracking-tight leading-tight">
                  {profile?.name || "Guest Foodie"}
                </h1>
                <p className="text-xs text-[#52635c] mt-0.5 flex items-center gap-1">
                  <Phone className="size-3 text-[#d4af37]" />
                  {profile?.phone ? `+91 ${profile.phone}` : "+91 98765 43210"}
                </p>
                {profile?.email && (
                  <p className="text-xs text-[#52635c] flex items-center gap-1 mt-0.5">
                    <Mail className="size-3 text-[#d4af37]" />
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            {profile ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-[#fbf9f4] hover:bg-rose-50 hover:text-rose-600 transition text-xs font-bold text-[#52635c] flex items-center gap-1.5 cursor-pointer border border-[#e6e2d8]"
                title="Log Out"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-[#0d261e] font-bold text-xs transition border border-[#e6e2d8]"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition shadow-xs border border-[#d4af37]/30"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-white rounded-2xl p-1 border border-[#e6e2d8] shadow-2xs">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "orders" ? "bg-[#064e3b] text-[#d4af37] shadow-xs" : "text-[#52635c] hover:text-[#0d261e]"
            }`}
          >
            Past Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "favorites" ? "bg-[#064e3b] text-[#d4af37] shadow-xs" : "text-[#52635c] hover:text-[#0d261e]"
            }`}
          >
            Favorites ({favDishes.length})
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "addresses" ? "bg-[#064e3b] text-[#d4af37] shadow-xs" : "text-[#52635c] hover:text-[#0d261e]"
            }`}
          >
            Saved Addresses
          </button>
        </nav>

        {/* TAB 1: Past Orders List */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {loadingOrders ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e6e2d8] shadow-2xs space-y-3">
                <RefreshCw className="size-8 animate-spin mx-auto text-[#064e3b]" />
                <p className="text-xs font-bold text-[#52635c]">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e6e2d8] shadow-2xs space-y-3">
                <div className="size-20 rounded-full bg-[#fbf9f4] grid place-items-center mx-auto text-3xl">
                  🛍️
                </div>
                <h3 className="font-extrabold text-base text-[#0d261e]">No past orders yet</h3>
                <p className="text-xs text-[#52635c] max-w-xs mx-auto">
                  When you place orders, they will appear here with live tracking & receipts.
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition shadow-xs mt-2 border border-[#d4af37]/30"
                >
                  <span>Order Now</span>
                </Link>
              </div>
            ) : (
              orders.map((order: any) => {
                const badge = statusBadges[order.status] || statusBadges.placed;
                const Icon = badge.icon;

                return (
                  <div
                    key={order._id || order.id || order.orderNumber}
                    className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs space-y-3 hover:border-[#d4af37] transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#0d261e]">
                            Malashree Pure Veg
                          </h4>
                          <span className="text-xs text-[#52635c] font-bold">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <p className="text-xs text-[#52635c] mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "Recent Order"}
                        </p>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 ${badge.color}`}>
                        <Icon className="size-3 shrink-0" />
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1 text-xs text-[#0d261e] pt-2 border-t border-gray-100">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="truncate">
                            {item.quantity}x {item.name || item.dish?.name || "Dish Item"}
                          </span>
                          <span className="font-bold text-[#0d261e]">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-[#52635c]">Total Paid: </span>
                        <span className="font-black text-sm text-[#064e3b]">₹{order.totalAmount}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.orderNumber}/track`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition flex items-center gap-1 shadow-2xs border border-[#d4af37]/30"
                        >
                          <span>Track Live</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Favorites */}
        {activeTab === "favorites" && (
          <div className="space-y-3">
            {favDishes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e6e2d8] shadow-2xs space-y-3">
                <div className="size-20 rounded-full bg-[#fbf9f4] grid place-items-center mx-auto text-3xl">
                  ❤️
                </div>
                <h3 className="font-extrabold text-base text-[#0d261e]">No favorite dishes yet</h3>
                <p className="text-xs text-[#52635c] max-w-xs mx-auto">
                  Bookmark dishes in the menu to quickly order them here anytime.
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition shadow-xs mt-2 border border-[#d4af37]/30"
                >
                  <span>Browse Menu</span>
                </Link>
              </div>
            ) : (
              favDishes.filter(Boolean).map((dish) => (
                <div
                  key={dish?.id || Math.random().toString()}
                  className="bg-white rounded-3xl p-4 border border-[#e6e2d8] shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img src={dish?.image || ""} alt={dish?.name || "Dish"} className="size-14 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0d261e]">{dish?.name}</h4>
                      <p className="font-bold text-xs text-[#064e3b] mt-0.5">₹{dish?.price}</p>
                    </div>
                  </div>

                  <Link
                    href="/menu"
                    className="px-4 py-2 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition shadow-xs border border-[#d4af37]/30"
                  >
                    Order
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Saved Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#52635c] flex items-center gap-1">
                  <MapPin className="size-4 text-[#d4af37]" /> Primary Delivery Address
                </span>
                <span className="text-[10px] bg-emerald-50 text-[#064e3b] border border-emerald-300 font-black px-2 py-0.5 rounded-md">
                  DEFAULT
                </span>
              </div>
              <p className="text-sm font-extrabold text-[#0d261e]">
                {profile?.address || "Flat 402, Green Acres, Pimple Saudagar, Pune"}
              </p>
              <p className="text-xs text-[#52635c]">Phone: +91 {profile?.phone || "9876543210"}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
