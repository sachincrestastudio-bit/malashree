import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenQueueService } from "@/services/kitchen/KitchenQueueService";
import { History, Search, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function KitchenHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kitchenId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const user = await requireKitchenAccess(resolvedParams?.kitchenId);
  const page = parseInt(resolvedParams.page || "1", 10);
  const data = await KitchenQueueService.getHistory(user.kitchenId, page);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Order Audit Trail
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95] flex items-center gap-3">
            Kitchen Order <span className="italic text-emerald">History</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Completed and cancelled historical tickets for {user.kitchenId}.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-cream/40">
            <tr>
              {["Order ID", "Customer", "Time", "Status", "Total Amount", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`px-6 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive ${i === 5 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {data.orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-olive font-mono text-xs">
                  No historical orders found for this branch.
                </td>
              </tr>
            ) : (
              data.orders.map((order: any) => (
                <tr key={order._id.toString()} className="hover:bg-cream/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-ink text-xs">
                    <span className="bg-ink/5 border border-ink/10 px-2 py-0.5">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-ink">
                    {order.customer?.name || "Customer"}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-olive-dark">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {order.orderStatus === "delivered" ? (
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-lime/40 text-lime-deep bg-lime/10 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="size-3" /> Delivered
                      </span>
                    ) : order.orderStatus === "cancelled" ? (
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-red-200 text-red-700 bg-red-50 flex items-center gap-1 w-fit">
                        <XCircle className="size-3" /> Cancelled
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-ink/20 text-ink bg-cream flex items-center gap-1 w-fit">
                        {order.orderStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-display text-lg text-ink font-bold">
                    ₹{order.grandTotal?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/kitchen/order/${order._id}`}
                      className="px-3 py-1 bg-ink text-lime text-[10px] font-mono uppercase tracking-widest hover:bg-emerald transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data.pages > 1 && (
          <div className="p-4 border-t border-ink/10 flex justify-center gap-2 font-mono text-xs">
            <Link
              href={`/kitchen/history?page=${Math.max(1, data.page - 1)}`}
              className={`px-4 py-2 border border-ink/20 rounded-lg ${
                data.page === 1 ? "opacity-30 pointer-events-none" : "hover:border-ink"
              }`}
            >
              Previous
            </Link>
            <span className="px-4 py-2 text-olive">
              Page {data.page} of {data.pages}
            </span>
            <Link
              href={`/kitchen/history?page=${Math.min(data.pages, data.page + 1)}`}
              className={`px-4 py-2 border border-ink/20 rounded-lg ${
                data.page === data.pages ? "opacity-30 pointer-events-none" : "hover:border-ink"
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
