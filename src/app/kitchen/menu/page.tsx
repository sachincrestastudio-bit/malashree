import { requireKitchenAccess } from '@/actions/kitchen/auth';
import { KitchenAvailabilityService } from '@/services/kitchen/KitchenAvailabilityService';
import { ToggleLeft, ToggleRight, UtensilsCrossed } from 'lucide-react';

export default async function KitchenMenuPage() {
  const user = await requireKitchenAccess();
  const menuItems = await KitchenAvailabilityService.getKitchenMenu(user.kitchenId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" /> Menu Availability
          </h2>
          <p className="text-slate-400 mt-1">Toggle stock status for items. Affects only your kitchen.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Item Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Stock Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No menu items assigned to this kitchen.
                </td>
              </tr>
            ) : (
              menuItems.map((item: any) => (
                <tr key={item._id.toString()} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{item.name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {item.category?.name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4">
                    {item.isAvailable ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-400 text-xs font-bold border border-emerald-900/50 uppercase tracking-wider">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-red-950/50 text-red-400 text-xs font-bold border border-red-900/50 uppercase tracking-wider">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* In a real app this would be a Client Component toggle calling a server action */}
                    {item.isAvailable ? (
                      <button className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-1 justify-end w-full">
                        <ToggleRight className="w-5 h-5" /> Disable
                      </button>
                    ) : (
                      <button className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1 justify-end w-full">
                        <ToggleLeft className="w-5 h-5" /> Enable
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
