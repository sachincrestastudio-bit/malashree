import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";
import { ArrowLeft, Timer, CheckCircle2, Package, Printer } from "lucide-react";
import Link from "next/link";

export default async function KitchenOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireKitchenAccess();
  const { id } = await params;
  await connectToDatabase();

  const order = (await Order.findOne({ _id: id, kitchenId: user.kitchenId })
    .populate("customer", "name phone")
    .lean()) as any;

  if (!order) {
    return (
      <div className="bg-white border border-ink/10 rounded-2xl p-8 text-center text-ink font-mono text-sm">
        Order not found or access denied.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/kitchen/orders"
        className="text-lime-deep hover:text-ink flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest w-fit"
      >
        <ArrowLeft className="size-4" /> Back to Queue
      </Link>

      <div className="bg-white rounded-3xl border border-ink/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-ink/10 flex justify-between items-start bg-cream/40">
          <div>
            <h2 className="font-display text-4xl text-ink mb-2">{order.orderNumber}</h2>
            <div className="flex gap-2 text-xs font-mono font-bold">
              <span className="bg-white text-ink border border-ink/10 px-3 py-1 rounded-full">
                {order.customer?.name}
              </span>
              <span className="bg-lime/20 text-emerald border border-lime/40 px-3 py-1 rounded-full uppercase">
                {order.orderStatus}
              </span>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <p className="text-olive mb-1">Placed At</p>
            <p className="text-ink font-bold">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <h3 className="font-display text-2xl text-ink pb-2 border-b border-ink/10">
            Order Items Ticket
          </h3>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center bg-cream/30 p-4 rounded-2xl border border-ink/10"
              >
                <div className="flex items-center gap-4">
                  <div className="size-9 rounded-xl bg-ink text-lime flex items-center justify-center font-mono font-bold text-sm">
                    {item.quantity}×
                  </div>
                  <div>
                    <p className="font-display text-lg text-ink font-bold">{item.name}</p>
                    {item.variants && item.variants.length > 0 && (
                      <p className="text-xs text-olive font-mono mt-0.5">
                        Variants: {item.variants.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="bg-amber-500/10 border border-amber-300 p-4 rounded-2xl">
              <h4 className="text-amber-900 font-mono font-bold text-xs uppercase tracking-wider mb-1">
                Special Instructions
              </h4>
              <p className="text-amber-950 text-sm italic font-light">{order.specialInstructions}</p>
            </div>
          )}

          <div className="pt-4 border-t border-ink/10 flex flex-wrap gap-4">
            {order.orderStatus === "placed" && (
              <button className="flex-1 h-12 bg-ink text-lime font-mono text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald transition">
                Start Preparing
              </button>
            )}
            {order.orderStatus === "preparing" && (
              <button className="flex-1 h-12 bg-lime text-ink font-mono text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-lime/90 transition">
                Mark Ready for Pickup
              </button>
            )}
            <button className="px-6 h-12 bg-white border border-ink/20 text-ink font-mono text-xs font-bold uppercase tracking-widest rounded-xl hover:border-ink transition flex items-center gap-2">
              <Printer className="size-4" /> Print KOT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
