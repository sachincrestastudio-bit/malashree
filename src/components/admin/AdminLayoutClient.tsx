"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  Ticket,
  Star,
  CreditCard,
  BarChart3,
  Tags,
  Settings,
  Gift,
  ShieldCheck,
  MessageSquareWarning,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  UserCheck,
} from "lucide-react";

interface AdminLayoutClientProps {
  user: any;
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Homepage", href: "/admin/homepage", icon: Sparkles },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Kitchens", href: "/admin/kitchens", icon: Store },
  { name: "Branch Heads", href: "/admin/managers", icon: UserCheck },
  { name: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Complaints", href: "/admin/complaints", icon: MessageSquareWarning },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Admins", href: "/admin/admins", icon: ShieldCheck },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Offers", href: "/admin/offers", icon: Gift },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const path = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  const activeItem = navigation.find((n) => path?.startsWith(n.href)) || navigation[0];

  return (
    <div className="min-h-screen bg-[#fbf9f4] flex flex-col md:flex-row text-[#0d261e] font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. MOBILE TOP HEADER (Visible on screens < 768px) */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-50 bg-[#064e3b] text-white border-b border-[#d4af37]/30 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5 text-[#d4af37]" /> : <Menu className="size-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-1.5">
            <span className="font-black italic text-lg tracking-tight text-white">
              malashree
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#d4af37] text-[#064e3b] text-[9px] font-black uppercase">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#d4af37] truncate max-w-[120px]">
            {activeItem.name}
          </span>
          <div className="size-7 rounded-lg bg-[#d4af37] text-[#064e3b] font-black text-xs grid place-items-center">
            {user?.name?.charAt(0) || "A"}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE SCROLLABLE QUICK TABS BAR */}
      {/* ========================================================================= */}
      <div className="md:hidden sticky top-14 z-40 bg-white border-b border-[#e6e2d8] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        {navigation.map((item) => {
          const isActive = path === item.href || (item.href !== "/admin/dashboard" && path?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                isActive
                  ? "bg-[#064e3b] text-[#d4af37] shadow-xs"
                  : "bg-[#fbf9f4] text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SIDEBAR DRAWER (Slide-over overlay) */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-xs bg-[#064e3b] text-white flex flex-col h-full shadow-2xl border-r border-[#d4af37]/30 z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black italic text-xl tracking-tight text-white">
                  malashree
                </span>
                <span className="px-2 py-0.5 rounded bg-[#d4af37] text-[#064e3b] text-[10px] font-black uppercase">
                  Control
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navigation.map((item) => {
                const isActive = path === item.href || (item.href !== "/admin/dashboard" && path?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? "bg-[#d4af37] text-[#064e3b] font-black shadow-xs"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-4 shrink-0 ${isActive ? "text-[#064e3b]" : "text-[#d4af37]"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="size-3.5 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            {/* User info & Exit */}
            <div className="p-4 border-t border-[#d4af37]/20 bg-black/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-[#d4af37] text-[#064e3b] font-black text-sm grid place-items-center">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-[#d4af37] truncate">{user?.email || "admin@malashree.in"}</p>
                </div>
              </div>

              <Link
                href="/"
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="size-3.5" />
                <span>Exit to Storefront</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DESKTOP PERMANENT SIDEBAR (Visible on screens >= 768px) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 bg-[#064e3b] text-white flex-col shrink-0 border-r border-[#d4af37]/30 min-h-screen">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#d4af37]/20">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-black italic text-2xl tracking-tight text-white">
              malashree
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#d4af37] text-[#064e3b] text-[10px] font-black uppercase">
              Admin
            </span>
          </Link>
        </div>

        {/* Portal status line */}
        <div className="px-6 py-2.5 border-b border-[#d4af37]/15 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
            Control Center
          </span>
          <span className="flex items-center gap-1.5 text-[9px] text-emerald-300 font-bold">
            <span className="size-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            Live
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = path === item.href || (item.href !== "/admin/dashboard" && path?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-[#d4af37] text-[#064e3b] font-black shadow-xs"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-[#064e3b]" : "text-[#d4af37]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-[#d4af37]/20 bg-black/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#d4af37] text-[#064e3b] font-black text-sm grid place-items-center">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-[#d4af37] truncate">{user?.email || "admin@malashree.in"}</p>
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
      {/* 5. MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-[#e6e2d8] items-center justify-between px-6 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#064e3b]">
              Portal
            </span>
            <span className="text-[#52635c]">/</span>
            <span className="text-xs font-bold text-[#0d261e]">{activeItem.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#064e3b] text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200">
              <span className="size-2 rounded-full bg-[#064e3b] animate-pulse" />
              Connected
            </span>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
