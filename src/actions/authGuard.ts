/**
 * Server-side auth guard utilities for Server Actions.
 * Import requireAdmin() / requireKitchenManager() at the top of any
 * sensitive server action to enforce role-based access control.
 */
"use server";

import { getAuthCookie, verifyToken } from "@/utils/jwt";
import { connectToDatabase } from "@/database/mongoose";
import { User } from "@/models/User";

/** Throws if the caller is not an authenticated admin. */
export async function requireAdmin(): Promise<{ id: string; role: string; email: string }> {
  const token = await getAuthCookie();
  if (!token) throw new Error("Unauthorized: not authenticated");

  const payload = await verifyToken(token);
  if (!payload || !payload.id) throw new Error("Unauthorized: invalid token");

  await connectToDatabase();
  const user = await User.findById(payload.id).select("role email").lean() as any;
  if (!user) throw new Error("Unauthorized: user not found");
  if (user.role !== "admin") throw new Error("Forbidden: admin access required");

  return { id: payload.id, role: user.role, email: user.email };
}

/** Throws if the caller is not a kitchen_manager or admin. */
export async function requireKitchenManagerOrAdmin(): Promise<{
  id: string;
  role: string;
  assignedKitchen: string | null;
}> {
  const token = await getAuthCookie();
  if (!token) throw new Error("Unauthorized: not authenticated");

  const payload = await verifyToken(token);
  if (!payload || !payload.id) throw new Error("Unauthorized: invalid token");

  await connectToDatabase();
  const user = await User.findById(payload.id).select("role assignedKitchen").lean() as any;
  if (!user) throw new Error("Unauthorized: user not found");
  if (user.role !== "kitchen_manager" && user.role !== "admin") {
    throw new Error("Forbidden: kitchen manager or admin access required");
  }

  return {
    id: payload.id,
    role: user.role,
    assignedKitchen: user.assignedKitchen?.toString() || null,
  };
}
