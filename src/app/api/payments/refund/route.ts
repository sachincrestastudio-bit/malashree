import { NextResponse } from "next/server";
import { RefundService } from "@/services/finance/RefundService";
import { getCurrentUser } from "@/actions/user";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { transactionId, amount, reason } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const refund = await RefundService.processRefund(transactionId, amount, reason);

    return NextResponse.json({ success: true, refund });
  } catch (error: any) {
    console.error("[Refund Error]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
