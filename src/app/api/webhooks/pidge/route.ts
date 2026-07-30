import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const pidgeOrderId = body.order_id || body.pidge_order_id;
    const status = body.status; // e.g. RIDER_ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    const riderName = body.rider_name;
    const riderPhone = body.rider_phone;

    if (!pidgeOrderId) {
      return NextResponse.json({ error: "Missing pidge_order_id" }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({ pidgeOrderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Pidge status to Malashree orderStatus
    let newOrderStatus = order.orderStatus;
    if (status === "OUT_FOR_DELIVERY" || status === "PICKED_UP") {
      newOrderStatus = "out_for_delivery";
      order.pickedUpTime = new Date();
    } else if (status === "DELIVERED") {
      newOrderStatus = "delivered";
      order.actualDeliveryTime = new Date();
    } else if (status === "CANCELLED") {
      newOrderStatus = "cancelled";
    }

    order.pidgeStatus = status;
    if (riderName) order.pidgeRiderName = riderName;
    if (riderPhone) order.pidgeRiderPhone = riderPhone;
    order.orderStatus = newOrderStatus;

    order.timeline.push({
      status: newOrderStatus,
      time: new Date(),
      updatedBy: "Pidge Webhook",
      role: "system",
      remarks: `Pidge delivery status updated to ${status}`,
    });

    await order.save();

    return NextResponse.json({ success: true, orderId: order._id, status: newOrderStatus });
  } catch (err: any) {
    console.error("Pidge webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
