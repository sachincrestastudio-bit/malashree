import { NextResponse } from "next/server";
import { StockAlertService } from "@/services/inventory/StockAlertService";
import { getCurrentUser } from "@/actions/user";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kitchenId = searchParams.get("kitchenId");

    if (!kitchenId) {
      return NextResponse.json({ error: "kitchenId is required" }, { status: 400 });
    }

    const alerts = await StockAlertService.getAlertsByKitchen(kitchenId);

    return NextResponse.json(alerts);
  } catch (error: any) {
    console.error("[GET /api/inventory/alerts]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
