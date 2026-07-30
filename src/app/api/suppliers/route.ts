import { NextResponse } from "next/server";
import { SupplierService } from "@/services/inventory/SupplierService";
import { getCurrentUser } from "@/actions/user";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suppliers = await SupplierService.getAllSuppliers();

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error("[GET /api/suppliers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
