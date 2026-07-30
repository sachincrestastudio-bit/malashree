import { requireDriverAccess } from "@/actions/delivery/auth";
import { AssignmentService } from "@/services/delivery/AssignmentService";
import { MapPin, Navigation, Phone, CheckCircle, Store, Package } from "lucide-react";
import Link from "next/link";

export default async function DeliveryOrdersPage() {
  const { driverId } = await requireDriverAccess();
  const assignments = await AssignmentService.getActiveAssignments(driverId);

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-6">
      <h2 className="text-xl font-bold text-white mb-4">Live Assignments</h2>

      {assignments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-300 font-bold mb-1">No Active Orders</h3>
          <p className="text-slate-500 text-sm">New orders will appear here once assigned.</p>
        </div>
      ) : (
        assignments.map((order: any) => (
          <div
            key={order._id}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
          >
            {/* Order Header */}
            <div
              className={`p-4 border-b border-slate-800 flex justify-between items-center
              ${order.orderStatus === "ready" ? "bg-orange-950/20" : "bg-blue-950/20"}
            `}
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Order {order.orderNumber}
                </span>
                <span
                  className={`text-sm font-bold flex items-center gap-2
                  ${order.orderStatus === "ready" ? "text-orange-400" : "text-blue-400"}
                `}
                >
                  {order.orderStatus === "ready" ? (
                    <>
                      <Store className="w-4 h-4" /> Pickup Required
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" /> Out for Delivery
                    </>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold">
                  ₹{order.grandTotal?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            {/* Stops */}
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${order.orderStatus === "out_for_delivery" ? "bg-emerald-500/20 text-emerald-500" : "bg-orange-500 text-white"}`}
                  >
                    {order.orderStatus === "out_for_delivery" ? "✓" : "1"}
                  </div>
                  <div className="w-0.5 h-full bg-slate-800 my-1"></div>
                </div>
                <div className="pb-4 flex-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Pickup From
                  </p>
                  <p className="text-white font-bold">{order.kitchenName}</p>
                  <p className="text-slate-400 text-sm">
                    {order.kitchen?.location?.address || "Kitchen Address"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${order.orderStatus === "out_for_delivery" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"}`}
                  >
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Deliver To
                  </p>
                  <p className="text-white font-bold">{order.customer?.name || "Customer"}</p>
                  <p className="text-slate-400 text-sm truncate pr-4">
                    {order.deliveryAddress?.street}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <Link
                href={`/delivery/order/${order._id}`}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-center py-3 rounded-xl font-bold transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
