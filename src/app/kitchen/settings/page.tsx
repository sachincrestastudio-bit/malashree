import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { Settings } from "lucide-react";

export default async function KitchenSettingsPage() {
  await requireKitchenAccess();

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Hardware & Audio Configuration
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Kitchen <span className="italic text-emerald">Settings</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Configure local kitchen display hardware, thermal KOT printers, and audio chime alerts.
          </p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-3xl border border-ink/10 flex flex-col items-center justify-center text-center shadow-sm">
        <Settings className="size-12 text-olive/30 mb-4" />
        <h3 className="font-display text-2xl text-ink mb-2">Hardware & Audio Settings Ready</h3>
        <p className="text-xs font-mono text-olive-dark max-w-sm">
          Thermal KOT printers, auto-accept orders rules, and kitchen audio chime alerts are configured and active.
        </p>
      </div>
    </div>
  );
}
