import { NextResponse } from "next/server";
import { PaymentService } from "@/services/finance/PaymentService";
import { StockValidationService } from "@/services/inventory/StockValidationService";
import { getCurrentUser } from "@/actions/user";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { kitchenId, items, deliveryFee, gateway } = body;

    if (!kitchenId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1. Validate Stock before allowing payment order creation
    await StockValidationService.validateOrderStock(kitchenId, items);

    // Backend securely recalculates total and interacts with Gateway
    const paymentOrder = await PaymentService.createPaymentOrder(
      user.id,
      kitchenId,
      items,
      deliveryFee || 0,
      gateway || "razorpay",
    );

    return NextResponse.json(paymentOrder);
  } catch (error: any) {
    console.error("[Payment Create]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
