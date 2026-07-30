import { NextResponse } from "next/server";
import { PurchaseService } from "@/services/inventory/PurchaseService";
import { getCurrentUser } from "@/actions/user";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { poId } = body;

    if (!poId) {
      return NextResponse.json({ error: "Missing poId" }, { status: 400 });
    }

    const po = await PurchaseService.receivePO(poId, user.id);

    return NextResponse.json({ success: true, po });
  } catch (error: any) {
    console.error("[PATCH /api/inventory/receive]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
