import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenDashboardService } from "@/services/kitchen/KitchenDashboardService";
import { ChefHat, TrendingUp, Clock, AlertCircle, Package, CheckCircle2, RefreshCw } from "lucide-react";

export default async function KitchenDashboardPage() {
  const user = await requireKitchenAccess();
  const metrics = await KitchenDashboardService.getDashboardMetrics(user.kitchenId);

  return (
    <div className="space-y-8">
      {/* Masthead Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Kitchen Operations
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Kitchen <span className="italic text-emerald">Command Center</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Real-time operating status and ticket dispatch for {user.kitchenId}.
          </p>
        </div>
        <div
          className={`px-4 py-2 text-xs font-mono font-bold tracking-[0.24em] uppercase border flex items-center gap-2 self-start sm:self-auto ${
            metrics.kitchenStatus === "Open"
              ? "bg-lime/20 text-lime-deep border-lime/50"
              : "bg-red-50 text-red-700 border-red-300"
          }`}
        >
          <span className={`size-2 rounded-full ${metrics.kitchenStatus === "Open" ? "bg-lime animate-pulse" : "bg-red-500"}`} />
          {metrics.kitchenStatus}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Pending Queue</span>
            <Package className="size-4 text-amber-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            {metrics.pendingOrders}
          </div>
          <div className="text-[10px] font-mono text-amber-700 mt-1">Awaiting prep start</div>
        </div>

        {/* Preparing */}
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>In Preparation</span>
            <RefreshCw className="size-4 text-blue-600 animate-spin" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            {metrics.preparingOrders}
          </div>
          <div className="text-[10px] font-mono text-blue-600 mt-1">Currently on stove</div>
        </div>

        {/* Ready */}
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Ready for Pickup</span>
            <CheckCircle2 className="size-4 text-lime-deep" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            {metrics.readyOrders}
          </div>
          <div className="text-[10px] font-mono text-lime-deep mt-1">Packed for rider pickup</div>
        </div>

        {/* Avg Time */}
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-widest text-olive flex items-center justify-between">
            <span>Avg Prep Speed</span>
            <Clock className="size-4 text-purple-600" />
          </div>
          <div className="font-display text-3xl font-bold text-ink mt-2">
            {metrics.avgPrepTime}
          </div>
          <div className="text-[10px] font-mono text-purple-600 mt-1">Average per ticket</div>
        </div>
      </div>

      {/* Shift Analytics & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-2xl text-ink pb-3 border-b border-ink/10 flex items-center gap-2">
            <TrendingUp className="size-5 text-lime-deep" /> Today's Shift Performance
          </h3>
          <div className="space-y-3 mt-4 text-xs font-mono text-olive-dark">
            <div className="flex justify-between items-center p-3 bg-cream/50 border border-ink/10 rounded-xl">
              <span>Total Orders Processed</span>
              <span className="font-bold text-ink text-sm">{metrics.todaysOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cream/50 border border-ink/10 rounded-xl">
              <span>Successful Completions</span>
              <span className="font-bold text-lime-deep text-sm">{metrics.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cream/50 border border-ink/10 rounded-xl">
              <span>Revenue (Assigned Branch)</span>
              <span className="font-bold text-ink text-sm">₹{metrics.todaysRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <AlertCircle className="size-10 text-lime-deep mb-3" />
          <h3 className="font-display text-xl text-ink">Kitchen Network Healthy</h3>
          <p className="text-xs text-olive-dark mt-1 font-mono max-w-sm">
            All backend dispatch services and WebSocket event buses are connected. Tickets sync in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
