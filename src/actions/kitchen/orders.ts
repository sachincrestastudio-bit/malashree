"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { requireKitchenAccess } from "./auth";
import { revalidatePath } from "next/cache";

export async function updateKitchenOrderStatus(orderId: string, newStatus: string) {
  try {
    const user = await requireKitchenAccess();
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return { error: "Order not found." };
    }

    // Role check: kitchen_manager can only update orders for their assigned kitchen
    if (
      user.role === "kitchen_manager" &&
      user.assignedKitchen &&
      order.kitchen?.toString() !== user.assignedKitchen.toString()
    ) {
      return { error: "Unauthorized: This order belongs to a different kitchen." };
    }

    order.orderStatus = newStatus;
    if (newStatus === "preparing") {
      order.actualReadyTime = new Date(Date.now() + 15 * 60000);
    } else if (newStatus === "ready") {
      order.actualReadyTime = new Date();
    }

    if (!order.timeline) {
      order.timeline = [];
    }

    order.timeline.push({
      status: newStatus,
      time: new Date(),
      updatedBy: user.id,
      role: "kitchen",
      remarks: `Kitchen status updated to ${newStatus}`,
    });

    await order.save();

    try {
      revalidatePath("/kitchen/orders");
      revalidatePath("/kitchen/dashboard");
      revalidatePath(`/kitchen/order/${orderId}`);
      revalidatePath(`/orders/${order.orderNumber}/track`);
      revalidatePath("/admin");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("updateKitchenOrderStatus Error:", err);
    return { error: err.message || "Failed to update order status." };
  }
}

export async function toggleDishStock(dishId: string, isAvailable: boolean) {
  try {
    const user = await requireKitchenAccess();
    await connectToDatabase();

    const dish = await MenuItem.findById(dishId);
    if (!dish) {
      return { error: "Dish not found." };
    }

    dish.isAvailable = isAvailable;
    await dish.save();

    try {
      revalidatePath("/kitchen/menu");
      revalidatePath("/menu");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("toggleDishStock Error:", err);
    return { error: err.message || "Failed to toggle stock status." };
  }
}
