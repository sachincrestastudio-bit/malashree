import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user";
import Link from "next/link";
import { Bike, LayoutDashboard, ListOrdered, Wallet, UserCircle, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Malashree Delivery Partner",
};

const bottomNav = [
  { name: "Home", href: "/delivery/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/delivery/orders", icon: ListOrdered },
  { name: "Earnings", href: "/delivery/earnings", icon: Wallet },
  { name: "Profile", href: "/delivery/profile", icon: UserCircle },
];

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Server-Side Authorization for Delivery Partners
  if (!user || user.role !== "driver") {
    redirect("/"); // Redirect unauthorized users to customer home
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-20 md:pb-0 flex flex-col md:flex-row">
      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-white text-lg">
          <Bike className="w-5 h-5 text-blue-500" />
          Partner<span className="text-blue-500">App</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-xs font-bold text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Online
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile, but provides a fallback layout) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 bg-slate-900 font-bold text-white text-xl border-b border-slate-800">
          <Bike className="w-6 h-6 text-blue-500 mr-2" />
          Delivery<span className="text-blue-500 ml-1">App</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5 opacity-80 text-blue-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-hidden bg-slate-950 flex flex-col">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center h-16 px-2 z-50 safe-area-bottom">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-blue-400 active:text-blue-500 transition-colors"
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
