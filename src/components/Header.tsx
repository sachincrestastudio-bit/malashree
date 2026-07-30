"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useStore } from "@/lib/store";
import { getBranch, findDish } from "@/lib/data";
import { MapPin, ShoppingBag, User, Home, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo } from "react";

export function Header() {
  const branchId = useStore((s) => s.branchId);
  const cart = useStore((s) => s.cart);
  const profile = useStore((s) => s.profile);
  const branch = getBranch(branchId);
  const path = usePathname();

  const kitchenMenu = useStore((s) => s.kitchenMenu);
  const cartTotals = useStore((s) => s.cartTotals);

  // Calculate cart details
  const cartCount = useMemo(() => cart.reduce((n, c) => n + c.qty, 0), [cart]);

  const cartTotal = useMemo(() => {
    if (cartTotals?.grandTotal) return cartTotals.grandTotal;
    return cart.reduce((total, c) => {
      const dish = kitchenMenu.find((d) => d.id === c.dishId) || branch.menu.find((d) => d.id === c.dishId) || findDish(c.dishId);
      return total + (dish?.price || 0) * c.qty;
    }, 0);
  }, [cart, kitchenMenu, branch.menu, cartTotals]);

  // Extract initials if profile name is set
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

  const navItem = (to: string, label: string) => {
    const isActive = path === to;
    return (
      <Link
        href={to}
        className="relative px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors duration-300"
      >
        <span className={isActive ? "text-ink" : "text-olive-dark hover:text-ink"}>{label}</span>
        {isActive && (
          <motion.div
            layoutId="active-nav-pill"
            className="absolute inset-0 bg-ink/5 rounded-full -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        )}
      </Link>
    );
  };

  const mobileNavItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/menu", label: "Menu", icon: Utensils },
    { to: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Decorative Brand Accent Line */}
      <div className="h-0.5 bg-gradient-to-r from-lime via-olive to-lime w-full sticky top-0 z-50" />

      {/* Desktop Header */}
      <motion.header
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block sticky top-0.5 z-40 bg-cream/80 backdrop-blur-xl border-b border-ink/5 shadow-[0_2px_15px_-3px_rgba(30,26,23,0.03)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative size-10 rounded-xl bg-gradient-to-tr from-ink to-olive-dark border border-lime/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-lime font-display text-xl font-bold leading-none select-none tracking-tight">
                M
              </span>
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-lime border border-ink animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-ink leading-none">
                malashree
              </span>
              <span className="text-[9px] uppercase tracking-widest text-olive font-bold mt-1 font-sans">
                gourmet kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-2 ml-8">
            {navItem("/", "Home")}
            {navItem("/menu", "Menu")}
            {navItem("/profile", "Profile")}
          </nav>

          {/* Right Section Controls */}
          <div className="ml-auto flex items-center gap-4">
            {/* Active Allotted Kitchen Badge */}
            <div
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-ink/5 shadow-sm"
              title="Allotted Kitchen Zone (determined automatically by GPS)"
            >
              <div className="relative size-8 rounded-full bg-lime/10 flex items-center justify-center shrink-0">
                <MapPin
                  className="size-4 text-olive-dark animate-bounce"
                  style={{ animationDuration: "3s" }}
                />
                <span className="absolute bottom-0 right-0 size-2 bg-green-600 rounded-full border border-white" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] uppercase tracking-widest text-olive font-bold">
                  Allotted Zone
                </div>
                <div className="text-xs font-bold text-ink flex items-center gap-1">
                  {branch.area}
                  <span
                    className="inline-block size-1.5 rounded-full bg-green-500 animate-pulse"
                    title="Kitchen is online & taking orders"
                  />
                </div>
              </div>
            </div>

            {/* Live Basket Button */}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 px-4 h-10 rounded-full bg-ink text-cream hover:bg-ink/90 active:scale-95 transition-all shadow-sm group"
            >
              <div className="relative">
                <ShoppingBag className="size-4 text-lime transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-3.5 bg-lime text-ink text-[8px] font-extrabold rounded-full flex items-center justify-center border border-ink">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">
                {cartCount > 0 ? `Basket · ₹${cartTotal}` : "Basket"}
              </span>
            </Link>

            {/* Profile Avatar / Login */}
            <Link
              href="/profile"
              className="relative flex items-center justify-center size-10 rounded-full border border-ink/5 bg-white shadow-sm hover:border-ink/20 active:scale-95 transition-all group overflow-hidden"
              aria-label="User Profile"
            >
              {userInitials ? (
                <span className="text-xs font-bold text-ink font-sans tracking-tight bg-lime/20 w-full h-full flex items-center justify-center group-hover:bg-lime/30 transition-colors">
                  {userInitials}
                </span>
              ) : (
                <User className="size-4 text-olive-dark group-hover:text-ink transition-colors" />
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile Top Header Bar */}
      {path === "/" && (
        <header className="md:hidden w-full h-14 bg-cream/80 backdrop-blur-md border-b border-ink/5 flex items-center justify-between px-4 sticky top-0.5 z-40">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative size-8 rounded-lg bg-gradient-to-tr from-ink to-olive-dark border border-lime/30 flex items-center justify-center shadow-sm">
              <span className="text-lime font-display text-sm font-bold leading-none select-none">
                M
              </span>
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-lime border border-ink animate-pulse" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-ink leading-none">
              malashree
            </span>
          </Link>
          <div className="flex items-center gap-1.5 bg-white border border-ink/5 px-3 py-1.5 rounded-full text-xs font-bold text-ink shadow-sm">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>{branch.area}</span>
          </div>
        </header>
      )}

      {/* Mobile Floating Bottom Island Navigation Dock */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[320px]">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-ink/95 backdrop-blur-2xl border border-white/10 rounded-full p-2.5 shadow-[0_24px_50px_-8px_rgba(0,0,0,0.65)] flex items-center justify-between text-cream/60"
        >
          <AnimatePresence initial={false}>
            {mobileNavItems.map((item) => {
              const isActive = path === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`relative h-11 flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-ink font-bold px-4 flex-grow max-w-[100px] z-10"
                      : "w-11 text-cream/70 hover:text-cream z-10"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <Icon className="size-5 shrink-0" />
                      {!isActive && item.count !== undefined && item.count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-lime text-ink text-[8px] font-extrabold flex items-center justify-center border border-ink">
                          {item.count}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] font-bold tracking-wider uppercase font-sans whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-bg"
                      className="absolute inset-0 bg-lime rounded-full -z-10 shadow-[0_4px_12px_rgba(240,167,58,0.25)]"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
