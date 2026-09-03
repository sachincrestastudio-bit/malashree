import { NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory/InventoryService";
import { getCurrentUser } from "@/actions/user";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ingredientId, kitchenId, quantityChange, type, reason } = body;

    if (!ingredientId || !kitchenId || quantityChange === undefined || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (["purchase", "consumption"].includes(type)) {
      return NextResponse.json(
        { error: "Cannot manually simulate purchase or consumption here." },
        { status: 400 },
      );
    }

    const ingredient = await InventoryService.adjustStock(
      ingredientId,
      kitchenId,
      quantityChange,
      type,
      user.id,
      reason,
    );

    return NextResponse.json({ success: true, ingredient });
  } catch (error: any) {
    console.error("[POST /api/inventory/adjust]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
