import { requireKitchenAccess } from '@/actions/kitchen/auth';
import { Clock } from 'lucide-react';

export default async function KitchenAvailabilityPage() {
  await requireKitchenAccess();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-500" /> Kitchen Status
          </h2>
          <p className="text-slate-400 mt-1">Manage operating status and delays.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
        <div>
          <h3 className="text-white font-bold mb-4">Current Operating Status</h3>
          <div className="flex gap-4">
            <button className="flex-1 py-3 rounded-lg border-2 border-emerald-500 bg-emerald-950/30 text-emerald-400 font-bold">
              Open (Accepting Orders)
            </button>
            <button className="flex-1 py-3 rounded-lg border-2 border-slate-700 bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 hover:text-white transition-colors">
              Busy (Delayed)
            </button>
            <button className="flex-1 py-3 rounded-lg border-2 border-slate-700 bg-slate-800 text-slate-400 font-bold hover:bg-red-950/30 hover:border-red-500 hover:text-red-400 transition-colors">
              Closed
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-white font-bold mb-4">Estimated Prep Time (Global Override)</h3>
          <p className="text-slate-400 text-sm mb-4">Increase this if the kitchen is slammed to warn customers.</p>
          <div className="flex items-center gap-4">
            <input 
              type="number" 
              defaultValue={15}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 w-32 focus:outline-none focus:border-orange-500" 
            />
            <span className="text-slate-400">minutes</span>
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold ml-auto">
              Save Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
