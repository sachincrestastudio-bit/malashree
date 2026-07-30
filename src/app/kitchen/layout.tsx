import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user";
import Link from "next/link";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Malashree Kitchen Ops",
};

const navigation = [
  { name: "Dashboard", href: "/kitchen/dashboard", icon: LayoutDashboard },
  { name: "Live Queue", href: "/kitchen/orders", icon: ListOrdered },
  { name: "Menu & Stock", href: "/kitchen/menu", icon: UtensilsCrossed },
  { name: "Order History", href: "/kitchen/history", icon: History },
  { name: "Availability", href: "/kitchen/availability", icon: Clock },
  { name: "Settings", href: "/kitchen/settings", icon: Settings },
];

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Server-Side Authorization for Kitchen Staff
  if (!user || user.role !== "kitchen_manager") {
    redirect("/"); // Redirect unauthorized users to customer home
  }

  // Ensure they have an assigned kitchen
  if (!user.assignedKitchen) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-ink p-6">
        <div className="text-center p-8 bg-white rounded-3xl border-2 border-ink max-w-md shadow-lg">
          <Store className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="font-display text-3xl mb-2 text-ink">Unassigned Kitchen</h1>
          <p className="text-olive-dark text-sm mb-6 leading-relaxed">
            Your account is not linked to a specific kitchen branch. Please contact your system administrator.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-ink text-lime font-mono text-xs uppercase tracking-widest font-bold hover:bg-emerald transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar Navigation - Identical to Admin Theme */}
      <aside className="w-full md:w-64 bg-ink text-cream/80 flex flex-col shrink-0 border-r-2 border-lime">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-lime/30">
          <span style={{ fontFamily: "var(--font-display)" }} className="text-cream text-xl tracking-tight">
            Malashree <span className="text-lime italic">Kitchen</span>
          </span>
        </div>

        {/* Subhead line */}
        <div className="px-6 py-3 border-b border-lime/20">
          <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime/70">
            Branch Operations · Portal
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-mono tracking-[0.18em] uppercase text-cream/60 hover:bg-lime/10 hover:text-lime transition-colors border-l-2 border-transparent hover:border-lime"
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-lime/20">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-8 h-8 border border-lime flex items-center justify-center text-lime font-bold text-xs uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {user?.name?.charAt(0) || "K"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-medium text-cream truncate">{user?.name || "Kitchen Manager"}</p>
              <p className="text-[10px] text-cream/40 truncate font-mono">{user?.email || ""}</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center gap-3 px-3 py-2 text-[11px] font-mono tracking-[0.18em] uppercase text-cream/50 hover:bg-lime/10 hover:text-lime transition-colors border-l-2 border-transparent hover:border-lime"
          >
            <LogOut className="h-4 w-4" />
            Exit Kitchen
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-cream border-b-2 border-ink/10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-lime" />
            <h1 className="text-[10px] font-mono tracking-[0.28em] uppercase text-olive-dark">
              Malashree · Kitchen Ops
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] font-mono tracking-[0.24em] uppercase text-lime-deep">
              <span className="size-1.5 rounded-full bg-lime animate-pulse" />
              Branch Kitchen Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
