"use server";

import { requireDriverAccess } from "@/actions/delivery/auth";
import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";
import { Kitchen } from "@/models/Kitchen";
import { DeliveryOrderDetailClient } from "./DeliveryOrderDetailClient";

export default async function DeliveryOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { driverId } = await requireDriverAccess();
  const { id } = await params;
  await connectToDatabase();

  // Ensure Kitchen model is loaded
  Kitchen.modelName;

  const rawOrder = (await Order.findOne({ _id: id, driverId })
    .populate("customer", "name phone")
    .populate("kitchen", "name location address code")
    .lean()) as any;

  if (!rawOrder) {
    return <div className="text-white p-8">Order not found or access denied.</div>;
  }

  const order = JSON.parse(JSON.stringify(rawOrder));

  return <DeliveryOrderDetailClient order={order} driverId={driverId} />;
}
