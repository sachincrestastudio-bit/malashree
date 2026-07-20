import { requireKitchenAccess } from '@/actions/kitchen/auth';
import { KitchenDashboardService } from '@/services/kitchen/KitchenDashboardService';
import { ChefHat, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default async function KitchenDashboardPage() {
  const user = await requireKitchenAccess();
  const metrics = await KitchenDashboardService.getDashboardMetrics(user.kitchenId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            Kitchen Command Center
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Real-time status for {user.kitchenId}</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm border
          ${metrics.kitchenStatus === 'Open' 
            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
            : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
          {metrics.kitchenStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400 font-medium mb-1">Pending Queue</p>
          <p className="text-4xl font-bold text-orange-400">{metrics.pendingOrders}</p>
        </div>
        
        {/* Preparing */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400 font-medium mb-1">In Preparation</p>
          <p className="text-4xl font-bold text-blue-400">{metrics.preparingOrders}</p>
        </div>

        {/* Ready */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400 font-medium mb-1">Ready for Pickup</p>
          <p className="text-4xl font-bold text-emerald-400">{metrics.readyOrders}</p>
        </div>

        {/* Avg Time */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-400 font-medium mb-1">Avg Prep Time</p>
          <p className="text-4xl font-bold text-purple-400 flex items-center gap-2">
            <Clock className="w-6 h-6 opacity-50" /> {metrics.avgPrepTime}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Today's Shift
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
              <span className="text-slate-400">Total Orders Processed</span>
              <span className="text-white font-bold">{metrics.todaysOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
              <span className="text-slate-400">Successful Completions</span>
              <span className="text-emerald-400 font-bold">{metrics.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg">
              <span className="text-slate-400">Revenue (Assigned)</span>
              <span className="text-white font-bold">₹{metrics.todaysRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-slate-700 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Kitchen System Healthy</h3>
          <p className="text-sm text-slate-400">All backend services are responding properly. Queue is syncing in real-time.</p>
        </div>
      </div>
    </div>
  );
}
