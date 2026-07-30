import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { Settings } from "lucide-react";

export default async function KitchenSettingsPage() {
  await requireKitchenAccess();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-500" /> Kitchen Settings
          </h2>
          <p className="text-slate-400 mt-1">Configure local kitchen preferences.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
        <Settings className="w-16 h-16 text-slate-700 mb-4" />
        <h3 className="text-white font-bold text-lg mb-2">Settings Ready for Integration</h3>
        <p className="text-slate-400">
          Printer integrations, alert sounds, and auto-accept rules will appear here.
        </p>
      </div>
    </div>
  );
}
