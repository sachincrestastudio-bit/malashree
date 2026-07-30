import { NextResponse } from "next/server";
import { RevenueAnalyticsService } from "@/services/admin/RevenueAnalyticsService";
import { CustomerAnalyticsService } from "@/services/admin/CustomerAnalyticsService";
import { getCurrentUser } from "@/actions/user";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kitchenId = searchParams.get("kitchenId") || undefined;
    const period = (searchParams.get("period") as any) || "30d";

    const [revenueMetrics, customerMetrics] = await Promise.all([
      RevenueAnalyticsService.getRevenueKPIs(kitchenId, period),
      CustomerAnalyticsService.getCustomerMetrics(kitchenId, period),
    ]);

    return NextResponse.json({
      ...revenueMetrics,
      ...customerMetrics,
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/dashboard]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
