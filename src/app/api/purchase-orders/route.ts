import { NextResponse } from "next/server";
import { PurchaseService } from "@/services/inventory/PurchaseService";
import { getCurrentUser } from "@/actions/user";
import { connectToDatabase } from "@/database/mongoose";
import { PurchaseOrder } from "@/models/PurchaseOrder";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { supplierId, kitchenId, items } = body;

    if (!supplierId || !kitchenId || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const po = await PurchaseService.createPO(supplierId, kitchenId, items);

    return NextResponse.json({ success: true, po });
  } catch (error: any) {
    console.error("[POST /api/purchase-orders]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "kitchen_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kitchenId = searchParams.get("kitchenId");

    await connectToDatabase();

    let query = {};
    if (kitchenId) query = { kitchenId };

    const pos = await PurchaseOrder.find(query)
      .populate("supplierId", "name")
      .populate("items.ingredientId", "name unit sku")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pos);
  } catch (error: any) {
    console.error("[GET /api/purchase-orders]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
