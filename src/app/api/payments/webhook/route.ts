import { NextResponse } from "next/server";
import crypto from "crypto";
import { Transaction } from "@/models/Transaction";
import { connectToDatabase } from "@/database/mongoose";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mockWebhookSecret";

    // Verify webhook signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");

    if (expectedSignature !== signature && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    await connectToDatabase();

    const event = payload.event;
    const payment = payload.payload.payment.entity;

    if (event === "payment.failed") {
      await Transaction.findOneAndUpdate(
        { gatewayOrderId: payment.order_id },
        {
          status: "failed",
          failureReason: payment.error_description,
        },
      );
    } else if (event === "refund.processed") {
      const refund = payload.payload.refund.entity;
      await Transaction.findOneAndUpdate(
        { transactionId: payment.id },
        {
          $set: { refundStatus: "processed" },
          $inc: { refundAmount: refund.amount / 100 },
        },
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Webhook Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
