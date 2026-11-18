import Link from "next/link";
import { PidgeTestClient } from "../admin/pidge-test/PidgeTestClient";
import { ArrowLeft, Bike } from "lucide-react";

export const metadata = {
  title: "Pidge Hyperlocal Delivery — Developer Test Console",
};

export const dynamic = "force-dynamic";

export default function StandalonePidgeTestPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#064e3b] text-white border-b border-[#d4af37]/30 px-6 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="size-4 text-[#d4af37]" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-black italic text-xl tracking-tight text-white">Malashree</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4af37]">
              Pure Veg
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-[#d4af37] text-[#064e3b] text-[10px] font-black uppercase flex items-center gap-1">
              <Bike className="size-3" /> Pidge Sandbox
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            Admin Orders
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-8">
        <PidgeTestClient />
      </main>
    </div>
  );
}
