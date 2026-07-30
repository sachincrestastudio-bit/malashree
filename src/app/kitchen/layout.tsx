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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center p-8 bg-slate-800 rounded-xl max-w-md">
          <Store className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Unassigned Kitchen</h1>
          <p className="text-slate-400 mb-6">
            Your account is not linked to a specific kitchen. Please contact the administrator.
          </p>
          <Link
            href="/"
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-300">
      {/* Dark Sidebar Navigation designed for kitchen environments */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 bg-slate-900 font-bold text-white text-xl border-b border-slate-800">
          <ChefHat className="w-6 h-6 text-orange-500 mr-2" />
          Kitchen <span className="text-orange-500 ml-1">Ops</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5 opacity-80 text-orange-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm border border-slate-700">
              {user.name?.charAt(0) || "K"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-emerald-400 truncate font-semibold">Kitchen Active</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-900/50 hover:bg-red-950/30 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
