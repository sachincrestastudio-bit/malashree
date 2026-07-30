import { NextResponse } from "next/server";
import { MenuAnalyticsService } from "@/services/admin/MenuAnalyticsService";
import { getCurrentUser } from "@/actions/user";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kitchenId = searchParams.get("kitchenId") || undefined;
    const period = (searchParams.get("period") as any) || "30d";

    const menuPerformance = await MenuAnalyticsService.getDishPerformance(kitchenId, period);

    return NextResponse.json(menuPerformance);
  } catch (error: any) {
    console.error("[GET /api/analytics/menu]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
