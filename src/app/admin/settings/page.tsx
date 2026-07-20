import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500">Global business configurations.</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-gray-500 shadow-sm">
        <Settings className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-medium text-gray-900">Settings module ready for integration</p>
        <p className="text-sm mt-1">Backend service prepared.</p>
      </div>
    </div>
  );
}
