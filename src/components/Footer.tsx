"use client";

import Link from "next/link";


export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-4xl md:text-5xl leading-[0.95]">
            order <span className="text-lime">direct.</span><br/>
            skip the <span className="italic">middleman.</span>
          </div>
          <p className="mt-6 text-cream/60 max-w-sm text-sm leading-relaxed">
            Malashree's own ordering platform. Lower fees, faster kitchens, the same food you love — straight from us to you.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-lime/80 mb-4">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/menu" className="hover:text-lime">Menu</Link></li>
            <li><Link href="/branches" className="hover:text-lime">Branches</Link></li>
            <li><Link href="/profile" className="hover:text-lime">Profile</Link></li>
            <li><Link href="/register" className="hover:text-lime">Register</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-lime/80 mb-4">Branches</div>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>Pimple Saudagar</li>
            <li>Chinchwad</li>
            <li>Sangvi</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-between text-xs text-cream/50">
          <div>© {new Date().getFullYear()} Malashree. Hand-rolled in Pune.</div>
          <div>Demo build · v1.0</div>
        </div>
      </div>
    </footer>
  );
}
