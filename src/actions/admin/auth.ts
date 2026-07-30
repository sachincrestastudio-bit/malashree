"use server";

import { getCurrentUser } from "../user";
import { AdminAuditLog } from "../../models/AdminAuditLog";
import { connectToDatabase } from "../../database/mongoose";

/**
 * Ensures the current user is an admin.
 * Throws an error if unauthorized.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

/**
 * Logs an administrative action to the immutable AdminAuditLog.
 */
export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string,
  previousValue?: any,
  newValue?: any,
  remarks?: string,
) {
  try {
    const admin = await requireAdmin();
    await connectToDatabase();

    // IP address should ideally be passed from headers, but in server actions it's tricky.
    const ipAddress = "0.0.0.0";

    await AdminAuditLog.create({
      adminId: admin.id,
      action,
      entityType,
      entityId,
      previousValue,
      newValue,
      ipAddress,
      remarks,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // We don't necessarily want to crash the main operation if audit logging fails,
    // but in a strict compliance environment, we might rethrow.
  }
}
