import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenAvailabilityService } from "@/services/kitchen/KitchenAvailabilityService";
import { ToggleLeft, ToggleRight, UtensilsCrossed, CheckCircle2, XCircle } from "lucide-react";

export default async function KitchenMenuPage() {
  const user = await requireKitchenAccess();
  const menuItems = await KitchenAvailabilityService.getKitchenMenu(user.kitchenId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Stock & Inventory
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Menu <span className="italic text-emerald">Availability</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Live dish stock toggles for {user.kitchenId}.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-cream/40">
            <tr>
              {["Item Name", "Category", "Stock Status", "Quick Action"].map((h, i) => (
                <th
                  key={h}
                  className={`px-6 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive ${i === 3 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-olive font-mono text-xs">
                  No menu items assigned to this kitchen.
                </td>
              </tr>
            ) : (
              menuItems.map((item: any) => (
                <tr key={item._id.toString()} className="hover:bg-cream/40 transition-colors">
                  <td className="px-6 py-4 font-display text-lg text-ink font-bold">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-olive-dark">
                    {item.category?.name || "Mains"}
                  </td>
                  <td className="px-6 py-4">
                    {item.isAvailable ? (
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-lime/40 text-lime-deep bg-lime/10 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="size-3" /> In Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-red-200 text-red-700 bg-red-50 flex items-center gap-1 w-fit">
                        <XCircle className="size-3" /> Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.isAvailable ? (
                      <button className="text-red-700 font-mono text-xs uppercase tracking-wider hover:underline flex items-center gap-1 justify-end w-full">
                        <ToggleRight className="size-5 text-red-600" /> Disable
                      </button>
                    ) : (
                      <button className="text-lime-deep font-mono text-xs uppercase tracking-wider hover:underline flex items-center gap-1 justify-end w-full">
                        <ToggleLeft className="size-5 text-olive/40" /> Enable
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
