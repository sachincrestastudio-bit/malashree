import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { Clock, AlertTriangle } from "lucide-react";

export default async function KitchenAvailabilityPage() {
  await requireKitchenAccess();

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Operating Hours
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Kitchen <span className="italic text-emerald">Availability</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Manage live operational status and rush-hour preparation overrides.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-ink/10 space-y-6 shadow-sm">
        <div>
          <h3 className="font-display text-2xl text-ink mb-4">Current Operating Status</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 py-3 px-4 rounded-xl border-2 border-ink bg-lime text-ink font-mono text-xs font-bold uppercase tracking-wider">
              Open (Accepting Orders)
            </button>
            <button className="flex-1 py-3 px-4 rounded-xl border border-ink/20 bg-cream text-olive-dark font-mono text-xs font-bold uppercase tracking-wider hover:border-ink hover:text-ink transition-colors">
              Busy (Rider Delay Warning)
            </button>
            <button className="flex-1 py-3 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-mono text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors">
              Temporarily Closed
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-ink/10">
          <h3 className="font-display text-2xl text-ink mb-2">Estimated Prep Time Override</h3>
          <p className="text-olive-dark text-xs font-mono mb-4">
            Increase estimated prep time during rush hours to display updated ETAs on customer order tracking.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              defaultValue={15}
              className="bg-cream/50 border border-ink/20 text-ink rounded-xl px-4 h-11 w-32 font-mono text-sm focus:outline-none focus:border-ink"
            />
            <span className="text-xs font-mono text-olive uppercase">Minutes</span>
            <button className="bg-ink text-lime px-6 h-11 rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald transition ml-auto">
              Save Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
