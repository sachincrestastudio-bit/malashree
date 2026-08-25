"use server";

import { getCurrentUser } from "../user";
import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { redirect } from "next/navigation";

/**
 * Ensures the current user has kitchen access (admin or kitchen_manager).
 * Returns the authenticated user and resolved kitchen ID.
 */
export async function requireKitchenAccess(requestedKitchenId?: string) {
  await connectToDatabase();
  const user = await getCurrentUser();

  if (!user || (user.role !== "kitchen_manager" && user.role !== "admin")) {
    redirect("/login?redirect=/kitchen/menu");
  }

  let kitchenId = requestedKitchenId || user.assignedKitchen?.toString();

  // If admin has no specific kitchen assigned, default to first active kitchen
  if (!kitchenId) {
    const defaultKitchen = (await Kitchen.findOne({ status: "active", deletedAt: null })
      .sort({ name: 1 })
      .lean()) as any;
    if (defaultKitchen) {
      kitchenId = defaultKitchen._id.toString();
    }
  }

  if (!kitchenId) {
    redirect("/login?error=no_kitchen_assigned");
  }

  return {
    ...user,
    kitchenId,
  };
}
