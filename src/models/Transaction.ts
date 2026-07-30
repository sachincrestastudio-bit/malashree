import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const TransactionSchema = new Schema(
  {
    transactionId: { type: String, unique: true, sparse: true }, // Gateway's actual transaction ID (e.g. pay_234)
    gateway: { type: String, enum: ["razorpay", "cod", "stripe", "phonepe"], required: true },
    gatewayOrderId: { type: String, unique: true, sparse: true }, // Gateway's order ID (e.g. order_123)

    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" }, // Linked after verification
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: [
        "pending",
        "authorized",
        "captured",
        "failed",
        "cancelled",
        "refund_pending",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },

    failureReason: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed }, // Raw JSON from webhook/verify

    // Refund Tracking
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    refundAmount: { type: Number, default: 0 },
    refundDetails: [
      {
        refundId: String,
        amount: Number,
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

TransactionSchema.index({ customer: 1 });
TransactionSchema.index({ kitchen: 1 });
TransactionSchema.index({ gatewayOrderId: 1 });
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ status: 1 });

export const Transaction = models.Transaction || model("Transaction", TransactionSchema);
