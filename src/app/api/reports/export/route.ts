import { NextResponse } from "next/server";
import { ReportingService } from "@/services/admin/ReportingService";
import { getCurrentUser } from "@/actions/user";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "orders";
    const kitchenId = searchParams.get("kitchenId") || undefined;
    const period = (searchParams.get("period") as any) || "all";

    let csv = "";
    let filename = "";

    if (type === "orders") {
      csv = await ReportingService.generateOrdersCSV(kitchenId, period);
      filename = `orders_export_${Date.now()}.csv`;
    } else {
      return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/reports/export]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
