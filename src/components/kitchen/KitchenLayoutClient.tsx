"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChefHat,
  LayoutDashboard,
  ListOrdered,
  UtensilsCrossed,
  History,
  Settings,
  LogOut,
  Clock,
  Store,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface KitchenLayoutClientProps {
  user: any;
  kitchens: Array<{ id: string; name: string; code: string; area: string }>;
  currentKitchenId: string;
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/kitchen/dashboard", icon: LayoutDashboard },
  { name: "Live Queue", href: "/kitchen/orders", icon: ListOrdered },
  { name: "Menu & Stock", href: "/kitchen/menu", icon: UtensilsCrossed },
  { name: "Order History", href: "/kitchen/history", icon: History },
  { name: "Availability", href: "/kitchen/availability", icon: Clock },
  { name: "Settings", href: "/kitchen/settings", icon: Settings },
];

export function KitchenLayoutClient({
  user,
  kitchens,
  currentKitchenId,
  children,
}: KitchenLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeKitchenParam = searchParams.get("kitchenId") || currentKitchenId;
  const activeKitchen =
    kitchens.find((k) => k.id === activeKitchenParam || k.code === activeKitchenParam) ||
    kitchens[0];

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  const activeItem = navigation.find((n) => path?.startsWith(n.href)) || navigation[0];

  const handleSwitchKitchen = (kId: string) => {
    setBranchDropdownOpen(false);
    // Refresh page with new kitchen query param or push to current route with ?kitchenId=
    const params = new URLSearchParams(searchParams.toString());
    params.set("kitchenId", kId);
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] flex flex-col md:flex-row text-[#0d261e] font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. MOBILE TOP HEADER */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-50 bg-[#064e3b] text-white border-b border-[#d4af37]/30 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-5 text-[#d4af37]" /> : <Menu className="size-5" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-black italic text-lg tracking-tight text-white">malashree</span>
            <span className="px-1.5 py-0.2 rounded bg-[#d4af37] text-[#064e3b] text-[9px] font-black uppercase">
              Kitchen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#d4af37] truncate max-w-[120px]">
            {activeKitchen?.name || "Kitchen"}
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE QUICK SWITCHER BAR */}
      {/* ========================================================================= */}
      <div className="md:hidden sticky top-14 z-40 bg-white border-b border-[#e6e2d8] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        <span className="text-[10px] font-black uppercase text-[#52635c] shrink-0">Branch:</span>
        {kitchens.map((k) => {
          const isSelected = k.id === activeKitchen?.id;
          return (
            <button
              key={k.id}
              onClick={() => handleSwitchKitchen(k.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? "bg-[#064e3b] text-[#d4af37] shadow-xs"
                  : "bg-[#fbf9f4] text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              {k.name}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SIDEBAR DRAWER */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-4/5 max-w-xs bg-[#064e3b] text-white flex flex-col h-full shadow-2xl border-r border-[#d4af37]/30 z-10">
            <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black italic text-xl tracking-tight text-white">
                  malashree
                </span>
                <span className="px-2 py-0.5 rounded bg-[#d4af37] text-[#064e3b] text-[10px] font-black uppercase">
                  Kitchen Ops
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navigation.map((item) => {
                const isActive =
                  path === item.href ||
                  (item.href !== "/kitchen/dashboard" && path?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={`${item.href}${activeKitchen ? `?kitchenId=${activeKitchen.id}` : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? "bg-[#d4af37] text-[#064e3b] font-black shadow-xs"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`size-4 shrink-0 ${
                          isActive ? "text-[#064e3b]" : "text-[#d4af37]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="size-3.5 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#d4af37]/20 bg-black/10 space-y-3">
              <Link
                href="/"
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="size-3.5" />
                <span>Exit Kitchen Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DESKTOP PERMANENT SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 bg-[#064e3b] text-white flex-col shrink-0 border-r border-[#d4af37]/30 min-h-screen">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#d4af37]/20">
          <Link href="/kitchen/dashboard" className="flex items-center gap-2">
            <span className="font-black italic text-2xl tracking-tight text-white">malashree</span>
            <span className="px-2 py-0.5 rounded-md bg-[#d4af37] text-[#064e3b] text-[10px] font-black uppercase">
              Kitchen
            </span>
          </Link>
        </div>

        {/* Branch Selector Banner in Sidebar */}
        <div className="p-3 border-b border-[#d4af37]/15 bg-black/10">
          <label className="block text-[9px] font-mono uppercase tracking-wider text-[#d4af37] mb-1 font-bold">
            Active Branch Dashboard:
          </label>
          <div className="relative">
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="w-full h-9 px-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-white flex items-center justify-between transition cursor-pointer border border-[#d4af37]/20"
            >
              <span className="truncate">{activeKitchen?.name || "Select Kitchen"}</span>
              <ChevronDown className="size-3.5 text-[#d4af37] shrink-0" />
            </button>

            {branchDropdownOpen && (
              <div className="absolute top-10 left-0 right-0 z-50 bg-[#064e3b] border border-[#d4af37]/30 rounded-xl shadow-2xl overflow-hidden divide-y divide-white/10">
                {kitchens.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => handleSwitchKitchen(k.id)}
                    className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      k.id === activeKitchen?.id
                        ? "bg-[#d4af37] text-[#064e3b]"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{k.name}</span>
                    <span className="text-[10px] opacity-75">{k.area || "Pune"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              path === item.href ||
              (item.href !== "/kitchen/dashboard" && path?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={`${item.href}${activeKitchen ? `?kitchenId=${activeKitchen.id}` : ""}`}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-[#d4af37] text-[#064e3b] font-black shadow-xs"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 ${
                    isActive ? "text-[#064e3b]" : "text-[#d4af37]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & Exit */}
        <div className="p-4 border-t border-[#d4af37]/20 bg-black/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#d4af37] text-[#064e3b] font-black text-sm grid place-items-center">
              {user?.name?.charAt(0) || "K"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate">
                {user?.name || "Kitchen Manager"}
              </p>
              <p className="text-[10px] text-[#d4af37] truncate">{activeKitchen?.name}</p>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="size-3.5" />
            <span>Exit to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 5. MAIN CONTENT VIEWPORT */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-[#e6e2d8] items-center justify-between px-6 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#064e3b]">
              Kitchen Ops
            </span>
            <span className="text-[#52635c]">/</span>
            <span className="text-xs font-bold text-[#0d261e]">
              {activeKitchen?.name || "Kitchen Branch"}
            </span>
            <span className="text-[#52635c]">/</span>
            <span className="text-xs font-bold text-[#52635c]">{activeItem.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-[#064e3b] text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200">
              <span className="size-2 rounded-full bg-[#064e3b] animate-pulse" />
              Live Order Dispatch Attached
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
