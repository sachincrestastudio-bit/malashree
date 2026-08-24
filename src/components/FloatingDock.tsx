"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bike, UtensilsCrossed, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/lib/store";

export function FloatingDock() {
  const path = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const cart = useStore((s) => s.cart);
  const cartCount = (cart || []).reduce((n, c) => n + (c?.qty || 0), 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Do not render dock on internal portal pages, cart, checkout, or order tracking pages
  if (
    !isMounted ||
    path?.startsWith("/admin") ||
    path?.startsWith("/kitchen") ||
    path?.startsWith("/delivery") ||
    path?.startsWith("/api") ||
    path === "/cart" ||
    path === "/checkout" ||
    path?.startsWith("/orders")
  ) {
    return null;
  }

  const mobileNavItems = [
    { to: "/", label: "Delivery", icon: Bike },
    { to: "/menu", label: "Menu", icon: UtensilsCrossed },
    { to: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
    >
      <div className="bg-[#064e3b]/95 backdrop-blur-xl border border-[#d4af37]/30 rounded-full px-3 py-1.5 shadow-[0_12px_36px_rgba(6,78,59,0.35)] flex items-center gap-1 text-white/80">
        {mobileNavItems.map((item) => {
          const isActive =
            path === item.to || (item.to !== "/" && path?.startsWith(item.to));
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              href={item.to}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "text-[#064e3b] bg-[#d4af37] shadow-xs font-black"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="size-4 shrink-0" />
                {!isActive && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 size-4 rounded-full bg-[#d4af37] text-[#064e3b] text-[9px] font-black flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
