import { AdminDashboardService } from "@/services/admin/AdminDashboardService";
import { IndianRupee, ShoppingBag, Users, Store, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // Fetch metrics server-side
  const metrics = await AdminDashboardService.getDashboardMetrics();

  const statCards = [
    {
      name: "Today's Revenue",
      value: `₹${metrics.todaysRevenue.toFixed(2)}`,
      icon: IndianRupee,
      num: "01",
    },
    {
      name: "Today's Orders",
      value: metrics.todaysOrderCount.toString(),
      icon: ShoppingBag,
      num: "02",
    },
    {
      name: "Active Orders",
      value: metrics.activeOrdersCount.toString(),
      icon: ShoppingBag,
      num: "03",
    },
    {
      name: "Total Customers",
      value: metrics.totalCustomers.toString(),
      icon: Users,
      num: "04",
    },
    {
      name: "Active Kitchens",
      value: metrics.activeKitchens.toString(),
      icon: Store,
      num: "05",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <div className="border-b-2 border-ink pb-4">
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
          <span className="h-px w-8 bg-lime" />
          Chapter 01 · Overview
        </div>
        <h2 className="font-display text-4xl text-ink leading-[0.95]">
          Dashboard <span className="italic text-emerald">Overview</span>
        </h2>
        <p className="text-sm text-olive-dark mt-2 italic font-light">
          Welcome back. Here's what's happening at Malashree today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white border border-ink/10 hover:border-lime transition-all duration-300 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep">
                  N°{stat.num}
                </span>
                <Icon className="h-4 w-4 text-olive" />
              </div>
              <div className="font-display text-3xl text-ink leading-none">
                <span className="text-lime">
                  {stat.name.includes("Revenue") ? "" : ""}
                </span>
                {stat.value}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-olive-dark">
                {stat.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-ink/10">
        <div className="px-6 py-4 border-b border-ink/10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
              <span className="h-px w-6 bg-lime" />
              The Register
            </div>
            <h3 className="font-display text-2xl text-ink">Recent Orders</h3>
          </div>
          <Link
            href="/admin/orders"
            className="group flex items-center gap-2 text-[10px] font-mono tracking-[0.24em] uppercase text-ink hover:text-emerald transition"
          >
            View All <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Order ID", "Customer", "Kitchen", "Total", "Status", "Time"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {metrics.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-olive-dark italic font-light text-sm">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                metrics.recentOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-ink">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-olive-dark">{order.customer?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm text-olive-dark">{order.kitchenName}</td>
                    <td className="px-6 py-4 font-display text-ink">₹{order.grandTotal.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border
                        ${
                          order.orderStatus === "delivered"
                            ? "border-lime/40 text-lime-deep bg-lime/10"
                            : order.orderStatus === "cancelled"
                              ? "border-red-300 text-red-700 bg-red-50"
                              : order.orderStatus === "preparing"
                                ? "border-ink/20 text-ink bg-ink/5"
                                : "border-olive/30 text-olive bg-olive/5"
                        }`}
                      >
                        {order.orderStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-olive">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

