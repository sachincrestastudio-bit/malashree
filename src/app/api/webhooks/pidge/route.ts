import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pidge sends: id (Pidge order ID), dd_channel.order_id (Malashree order number)
    const pidgeOrderId = body.id || body.order_id || body.pidge_order_id;
    const sourceOrderId = body.dd_channel?.order_id || body.source_order_id || body.reference_id;

    const fulfillment = body.fulfillment || {};
    const status = (fulfillment.status || body.status || "").toUpperCase();
    const riderName = fulfillment.rider?.name || body.rider_name;
    const riderPhone = fulfillment.rider?.mobile || body.rider_phone;
    const trackCode = fulfillment.track_code;

    if (!pidgeOrderId && !sourceOrderId) {
      return NextResponse.json({ error: "Missing order identifier in webhook" }, { status: 400 });
    }

    await connectToDatabase();

    // Query by pidgeOrderId or sourceOrderId (orderNumber)
    let order = null;
    if (pidgeOrderId) {
      order = await Order.findOne({ pidgeOrderId });
    }
    if (!order && sourceOrderId) {
      order = await Order.findOne({ orderNumber: sourceOrderId });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Pidge fulfillment status to Malashree orderStatus
    let newOrderStatus = order.orderStatus;
    if (status === "OUT_FOR_DELIVERY" || status === "PICKED_UP" || status === "REACHED_DELIVERY") {
      newOrderStatus = "out_for_delivery";
      if (!order.pickedUpTime) order.pickedUpTime = new Date();
    } else if (status === "DELIVERED") {
      newOrderStatus = "delivered";
      order.actualDeliveryTime = new Date();
    } else if (status === "CANCELLED" || status === "DISPOSED" || status === "LOST") {
      newOrderStatus = "cancelled";
    }

    order.pidgeStatus = status || order.pidgeStatus;
    if (pidgeOrderId && !order.pidgeOrderId) order.pidgeOrderId = pidgeOrderId;
    if (riderName) order.pidgeRiderName = riderName;
    if (riderPhone) order.pidgeRiderPhone = riderPhone;

    if (trackCode && (!order.pidgeTrackingUrl || !order.pidgeTrackingUrl.includes(trackCode))) {
      const isDev = (process.env.PIDGE_API_URL || "").includes(".dev.");
      const baseTrack = isDev ? "https://trace.dev.pidge.in" : "https://trace.pidge.in";
      order.pidgeTrackingUrl = `${baseTrack}/?code=${trackCode}`;
    }

    order.orderStatus = newOrderStatus;

    order.timeline.push({
      status: newOrderStatus,
      time: new Date(),
      updatedBy: "Pidge Webhook",
      role: "system",
      remarks: `Pidge status update: ${status}${riderName ? ` (Rider: ${riderName})` : ""}`,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      pidgeOrderId: order.pidgeOrderId,
      status: newOrderStatus,
    });
  } catch (err: any) {
    console.error("Pidge webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
