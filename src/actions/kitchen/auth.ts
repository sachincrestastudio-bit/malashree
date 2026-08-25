"use server";

import { getCurrentUser } from "../user";
import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { redirect } from "next/navigation";

/**
 * Ensures the current user has kitchen access (admin or kitchen_manager).
 * Enforces strict multi-tenant isolation: Branch managers cannot access other branches.
 */
export async function requireKitchenAccess(requestedKitchenId?: string) {
  await connectToDatabase();
  const user = await getCurrentUser();

  if (!user || (user.role !== "kitchen_manager" && user.role !== "admin")) {
    redirect("/login?redirect=/kitchen/dashboard");
  }

  let kitchenId: string | null = null;
  const isBranchLocked = user.role === "kitchen_manager";

  // STRICT MULTI-TENANT ISOLATION:
  // Branch managers are strictly locked to their single assigned branch.
  // They CANNOT view any other branch's orders, revenue, or menu.
  if (isBranchLocked) {
    if (!user.assignedKitchen) {
      redirect("/login?error=no_branch_assigned");
    }
    kitchenId = user.assignedKitchen.toString();
  } else {
    // Super Admins have universal visibility across all branches
    if (requestedKitchenId) {
      const isObjectId = requestedKitchenId.match(/^[0-9a-fA-F]{24}$/);
      const matchedKitchen = isObjectId
        ? await Kitchen.findById(requestedKitchenId).lean()
        : await Kitchen.findOne({ code: requestedKitchenId }).lean();
      
      if (matchedKitchen) {
        kitchenId = (matchedKitchen as any)._id.toString();
      }
    }

    if (!kitchenId) {
      kitchenId = user.assignedKitchen?.toString() || null;
    }

    if (!kitchenId) {
      const defaultKitchen = (await Kitchen.findOne({ status: "active", deletedAt: null })
        .sort({ name: 1 })
        .lean()) as any;
      if (defaultKitchen) {
        kitchenId = defaultKitchen._id.toString();
      }
    }
  }

  if (!kitchenId) {
    redirect("/login?error=no_kitchen_assigned");
  }

  return {
    ...user,
    kitchenId,
    isBranchLocked,
  };
}
