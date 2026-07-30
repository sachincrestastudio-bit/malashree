import { requireDriverAccess } from "@/actions/delivery/auth";
import { UserCircle, Settings, LogOut, FileText, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function DeliveryProfilePage() {
  const { user, profileId } = await requireDriverAccess();

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-6">
      <h2 className="text-xl font-bold text-white mb-4">My Profile</h2>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center">
        <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4">
          {user.name?.charAt(0) || "D"}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{user.phone || "No phone added"}</p>
        <div className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-sm font-bold text-slate-300">
            Driver ID: {profileId.substring(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <Link
          href="/delivery/settings"
          className="flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-white font-medium">App Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </Link>
        <Link
          href="#"
          className="flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <span className="text-white font-medium">Payout Documents</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </Link>
        <Link
          href="#"
          className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span className="text-white font-medium">Partner Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </Link>
      </div>

      <button className="w-full bg-red-950/30 hover:bg-red-950/50 text-red-500 font-bold py-4 rounded-xl transition-colors border border-red-900/50 flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" /> Sign Out
      </button>
    </div>
  );
}
