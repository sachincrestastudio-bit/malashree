"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Complaint } from "@/models/Complaint";
import AdminComplaintsClient from "./AdminComplaintsClient";

export default async function AdminComplaintsPage() {
  await connectToDatabase();

  const rawComplaints = await Complaint.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();

  const complaints = rawComplaints.map((c: any) => ({
    id: c._id.toString(),
    ticketId: c.ticketId,
    orderId: c.orderId || "",
    customerName: c.customerName,
    customerEmail: c.customerEmail,
    customerPhone: c.customerPhone,
    category: c.category,
    subject: c.subject,
    description: c.description,
    status: c.status || "pending",
    resolutionNotes: c.resolutionNotes || "",
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString("en-IN") : "-",
  }));

  return <AdminComplaintsClient complaints={complaints} />;
}
