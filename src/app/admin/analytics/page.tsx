import { AnalyticsService } from '@/services/admin/AnalyticsService';
import { BarChart3 } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const trend = await AnalyticsService.getRevenueTrend();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500">View business performance metrics.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" /> 30-Day Revenue Trend
        </h3>
        {trend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No data available for the last 30 days.
          </div>
        ) : (
          <div className="h-64 flex items-end gap-2 px-2 overflow-x-auto">
            {/* Simple CSS Bar Chart for prototype */}
            {trend.map((day: any) => {
              const maxRev = Math.max(...trend.map((d: any) => d.revenue));
              const height = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
              return (
                <div key={day._id} className="group relative flex flex-col items-center flex-1 min-w-[20px]">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
                    {day._id}: ₹{day.revenue.toFixed(2)} ({day.orders} orders)
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full bg-emerald-500 rounded-t-sm hover:bg-emerald-400 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
