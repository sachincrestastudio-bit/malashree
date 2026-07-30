"use server";

import { PidgeService } from "@/services/delivery/PidgeService";
import { revalidatePath } from "next/cache";

export async function dispatchOrderToPidgeAction(orderId: string) {
  try {
    const res = await PidgeService.dispatchOrderToPidge(orderId);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/kitchen/order/${orderId}`);
    revalidatePath(`/orders/${orderId}/track`);
    return { success: true, trackingUrl: res.trackingUrl, pidgeOrderId: res.pidgeOrderId };
  } catch (err: any) {
    console.error("dispatchOrderToPidgeAction error:", err);
    return { error: err.message || "Failed to dispatch order to Pidge" };
  }
}
