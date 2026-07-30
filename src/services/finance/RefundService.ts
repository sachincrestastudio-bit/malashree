import { connectToDatabase } from "../../database/mongoose";
import { Transaction } from "../../models/Transaction";
import { RazorpayService } from "./RazorpayService";

export class RefundService {
  /**
   * Processes a refund via the payment gateway and updates the local Transaction record.
   */
  static async processRefund(transactionId: string, amount?: number, reason?: string) {
    await connectToDatabase();

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    if (transaction.gateway !== "razorpay") {
      throw new Error("Refunds are only supported for online payment gateways");
    }

    if (transaction.status !== "captured") {
      throw new Error("Cannot refund a transaction that was not captured");
    }

    try {
      const refund: any = await RazorpayService.initiateRefund(transaction.transactionId, amount);

      const newTotalRefunded = transaction.refundAmount + (amount || transaction.amount);
      const isPartial = newTotalRefunded < transaction.amount;

      transaction.refundStatus = "processed";
      transaction.refundAmount = newTotalRefunded;
      transaction.status = isPartial ? "partially_refunded" : "refunded";

      transaction.refundDetails.push({
        refundId: refund.id,
        amount: amount || transaction.amount,
        reason: reason || "Customer requested refund",
      });

      await transaction.save();
      return transaction;
    } catch (error: any) {
      transaction.refundStatus = "failed";
      await transaction.save();
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}
