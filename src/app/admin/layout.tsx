import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user";
import Link from "next/link";
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
} from "lucide-react";

export const metadata = {
  title: "Malashree Admin Portal",
};

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Kitchens", href: "/admin/kitchens", icon: Store },
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Server-Side Authorization
  if (!user || user.role !== "admin") {
    redirect("/"); // Redirect unauthorized users to customer home
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-ink text-cream/80 flex flex-col shrink-0 border-r-2 border-lime">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-lime/30">
          <span style={{ fontFamily: "var(--font-display)" }} className="text-cream text-xl tracking-tight">
            Malashree <span className="text-lime italic">Admin</span>
          </span>
        </div>

        {/* Issue line */}
        <div className="px-6 py-3 border-b border-lime/20">
          <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime/70">
            Control Centre · Portal
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
            <div className="w-8 h-8 border border-lime flex items-center justify-center text-lime font-bold text-xs uppercase"
              style={{ fontFamily: "var(--font-display)" }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-medium text-cream truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-cream/40 truncate font-mono">{user?.email || ""}</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center gap-3 px-3 py-2 text-[11px] font-mono tracking-[0.18em] uppercase text-cream/50 hover:bg-lime/10 hover:text-lime transition-colors border-l-2 border-transparent hover:border-lime"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin
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
              Malashree · Control Centre
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] font-mono tracking-[0.24em] uppercase text-lime-deep">
              <span className="size-1.5 rounded-full bg-lime animate-pulse" />
              System Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
