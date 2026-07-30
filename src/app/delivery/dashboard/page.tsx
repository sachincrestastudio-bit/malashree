import { requireDriverAccess } from "@/actions/delivery/auth";
import { DeliveryDashboardService } from "@/services/delivery/DeliveryDashboardService";
import { Bike, Navigation, MapPin, Wallet, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function DeliveryDashboardPage() {
  const { driverId } = await requireDriverAccess();
  const metrics = await DeliveryDashboardService.getDashboardMetrics(driverId);

  return (
    <div className="space-y-6 pb-6 max-w-lg mx-auto">
      {/* Header Profile / Status */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl">
              {metrics.driverName.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{metrics.driverName}</h2>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                ⭐ {metrics.currentRating.toFixed(1)} Rating
              </div>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-blue-900/50">
            Go Offline
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Today's Pay
            </p>
            <p className="text-2xl font-bold text-emerald-400">₹{metrics.todaysEarnings}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Deliveries
            </p>
            <p className="text-2xl font-bold text-white">{metrics.completedDeliveries}</p>
          </div>
        </div>
      </div>

      {/* Actionable Map / Queue Area */}
      {metrics.pendingPickups > 0 || metrics.activeDeliveries > 0 ? (
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-blue-400 flex items-center gap-2">
              <Navigation className="w-5 h-5 animate-pulse" /> Active Assignment
            </h3>
            <span className="bg-blue-900 text-blue-100 text-xs font-bold px-2 py-1 rounded">
              Action Required
            </span>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            You have active orders that require your attention.
          </p>
          <Link
            href="/delivery/orders"
            className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-3 rounded-xl font-bold transition-colors"
          >
            View Live Route
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <MapPin className="w-12 h-12 text-slate-700 mb-4" />
          <h3 className="text-white font-bold mb-2">Looking for orders...</h3>
          <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
            Stay in your current zone to receive the next delivery ping.
          </p>
        </div>
      )}

      {/* Daily Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-bold">{metrics.pendingPickups}</p>
            <p className="text-xs text-slate-400">Pending Pickups</p>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold">{metrics.completedDeliveries}</p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
