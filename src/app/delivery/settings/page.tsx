import { requireDriverAccess } from '@/actions/delivery/auth';
import { ArrowLeft, Bell, Map, Moon } from 'lucide-react';
import Link from 'next/link';

export default async function DeliverySettingsPage() {
  await requireDriverAccess();

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-6">
      <Link href="/delivery/profile" className="text-blue-500 hover:text-blue-400 flex items-center gap-2 text-sm font-bold w-fit mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <h2 className="text-xl font-bold text-white mb-4">Settings</h2>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Navigation Preference */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-white font-medium">Default Navigation</p>
              <p className="text-slate-400 text-xs">Google Maps</p>
            </div>
          </div>
          <button className="text-sm font-bold text-blue-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Change
          </button>
        </div>

        {/* Notifications */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-slate-400 text-xs">Enabled for new orders</p>
            </div>
          </div>
          {/* Mock Toggle */}
          <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-slate-400 text-xs">Forced ON for battery saving</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
