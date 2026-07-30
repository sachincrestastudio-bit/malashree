"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";
import { DriverProfile } from "@/models/DriverProfile";
import { Kitchen } from "@/models/Kitchen";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne({
      $or: [
        { orderNumber: orderId },
        ...(isObjectId ? [{ _id: orderId }] : []),
      ],
    });

    if (!order) return { error: "Order not found" };

    order.orderStatus = newStatus;

    if (newStatus === "out_for_delivery") {
      order.pickedUpTime = new Date();
    } else if (newStatus === "delivered") {
      order.actualDeliveryTime = new Date();
    }

    order.timeline.push({
      status: newStatus,
      time: new Date(),
      updatedBy: "driver",
      role: "driver",
      remarks: `Order status updated to ${newStatus}`,
    });

    await order.save();

    revalidatePath(`/delivery/order/${orderId}`);
    revalidatePath("/delivery/orders");
    revalidatePath(`/orders/${orderId}/track`);

    return { success: true };
  } catch (err: any) {
    console.error("updateOrderStatus error:", err);
    return { error: "Failed to update order status" };
  }
}

export async function updateDriverGps(driverId: string, lat: number, lng: number) {
  try {
    await connectToDatabase();
    await DriverProfile.findOneAndUpdate(
      { user: driverId },
      {
        "location.lat": lat,
        "location.lng": lng,
        "location.lastUpdated": new Date(),
      },
      { upsert: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error("updateDriverGps error:", err);
    return { error: "Failed to update driver GPS" };
  }
}

export async function getOrderTrackingData(orderId: string) {
  try {
    await connectToDatabase();

    // Ensure models are registered
    Kitchen.modelName;
    DriverProfile.modelName;

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne({
      $or: [
        { orderNumber: orderId },
        ...(isObjectId ? [{ _id: orderId }] : []),
      ],
    })
      .populate("kitchen", "name location code address")
      .populate("driverId", "name phone")
      .lean();

    if (!order) return null;

    let driverProfile = null;
    if (order.driverId) {
      driverProfile = await DriverProfile.findOne({ user: (order.driverId as any)._id }).lean();
    }

    return JSON.parse(
      JSON.stringify({
        order,
        driverProfile,
      })
    );
  } catch (err: any) {
    console.error("getOrderTrackingData error:", err);
    return null;
  }
}
