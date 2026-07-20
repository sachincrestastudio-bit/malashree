import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import Link from 'next/link';
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
  Settings,
  Tags,
  LogOut,
  Gift
} from 'lucide-react';

export const metadata = {
  title: 'Malashree Admin Portal',
};

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Kitchens', href: '/admin/kitchens', icon: Store },
  { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Offers', href: '/admin/offers', icon: Gift },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Strict Server-Side Authorization
  if (!user || user.role !== 'admin') {
    redirect('/'); // Redirect unauthorized users to customer home
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-white text-xl border-b border-slate-800">
          Malashree <span className="text-emerald-500 ml-1">Admin</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5 opacity-75" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-gray-800">Control Center</h1>
          <div className="flex items-center gap-4">
            {/* Global Search could go here in future */}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              System Active
            </span>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
