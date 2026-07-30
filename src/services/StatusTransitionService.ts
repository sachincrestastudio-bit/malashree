export class StatusTransitionService {
  /**
   * The strict, forward-only valid transitions for an order.
   * Key: Current Status, Values: Allowed Next Statuses
   */
  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    placed: ["accepted", "cancelled"],
    accepted: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["out_for_delivery", "delivered"], // Depending on if it's pickup or delivery
    out_for_delivery: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  /**
   * Validates if moving from oldStatus to newStatus is allowed.
   */
  static validateTransition(oldStatus: string, newStatus: string, role: string): boolean {
    if (oldStatus === newStatus) return true; // No-op

    // Admins might have override powers later, but for now we enforce strictly
    const allowedNext = this.VALID_TRANSITIONS[oldStatus] || [];

    // Cancellation rules
    if (newStatus === "cancelled") {
      if (["placed", "accepted", "preparing"].includes(oldStatus)) {
        return true;
      }
      if (["ready", "out_for_delivery", "delivered"].includes(oldStatus)) {
        // Only admin/system can cancel after it's ready, but for now reject
        if (role !== "admin" && role !== "system") {
          return false;
        }
        return true; // if admin, allow
      }
    }

    return allowedNext.includes(newStatus);
  }
}
