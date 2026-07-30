"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Transaction } from "@/models/Transaction";
import { Order } from "@/models/Order";
import { Kitchen } from "@/models/Kitchen";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

export const processRefund = async (
  transactionId: string,
  data: {
    amount: number;
    reason: string;
  }
) => {
  try {
    await connectToDatabase();

    if (!data.amount || data.amount <= 0) {
      return { error: "Please enter a valid refund amount." };
    }
    if (!data.reason || !data.reason.trim()) {
      return { error: "Refund reason is required." };
    }

    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return { error: "Transaction not found." };
    }

    const currentRefunded = tx.refundAmount || 0;
    const newTotalRefund = currentRefunded + Number(data.amount);

    if (newTotalRefund > tx.amount) {
      return { error: `Refund amount cannot exceed total transaction amount of ₹${tx.amount}.` };
    }

    const nextStatus = newTotalRefund === tx.amount ? "refunded" : "partially_refunded";

    const refundEntry = {
      refundId: `rfnd_${Date.now()}`,
      amount: Number(data.amount),
      reason: data.reason.trim(),
      createdAt: new Date(),
    };

    await Transaction.findByIdAndUpdate(transactionId, {
      status: nextStatus,
      refundStatus: "processed",
      refundAmount: newTotalRefund,
      $push: { refundDetails: refundEntry },
    });

    // If order is linked, update order payment details
    if (tx.order) {
      await Order.findByIdAndUpdate(tx.order, {
        paymentStatus: nextStatus,
      });
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/orders");
    return { success: true, refundId: refundEntry.refundId };
  } catch (err: any) {
    console.error("processRefund error:", err);
    return { error: err.message || "Failed to process refund." };
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: "pending" | "authorized" | "captured" | "failed" | "cancelled" | "refunded"
) => {
  try {
    await connectToDatabase();

    await Transaction.findByIdAndUpdate(transactionId, { status });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err: any) {
    console.error("updateTransactionStatus error:", err);
    return { error: "Failed to update transaction status." };
  }
};
