import { KitchenManagementService } from '@/services/admin/KitchenManagementService';
import { Store, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminKitchensPage() {
  const kitchens = await KitchenManagementService.getAllKitchens();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Management</h2>
          <p className="text-gray-500">Manage kitchen branches and their status.</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          Add Kitchen
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {kitchens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Store className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    No kitchens found
                  </td>
                </tr>
              ) : (
                kitchens.map((kitchen: any) => (
                  <tr key={kitchen._id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <Store className="w-4 h-4 text-slate-500" />
                      </div>
                      {kitchen.name}
                    </td>
                    <td className="px-6 py-4">{kitchen.address.city}</td>
                    <td className="px-6 py-4">{kitchen.contactPhone}</td>
                    <td className="px-6 py-4">
                      {kitchen.isActive ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-medium text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{kitchen.rating} / 5</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
