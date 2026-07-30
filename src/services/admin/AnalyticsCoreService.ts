export class AnalyticsCoreService {
  /**
   * Helper to generate date ranges for MongoDB queries based on standard periods.
   */
  static getDateRange(period: "today" | "7d" | "30d" | "year" | "all") {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "all":
        return {}; // No date filter
      default:
        start.setDate(end.getDate() - 30); // Default to 30 days
    }

    return { $gte: start, $lte: end };
  }

  /**
   * Generates a MongoDB match query respecting date ranges and kitchen filters.
   */
  static buildBaseMatchQuery(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "30d",
    dateField = "createdAt",
  ) {
    const match: any = {};

    if (kitchenId && kitchenId !== "all") {
      match.kitchen = typeof kitchenId === "string" ? kitchenId : kitchenId;
    }

    if (period !== "all") {
      match[dateField] = this.getDateRange(period);
    }

    return match;
  }
}
