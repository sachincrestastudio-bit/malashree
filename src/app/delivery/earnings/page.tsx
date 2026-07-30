import { requireDriverAccess } from "@/actions/delivery/auth";
import { EarningsService } from "@/services/delivery/EarningsService";
import { Wallet, TrendingUp, Calendar, Clock, Award } from "lucide-react";
import Link from "next/link";

export default async function DeliveryEarningsPage() {
  const { driverId } = await requireDriverAccess();
  const earnings = await EarningsService.getEarnings(driverId);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-500" /> Earnings
        </h2>
        <Link href="/delivery/history" className="text-blue-500 text-sm font-bold hover:underline">
          View History
        </Link>
      </div>

      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 p-6 rounded-2xl border border-emerald-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-24 h-24 text-emerald-500" />
        </div>
        <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-2 relative z-10">
          Today's Earnings
        </p>
        <p className="text-4xl font-bold text-white mb-1 relative z-10">
          ₹{earnings.todaysEarnings.toFixed(2)}
        </p>
        <p className="text-slate-400 text-sm relative z-10">
          Based on {earnings.totalDeliveries} deliveries today
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <Calendar className="w-5 h-5 text-blue-500 mb-3" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            This Week
          </p>
          <p className="text-xl font-bold text-white">₹{earnings.weeklyEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <TrendingUp className="w-5 h-5 text-purple-500 mb-3" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            This Month
          </p>
          <p className="text-xl font-bold text-white">₹{earnings.monthlyEarnings.toFixed(2)}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mt-8 mb-4">Performance Metrics</h3>
      <div className="space-y-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-white font-medium">Average Rating</p>
          </div>
          <p className="text-xl font-bold text-white">{earnings.averageRating.toFixed(1)} ⭐</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-white font-medium">Avg. Delivery Time</p>
          </div>
          <p className="text-xl font-bold text-white">{earnings.averageDeliveryTime}</p>
        </div>
      </div>
    </div>
  );
}
