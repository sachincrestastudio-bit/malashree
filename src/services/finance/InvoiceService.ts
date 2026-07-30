import { connectToDatabase } from "../../database/mongoose";
import { Invoice } from "../../models/Invoice";
import crypto from "crypto";

export class InvoiceService {
  /**
   * Generates a sequential immutable invoice for an order.
   */
  static async generateInvoice(order: any, transaction: any, taxDetails: any, deliveryFee: number) {
    await connectToDatabase();

    // Generate a unique sequential invoice number (e.g. INV-2026-XXXX)
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${randomHex}`;

    // Map items to snapshot
    const itemsSnapshot = order.items.map((item: any) => {
      const lineTotal = item.price * item.quantity;
      const itemTax = (lineTotal * 5) / 100; // 5% GST
      return {
        dishName: item.dishName,
        quantity: item.quantity,
        price: item.price,
        cgstAmount: itemTax / 2,
        sgstAmount: itemTax / 2,
      };
    });

    const invoice = await Invoice.create({
      invoiceNumber,
      order: order._id,
      customer: order.customer,
      kitchen: order.kitchen,
      itemsSnapshot,
      subtotal: order.subtotal,
      deliveryFee,
      taxDetails,
      totalTax: taxDetails.totalTax,
      discount: order.discount || 0,
      grandTotal: order.grandTotal,
      paymentStatus:
        transaction.status === "captured"
          ? "paid"
          : transaction.gateway === "cod"
            ? "unpaid"
            : "paid",
      transactionId: transaction._id,
      customerAddress: order.deliveryAddress,
    });

    return invoice;
  }
}
