import { connectToDatabase } from "../../database/mongoose";
import { InventoryMovement } from "../../models/InventoryMovement";
import { AnalyticsCoreService } from "./AnalyticsCoreService";

export class InventoryAnalyticsService {
  /**
   * Calculates waste and spoilage metrics.
   */
  static async getWasteMetrics(
    kitchenId?: string,
    period: "today" | "7d" | "30d" | "year" | "all" = "30d",
  ) {
    await connectToDatabase();

    const match = AnalyticsCoreService.buildBaseMatchQuery(kitchenId, period);
    match.type = { $in: ["waste", "spoilage"] };

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$type",
          totalLost: { $sum: { $abs: "$quantityChange" } },
          events: { $sum: 1 },
        },
      },
    ];

    const results = await InventoryMovement.aggregate(pipeline);

    let waste = 0;
    let spoilage = 0;

    for (const res of results) {
      if (res._id === "waste") waste = res.totalLost;
      if (res._id === "spoilage") spoilage = res.totalLost;
    }

    return { waste, spoilage, totalLost: waste + spoilage };
  }
}
