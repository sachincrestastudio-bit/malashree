"use server";

import { connectToDatabase } from "@/database/mongoose";
import { User } from "@/models/User";
import { Kitchen } from "@/models/Kitchen";
import { getCurrentUser } from "./user";
import { hashPassword } from "@/utils/password";
import { revalidatePath } from "next/cache";

/**
 * Ensures the requester is a Super Admin.
 */
async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Super Admin privileges required.");
  }
  return user;
}

/**
 * Retrieves all branch managers with populated kitchen details.
 */
export async function getBranchManagers() {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    const rawManagers = await User.find({ role: "kitchen_manager", deletedAt: null })
      .populate("assignedKitchen", "name code address area")
      .sort({ createdAt: -1 })
      .lean();

    return rawManagers.map((m: any) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      phone: m.phone || "-",
      branchId: m.assignedKitchen?._id ? m.assignedKitchen._id.toString() : (m.assignedKitchen?.toString() || ""),
      branchName: m.assignedKitchen?.name || "Unassigned Branch",
      branchCode: m.assignedKitchen?.code || "",
      branchArea: m.assignedKitchen?.area || m.assignedKitchen?.address || "Pune",
      createdAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "-",
      lastLogin: m.lastLogin ? new Date(m.lastLogin).toLocaleDateString("en-IN") : "Never",
    }));
  } catch (err: any) {
    console.error("getBranchManagers Error:", err);
    return [];
  }
}

/**
 * Creates a new branch manager account strictly tied to a designated cloud kitchen.
 */
export async function createBranchManager(formData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  branchId: string;
}) {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    if (!formData.name?.trim()) {
      return { error: "Manager full name is required." };
    }
    if (!formData.email?.trim()) {
      return { error: "Manager email address is required." };
    }
    if (!formData.password || formData.password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }
    if (!formData.branchId) {
      return { error: "Please select an assigned branch for this manager." };
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    const existing = await User.findOne({ email: cleanEmail }).lean();
    if (existing) {
      return { error: `An account with email '${cleanEmail}' already exists.` };
    }

    const kitchen = await Kitchen.findById(formData.branchId).lean();
    if (!kitchen) {
      return { error: "Selected branch does not exist." };
    }

    const passwordHash = await hashPassword(formData.password);

    const newManager = await User.create({
      name: formData.name.trim(),
      email: cleanEmail,
      phone: formData.phone?.trim() || "",
      passwordHash,
      role: "kitchen_manager",
      assignedKitchen: formData.branchId,
    });

    // Update Kitchen model manager reference
    await Kitchen.findByIdAndUpdate(formData.branchId, { manager: newManager._id }).exec();

    try {
      revalidatePath("/admin/managers");
      revalidatePath("/admin/kitchens");
    } catch (e) {}

    return { success: true, managerId: newManager._id.toString() };
  } catch (err: any) {
    console.error("createBranchManager Error:", err);
    return { error: err.message || "Failed to create branch manager." };
  }
}

/**
 * Updates a branch manager's profile or reassigns them to a different branch.
 */
export async function updateBranchManager(
  id: string,
  formData: {
    name?: string;
    phone?: string;
    branchId?: string;
  }
) {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    const manager = await User.findById(id);
    if (!manager || manager.role !== "kitchen_manager") {
      return { error: "Branch manager not found." };
    }

    if (formData.name?.trim()) manager.name = formData.name.trim();
    if (formData.phone !== undefined) manager.phone = formData.phone.trim();
    if (formData.branchId) {
      const kitchen = await Kitchen.findById(formData.branchId).lean();
      if (!kitchen) {
        return { error: "Selected branch does not exist." };
      }
      manager.assignedKitchen = formData.branchId as any;
      await Kitchen.findByIdAndUpdate(formData.branchId, { manager: manager._id }).exec();
    }

    await manager.save();

    try {
      revalidatePath("/admin/managers");
      revalidatePath("/admin/kitchens");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("updateBranchManager Error:", err);
    return { error: err.message || "Failed to update branch manager." };
  }
}

/**
 * Resets a branch manager's login password.
 */
export async function resetBranchManagerPassword(id: string, newPassword: string) {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    if (!newPassword || newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const manager = await User.findById(id);
    if (!manager || manager.role !== "kitchen_manager") {
      return { error: "Branch manager not found." };
    }

    const passwordHash = await hashPassword(newPassword);
    manager.passwordHash = passwordHash;
    await manager.save();

    try {
      revalidatePath("/admin/managers");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("resetBranchManagerPassword Error:", err);
    return { error: err.message || "Failed to reset password." };
  }
}

/**
 * Deletes / Revokes a branch manager's credentials.
 */
export async function deleteBranchManager(id: string) {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    const manager = await User.findById(id);
    if (!manager || manager.role !== "kitchen_manager") {
      return { error: "Branch manager not found." };
    }

    await User.findByIdAndDelete(id);

    try {
      revalidatePath("/admin/managers");
      revalidatePath("/admin/kitchens");
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.error("deleteBranchManager Error:", err);
    return { error: err.message || "Failed to delete branch manager." };
  }
}
