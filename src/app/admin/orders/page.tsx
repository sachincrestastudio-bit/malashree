"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  await connectToDatabase();

  const rawOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("customer", "name")
    .lean();

  const orders = rawOrders.map((o: any) => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    customerName: o.customer?.name || "Customer",
    kitchenName: o.kitchenName || "Kitchen",
    grandTotal: o.grandTotal || 0,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "-",
    pidgeOrderId: o.pidgeOrderId || undefined,
    pidgeTrackingUrl: o.pidgeTrackingUrl || undefined,
    pidgeStatus: o.pidgeStatus || undefined,
  }));

  return <AdminOrdersClient orders={orders} />;
}
