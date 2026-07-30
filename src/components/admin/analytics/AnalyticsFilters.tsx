"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function AnalyticsFilters({ kitchens }: { kitchens: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentKitchen = searchParams.get("kitchenId") || "all";
  const currentPeriod = searchParams.get("period") || "30d";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <select
        value={currentKitchen}
        onChange={(e) => updateFilters("kitchenId", e.target.value)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="all">All Kitchens</option>
        {kitchens.map((k) => (
          <option key={k._id} value={k._id.toString()}>
            {k.name}
          </option>
        ))}
      </select>

      <select
        value={currentPeriod}
        onChange={(e) => updateFilters("period", e.target.value)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="today">Today</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="year">Last 12 Months</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
}
