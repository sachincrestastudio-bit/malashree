import { NextResponse } from "next/server";
import { PaymentService } from "@/services/finance/PaymentService";
import { InvoiceService } from "@/services/finance/InvoiceService";
import { InventoryService } from "@/services/inventory/InventoryService";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/actions/user";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // details needed to finalize the Order document
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment signature" }, { status: 400 });
    }

    // 1. Verify Signature cryptographically
    const transaction = await PaymentService.verifyOnlinePayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    // 2. Create the actual Order in the database now that payment is secure
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const order = await Order.create({
      ...orderData,
      orderNumber,
      customer: user.id,
      paymentMethod: "card", // or UPI based on Razorpay response ideally
      paymentStatus: "completed",
      orderStatus: "placed",
    });

    // Link transaction to order
    transaction.order = order._id;
    await transaction.save();

    // 2.5 Reserve Kitchen Stock instantly
    await InventoryService.reserveStock(order);

    // 3. Generate Immutable Invoice
    const invoice = await InvoiceService.generateInvoice(
      order,
      transaction,
      orderData.taxDetails, // Ideally retrieved from backend cache for strict security
      orderData.deliveryFee || 0,
    );

    return NextResponse.json({ success: true, orderId: order._id, invoiceId: invoice._id });
  } catch (error: any) {
    console.error("[Payment Verify]", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
