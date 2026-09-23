"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { MenuItem } from "@/models/MenuItem";
import { User } from "@/models/User";
import { getCurrentUser } from "./user";
import { hashPassword } from "@/utils/password";
import { revalidatePath } from "next/cache";

export const createKitchen = async (data: {
  name: string;
  code: string;
  address: string;
  area?: string;
  latitude: string;
  longitude: string;
  deliveryRadius: string;
  preparationTime: string;
}) => {
  try {
    await connectToDatabase();

    if (!data.name || !data.code) return { error: "Name and branch code are required." };

    const formattedCode = data.code.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = await Kitchen.findOne({
      $or: [
        { code: new RegExp(`^${formattedCode}$`, "i") },
        { name: new RegExp(`^${data.name.trim()}$`, "i") },
      ],
      deletedAt: null,
    });
    if (existing) return { error: "A kitchen with this branch code or name already exists." };

    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    if (isNaN(lat) || isNaN(lng)) return { error: "Please enter valid GPS coordinates." };

    const areaName = data.area || data.address || data.name;

    const newKitchen = await Kitchen.create({
      name: data.name.trim(),
      code: formattedCode,
      address: data.address.trim(),
      area: areaName.trim(),
      location: { type: "Point", coordinates: [lng, lat] },
      deliveryRadius: parseInt(data.deliveryRadius) || 10000,
      preparationTime: parseInt(data.preparationTime) || 25,
      status: "active",
    });

    // Automatically enable all Universal Master Dishes for this new branch
    const masterDishes = await MenuItem.find({ isGlobalMaster: true, deletedAt: null });
    for (const dish of masterDishes) {
      if (!dish.branchPricing) dish.branchPricing = [];
      const alreadyExists = dish.branchPricing.some(
        (bp: any) => bp.kitchenId?.toString() === newKitchen._id.toString()
      );
      if (!alreadyExists) {
        dish.branchPricing.push({
          kitchenId: newKitchen._id,
          price: dish.price,
          isEnabled: true,
          isAvailable: true,
        });
        await dish.save();
      }
    }

    revalidatePath("/admin/kitchens");
    revalidatePath("/kitchen/dashboard");
    revalidatePath("/branches");
    revalidatePath("/admin/menu");
    revalidatePath("/menu");

    return {
      success: true,
      kitchenId: newKitchen._id.toString(),
      kitchenName: newKitchen.name,
      code: newKitchen.code,
    };
  } catch (err: any) {
    console.error("createKitchen error:", err);
    return { error: err.message || "Failed to create kitchen." };
  }
};

export const updateKitchenStatus = async (
  id: string,
  status: "active" | "inactive" | "maintenance"
) => {
  try {
    await connectToDatabase();
    await Kitchen.findByIdAndUpdate(id, { status });
    revalidatePath("/admin/kitchens");
    revalidatePath("/kitchen/dashboard");
    revalidatePath("/branches");
    return { success: true };
  } catch (err: any) {
    console.error("updateKitchenStatus error:", err);
    return { error: "Failed to update status." };
  }
};

export const updateKitchen = async (
  id: string,
  data: {
    name: string;
    address: string;
    area?: string;
    deliveryRadius: string;
    preparationTime: string;
    latitude: string;
    longitude: string;
  }
) => {
  try {
    await connectToDatabase();

    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    if (isNaN(lat) || isNaN(lng)) return { error: "Please enter valid coordinates." };

    await Kitchen.findByIdAndUpdate(id, {
      name: data.name.trim(),
      address: data.address.trim(),
      area: data.area ? data.area.trim() : undefined,
      deliveryRadius: parseInt(data.deliveryRadius) || 10000,
      preparationTime: parseInt(data.preparationTime) || 25,
      location: { type: "Point", coordinates: [lng, lat] },
    });

    revalidatePath("/admin/kitchens");
    revalidatePath("/kitchen/dashboard");
    revalidatePath("/branches");
    return { success: true };
  } catch (err: any) {
    console.error("updateKitchen error:", err);
    return { error: "Failed to update kitchen." };
  }
};

export const deleteKitchen = async (id: string) => {
  try {
    await connectToDatabase();
    await Kitchen.findByIdAndUpdate(id, { deletedAt: new Date(), status: "inactive" });
    revalidatePath("/admin/kitchens");
    revalidatePath("/kitchen/dashboard");
    revalidatePath("/branches");
    return { success: true };
  } catch (err: any) {
    console.error("deleteKitchen error:", err);
    return { error: "Failed to delete kitchen." };
  }
};

/**
 * Sets or updates the login credentials (email and password) for a branch's dedicated dashboard.
 */
export const setBranchCredentials = async (
  kitchenId: string,
  data: {
    email: string;
    password?: string;
    name?: string;
    phone?: string;
  }
) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { error: "Unauthorized: Super Admin access required." };
    }

    if (!kitchenId) {
      return { error: "Kitchen ID is required." };
    }

    const cleanEmail = (data.email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { error: "Please provide a valid email address." };
    }

    await connectToDatabase();

    const kitchen = await Kitchen.findById(kitchenId);
    if (!kitchen) {
      return { error: "Kitchen branch not found." };
    }

    // Find any existing manager assigned to this branch
    let manager = await User.findOne({
      $or: [
        { _id: kitchen.manager },
        { assignedKitchen: kitchen._id, role: "kitchen_manager" },
      ],
      deletedAt: null,
    });

    // Check if another account already has this email
    const emailConflict = await User.findOne({
      email: cleanEmail,
      _id: { $ne: manager?._id },
    }).lean();

    if (emailConflict) {
      return { error: `The email address '${cleanEmail}' is already registered to another account.` };
    }

    if (manager) {
      // Update existing manager
      manager.email = cleanEmail;
      if (data.name?.trim()) manager.name = data.name.trim();
      if (data.phone !== undefined) manager.phone = data.phone.trim();
      if (data.password && data.password.trim()) {
        if (data.password.length < 6) {
          return { error: "Password must be at least 6 characters long." };
        }
        manager.passwordHash = await hashPassword(data.password.trim());
      }
      manager.assignedKitchen = kitchen._id;
      manager.role = "kitchen_manager";
      await manager.save();

      kitchen.manager = manager._id;
      await kitchen.save();
    } else {
      // Creating new manager credentials
      if (!data.password || data.password.trim().length < 6) {
        return { error: "Password is required and must be at least 6 characters long." };
      }

      const passwordHash = await hashPassword(data.password.trim());
      const newManager = await User.create({
        name: data.name?.trim() || `${kitchen.name} Manager`,
        email: cleanEmail,
        phone: data.phone?.trim() || "",
        passwordHash,
        role: "kitchen_manager",
        assignedKitchen: kitchen._id,
      });

      kitchen.manager = newManager._id;
      await kitchen.save();
      manager = newManager;
    }

    revalidatePath("/admin/kitchens");
    revalidatePath("/admin/managers");
    revalidatePath("/kitchen/dashboard");

    return {
      success: true,
      managerId: manager._id.toString(),
      email: manager.email,
      name: manager.name,
    };
  } catch (err: any) {
    console.error("setBranchCredentials error:", err);
    return { error: err.message || "Failed to set branch credentials." };
  }
};
