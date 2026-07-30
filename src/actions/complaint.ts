"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Complaint } from "@/models/Complaint";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

export const submitComplaint = async (data: {
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  category: "food_quality" | "late_delivery" | "missing_item" | "wrong_item" | "payment_issue" | "other";
  subject: string;
  description: string;
}) => {
  try {
    await connectToDatabase();

    if (!data.customerName || !data.customerName.trim()) {
      return { error: "Your name is required." };
    }
    if (!data.customerEmail || !data.customerEmail.trim()) {
      return { error: "Email address is required." };
    }
    if (!data.customerPhone || !data.customerPhone.trim()) {
      return { error: "Phone number is required." };
    }
    if (!data.subject || !data.subject.trim()) {
      return { error: "Subject is required." };
    }
    if (!data.description || !data.description.trim()) {
      return { error: "Please describe your complaint or issue." };
    }

    const user = await getCurrentUser();
    const ticketId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;

    const complaint = await Complaint.create({
      ticketId,
      orderId: data.orderId?.trim() || undefined,
      userId: user?.id || undefined,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone.trim(),
      category: data.category || "other",
      subject: data.subject.trim(),
      description: data.description.trim(),
      status: "pending",
    });

    try {
      revalidatePath("/complaints");
      revalidatePath("/admin/complaints");
    } catch (e) {}

    return {
      success: true,
      ticketId: complaint.ticketId,
    };
  } catch (err: any) {
    console.error("submitComplaint error:", err);
    return { error: err.message || "Failed to submit complaint." };
  }
};

export const getUserComplaints = async () => {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    if (!user) return [];

    const complaints = await Complaint.find({
      $or: [{ userId: user.id }, { customerEmail: user.email.toLowerCase() }],
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(complaints));
  } catch (err) {
    console.error("getUserComplaints error:", err);
    return [];
  }
};

export const updateComplaintStatus = async (
  id: string,
  data: {
    status: "pending" | "in_progress" | "resolved" | "dismissed";
    resolutionNotes?: string;
  }
) => {
  try {
    await connectToDatabase();

    const updatePayload: any = {
      status: data.status,
      resolutionNotes: data.resolutionNotes?.trim() || "",
    };

    if (data.status === "resolved" || data.status === "dismissed") {
      updatePayload.resolvedAt = new Date();
    }

    await Complaint.findByIdAndUpdate(id, updatePayload);

    try {
      revalidatePath("/admin/complaints");
      revalidatePath("/complaints");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("updateComplaintStatus error:", err);
    return { error: "Failed to update complaint status." };
  }
};
