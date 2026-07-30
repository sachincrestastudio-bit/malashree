"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Transaction } from "@/models/Transaction";
import { Kitchen } from "@/models/Kitchen";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import AdminPaymentsClient from "./AdminPaymentsClient";

export default async function AdminPaymentsPage() {
  await connectToDatabase();

  // Touch models for registration
  Kitchen.modelName;
  User.modelName;
  Order.modelName;

  const rawTransactions = await Transaction.find()
    .populate("customer", "name email phone")
    .populate("kitchen", "name code")
    .populate("order", "orderNumber")
    .sort({ createdAt: -1 })
    .lean();

  let totalProcessed = 0;
  let onlineVolume = 0;
  let codVolume = 0;
  let refundedVolume = 0;

  const transactions = rawTransactions.map((t: any) => {
    const amount = t.amount || 0;
    const refAmount = t.refundAmount || 0;
    const isSuccess = t.status === "captured" || t.status === "authorized";

    if (isSuccess) {
      totalProcessed += amount;
      if (t.gateway === "razorpay") {
        onlineVolume += amount;
      } else {
        codVolume += amount;
      }
    }
    refundedVolume += refAmount;

    return {
      id: t._id.toString(),
      transactionId: t.transactionId || t._id.toString(),
      gatewayOrderId: t.gatewayOrderId || "-",
      gateway: t.gateway || "cod",
      customerName: t.customer?.name || "Guest Customer",
      customerEmail: t.customer?.email || "-",
      kitchenName: t.kitchen?.name || "Unknown Kitchen",
      orderNumber: t.order?.orderNumber || "",
      amount,
      currency: t.currency || "INR",
      status: t.status || "pending",
      refundAmount: refAmount,
      refundStatus: t.refundStatus || "none",
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "-",
    };
  });

  const kpis = {
    totalProcessed,
    onlineVolume,
    codVolume,
    refundedVolume,
  };

  return <AdminPaymentsClient transactions={transactions} kpis={kpis} />;
}
