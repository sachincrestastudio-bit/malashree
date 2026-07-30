import { Schema, model, models } from "mongoose";

const ComplaintSchema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    orderId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    category: {
      type: String,
      enum: ["food_quality", "late_delivery", "missing_item", "wrong_item", "payment_issue", "other"],
      required: true,
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "dismissed"],
      default: "pending",
    },
    resolutionNotes: { type: String, default: "" },
    resolvedAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Complaint = models.Complaint || model("Complaint", ComplaintSchema);
