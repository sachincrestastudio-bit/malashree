"use client";

import { TrendingUp, ShoppingBag, Users, Clock } from "lucide-react";

export function DashboardKPIs({ data }: { data: any }) {
  if (!data) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;

  const kpis = [
    {
      title: "Total Revenue",
      value: `₹${data.totalRevenue?.toLocaleString("en-IN") || 0}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Orders",
      value: data.totalOrders?.toLocaleString() || 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "New Customers",
      value: data.newCustomers?.toLocaleString() || 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Returning Rate",
      value: `${(data.returningPercentage || 0).toFixed(1)}%`,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className={`p-4 rounded-full ${kpi.bg}`}>
            <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
