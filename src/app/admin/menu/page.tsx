import { MenuManagementService } from '@/services/admin/MenuManagementService';
import { UtensilsCrossed } from 'lucide-react';

export default async function AdminMenuPage() {
  const items = await MenuManagementService.getAllMenuItems();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Catalog</h2>
          <p className="text-gray-500">Manage all dishes across the ecosystem.</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          Add Dish
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Kitchen</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <UtensilsCrossed className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    No menu items found
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item._id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                          <UtensilsCrossed className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      {item.name}
                    </td>
                    <td className="px-6 py-4">{item.kitchenId?.name || 'Global'}</td>
                    <td className="px-6 py-4">{item.category?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium">₹{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {item.isAvailable ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Available</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Out of Stock</span>
                      )}
                    </td>
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
