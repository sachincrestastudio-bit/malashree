import { NextResponse } from "next/server";
import { Invoice } from "@/models/Invoice";
import { connectToDatabase } from "@/database/mongoose";
import { getCurrentUser } from "@/actions/user";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Find invoice by ID or invoiceNumber
    const invoice = await Invoice.findOne({
      $or: [{ _id: params.id }, { invoiceNumber: params.id }],
    })
      .populate("customer", "name email phone")
      .populate("kitchen", "name location")
      .lean();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Security: Only Admin, Kitchen owner, or Customer can view this invoice
    const isCustomer = invoice.customer._id.toString() === user.id;
    const isKitchenOwner =
      user.role === "kitchen_manager" &&
      invoice.kitchen._id.toString() === user.assignedKitchen?.toString();
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isKitchenOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error("[Invoice Fetch]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
