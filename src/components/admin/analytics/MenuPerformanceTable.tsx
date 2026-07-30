"use client";

export function MenuPerformanceTable({ data }: { data: any }) {
  if (!data || (!data.bestSellers.length && !data.worstSellers.length)) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        No menu performance data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Best Sellers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Top Performing Dishes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {data.bestSellers.map((dish: any, idx: number) => (
            <div
              key={dish._id}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {idx + 1}
                </span>
                <span className="font-medium text-gray-900">{dish.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{dish.totalSold} sold</p>
                <p className="text-xs text-gray-500">₹{dish.revenueGenerated.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst Sellers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Lowest Performing Dishes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {data.worstSellers.map((dish: any, idx: number) => (
            <div
              key={dish._id}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-50 text-red-600">
                  !
                </span>
                <span className="font-medium text-gray-900">{dish.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{dish.totalSold} sold</p>
                <p className="text-xs text-gray-500">₹{dish.revenueGenerated.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
