import { OrderAuditLog } from "../models/OrderAuditLog";

export class TimelineService {
  /**
   * Helper to format a timeline entry for embedding in the Order document.
   */
  static createTimelineEntry(status: string, updatedBy: string, role: string, remarks?: string) {
    return {
      status,
      time: new Date(),
      updatedBy,
      role,
      remarks: remarks || "",
    };
  }

  /**
   * Creates an immutable audit log document in the database.
   * This is separate from the Order's embedded timeline to satisfy the "Never delete logs" rule.
   */
  static async createAuditLog(
    orderId: string,
    action: string,
    oldStatus: string | null,
    newStatus: string | null,
    updatedBy: string,
    role: string,
    ipAddress: string,
    remarks?: string,
  ) {
    const log = new OrderAuditLog({
      order: orderId,
      action,
      oldStatus,
      newStatus,
      updatedBy,
      role,
      ipAddress,
      remarks,
    });
    await log.save();
    return log;
  }
}
