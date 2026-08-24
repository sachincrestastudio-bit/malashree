"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { getBranch, findDish } from "@/lib/data";
import {
  MapPin,
  ShoppingBag,
  User,
  ChevronDown,
  Search,
  UtensilsCrossed,
  Store,
  Clock,
  Sparkles,
} from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { requestGPSLocation } from "@/services/client/LocationService";
import { findNearestKitchenAndAssign } from "@/actions/kitchen";
import { LocationModal } from "@/components/LocationModal";

export function Header() {
  const branchId = useStore((s) => s.branchId);
  const setBranch = useStore((s) => s.setBranch);
  const resolveLocation = useStore((s) => s.resolveLocation);
  const userLocation = useStore((s) => s.userLocation);
  const setUserLocation = useStore((s) => s.setUserLocation);
  const locationResolved = useStore((s) => s.locationResolved);
  const cart = useStore((s) => s.cart);
  const profile = useStore((s) => s.profile);
  const branch = getBranch(branchId);
  const path = usePathname();

  const kitchenMenu = useStore((s) => s.kitchenMenu) || [];
  const cartTotals = useStore((s) => s.cartTotals);

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Auto-detect nearest branch on initial load if not yet resolved
  useEffect(() => {
    if (!locationResolved && typeof window !== "undefined" && navigator.geolocation) {
      requestGPSLocation()
        .then(async (coords) => {
          const res = await findNearestKitchenAndAssign(coords.latitude, coords.longitude);
          if (res.success && res.nearestKitchen) {
            setBranch(res.nearestKitchen.id);
            resolveLocation(res.nearestKitchen.id);
            setUserLocation({
              lat: coords.latitude,
              lng: coords.longitude,
              distanceKm: res.nearestKitchen.distanceKm,
              etaMin: res.nearestKitchen.etaMin,
              kitchenName: res.nearestKitchen.name,
              label: `Near ${res.nearestKitchen.area}`,
            });
          }
        })
        .catch(() => {
          // If GPS denied, default auto-assign to nearest Pimple Saudagar branch
          findNearestKitchenAndAssign(18.5989, 73.7978).then((res) => {
            if (res.success && res.nearestKitchen) {
              setBranch(res.nearestKitchen.id);
              resolveLocation(res.nearestKitchen.id);
              setUserLocation({
                lat: 18.5989,
                lng: 73.7978,
                distanceKm: res.nearestKitchen.distanceKm,
                etaMin: res.nearestKitchen.etaMin,
                kitchenName: res.nearestKitchen.name,
                label: `Near ${res.nearestKitchen.area}`,
              });
            }
          });
        });
    }
  }, [locationResolved, setBranch, resolveLocation, setUserLocation]);

  const cartCount = useMemo(() => cart.reduce((n, c) => n + c.qty, 0), [cart]);

  const cartTotal = useMemo(() => {
    if (cartTotals?.grandTotal) return cartTotals.grandTotal;
    return cart.reduce((total, c) => {
      const dish =
        (kitchenMenu || []).find((d) => d.id === c.dishId) ||
        branch.menu.find((d) => d.id === c.dishId) ||
        findDish(c.dishId);
      return total + (dish?.price || 0) * c.qty;
    }, 0);
  }, [cart, kitchenMenu, branch.menu, cartTotals]);

  const userInitials = useMemo(() => {
    if (!profile?.name) return "";
    return profile.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [profile]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/cart", label: "Cart" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fbf9f4]/95 backdrop-blur-md border-b border-[#e6e2d8] shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Brand Logo & Location */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/" className="shrink-0 flex items-center gap-2 group">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-[#064e3b] group-hover:text-[#0a5c46] transition">
                malashree
              </span>
            </Link>

            {/* Auto Delivery Location Badge (Click to detect GPS or set delivery address) */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#e6e2d8] hover:border-[#d4af37] transition text-xs font-semibold text-[#0d261e] truncate shadow-2xs group cursor-pointer text-left"
            >
              <MapPin className="size-4 text-[#d4af37] shrink-0 group-hover:scale-110 transition" />
              <div className="flex flex-col text-left leading-tight truncate">
                <span className="font-extrabold text-[11px] text-[#0d261e] flex items-center gap-1">
                  {userLocation?.label || profile?.address || "Pune"}
                  <ChevronDown className="size-3 text-[#52635c] group-hover:text-[#064e3b] transition" />
                </span>
                <span className="text-[10px] text-[#52635c] truncate max-w-[140px] sm:max-w-[200px]">
                  {userLocation?.kitchenName
                    ? `${userLocation.kitchenName} (${userLocation.distanceKm || 1.2} km)`
                    : "Auto-routing nearest branch..."}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation Links + Search Bar */}
          <div className="hidden lg:flex items-center gap-6 flex-1 max-w-2xl justify-center">
            {/* Navigation Links */}
            <nav className="flex items-center gap-1 bg-white/70 p-1 rounded-2xl border border-[#e6e2d8]">
              {navLinks.map((link) => {
                const active = path === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      active
                        ? "bg-[#064e3b] text-[#d4af37] shadow-xs"
                        : "text-[#52635c] hover:text-[#0d261e] hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar Link */}
            <div className="flex-1 max-w-sm">
              <Link
                href="/menu"
                className="flex items-center gap-3 px-4 h-10 rounded-xl bg-white border border-[#e6e2d8] text-[#52635c] text-xs hover:border-[#d4af37] transition shadow-2xs w-full"
              >
                <Search className="size-4 text-[#d4af37]" />
                <span className="truncate">Search dishes, thalis, biryani...</span>
              </Link>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Pure Veg Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-[#064e3b]">
              <div className="size-3 rounded-sm border border-[#064e3b] grid place-items-center">
                <div className="size-1.5 rounded-full bg-[#064e3b]" />
              </div>
              <span>100% Pure Veg</span>
            </div>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 h-10 rounded-xl bg-[#064e3b] text-[#d4af37] hover:bg-[#0a5c46] transition text-xs font-bold shadow-xs border border-[#d4af37]/30"
            >
              <ShoppingBag className="size-4" />
              <span className="text-white font-extrabold">₹{cartTotal.toFixed(2)}</span>
              {cartCount > 0 && (
                <span className="size-4.5 rounded-full bg-[#d4af37] text-[#064e3b] text-[10px] font-black grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Account Button */}
            <Link
              href="/profile"
              className="size-10 rounded-xl bg-white hover:bg-gray-50 border border-[#e6e2d8] transition grid place-items-center text-xs font-bold text-[#064e3b] shadow-2xs"
              title="Profile"
            >
              {userInitials ? (
                <span className="text-[#064e3b] font-black">{userInitials}</span>
              ) : (
                <User className="size-4.5 text-[#52635c]" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Location Detection Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
