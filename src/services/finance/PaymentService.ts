import { connectToDatabase } from "../../database/mongoose";
import { Transaction } from "../../models/Transaction";
import { RazorpayService } from "./RazorpayService";
import { TaxService } from "./TaxService";

export class PaymentService {
  /**
   * Re-calculates total server-side and creates a Gateway Order.
   * Prevents tampered amounts from the frontend.
   */
  static async createPaymentOrder(
    customerId: string,
    kitchenId: string,
    items: any[],
    deliveryFee: number,
    gateway: "razorpay" | "cod" = "razorpay",
  ) {
    await connectToDatabase();

    // 1. Calculate strictly server-side
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxes = TaxService.calculateGST(subtotal);
    const grandTotal = subtotal + deliveryFee + taxes.totalTax;

    // 2. Create gateway order if online
    let gatewayOrderId = `cod_${Date.now()}`;
    if (gateway === "razorpay") {
      const rzpOrder = await RazorpayService.createOrder(grandTotal, `rcpt_${Date.now()}`);
      gatewayOrderId = rzpOrder.id;
    }

    // 3. Create Pending Transaction
    const transaction = await Transaction.create({
      gateway,
      gatewayOrderId,
      customer: customerId,
      kitchen: kitchenId,
      amount: grandTotal,
      status: gateway === "cod" ? "authorized" : "pending", // COD is authorized by default
    });

    return {
      transactionId: transaction._id,
      gatewayOrderId,
      amount: grandTotal,
      currency: "INR",
      subtotal,
      taxes,
    };
  }

  /**
   * Verifies the cryptographic signature from Razorpay.
   */
  static async verifyOnlinePayment(gatewayOrderId: string, paymentId: string, signature: string) {
    await connectToDatabase();

    const isValid = RazorpayService.verifySignature(gatewayOrderId, paymentId, signature);
    if (!isValid) {
      // Mark transaction as failed
      await Transaction.findOneAndUpdate(
        { gatewayOrderId },
        { status: "failed", failureReason: "Invalid Cryptographic Signature" },
      );
      throw new Error("Payment signature verification failed.");
    }

    const transaction = await Transaction.findOneAndUpdate(
      { gatewayOrderId },
      {
        status: "captured",
        transactionId: paymentId,
      },
      { new: true },
    );

    return transaction;
  }
}
