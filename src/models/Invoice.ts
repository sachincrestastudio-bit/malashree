import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const InvoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },

    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kitchen: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },

    // Snapshot of what was ordered (immutable)
    itemsSnapshot: [
      {
        dishName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        cgstAmount: { type: Number, default: 0 },
        sgstAmount: { type: Number, default: 0 },
      },
    ],

    // Financial breakdown
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    taxDetails: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },
    totalTax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Payment linking
    paymentStatus: { type: String, enum: ["paid", "unpaid", "refunded"], required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" }, // If online payment

    // Address snapshots for invoice generation
    customerAddress: { type: Schema.Types.Mixed },
    kitchenAddress: { type: Schema.Types.Mixed },
    kitchenGstNumber: { type: String },
  },
  { timestamps: true },
);

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ order: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ kitchen: 1 });
InvoiceSchema.index({ createdAt: -1 });

export const Invoice = models.Invoice || model("Invoice", InvoiceSchema);
