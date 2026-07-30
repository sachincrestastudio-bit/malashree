import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/mongoose";
import { Ingredient } from "@/models/Ingredient";
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

    await connectToDatabase();

    // In production, we'd ensure kitchen managers can only see their own kitchen's inventory
    const inventory = await Ingredient.find({ kitchenId }).populate("supplierId", "name").lean();

    return NextResponse.json(inventory);
  } catch (error: any) {
    console.error("[GET /api/inventory]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
