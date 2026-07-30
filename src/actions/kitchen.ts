"use server";

import { cookies } from "next/headers";
import { connectToDatabase } from "../database/mongoose";
import { User } from "../models/User";
import { Kitchen } from "../models/Kitchen";
import { getCurrentUser } from "./user";
import mongoose from "mongoose";

/**
 * Assigns a kitchen branch by code (e.g. "pimple-saudagar") or MongoDB _id.
 * Updates HTTP cookies, DB user profile (if logged in), and returns branch metadata.
 */
export const setAssignedKitchen = async (branchIdentifier: string) => {
  try {
    await connectToDatabase();

    if (!branchIdentifier) {
      return { success: false, error: "Branch identifier is required" };
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(branchIdentifier);

    // Flexible lookup by code (case-insensitive), ObjectId _id, or name
    let kitchen = (await Kitchen.findOne({
      $or: [
        { code: new RegExp(`^${branchIdentifier}$`, "i") },
        ...(isObjectId ? [{ _id: branchIdentifier }] : []),
        { name: new RegExp(`^${branchIdentifier}$`, "i") },
      ],
      status: "active",
      deletedAt: null,
    }).lean()) as any;

    // Fallback: If not found, try finding any kitchen regardless of status
    if (!kitchen) {
      kitchen = (await Kitchen.findOne({
        $or: [
          { code: new RegExp(`^${branchIdentifier}$`, "i") },
          ...(isObjectId ? [{ _id: branchIdentifier }] : []),
        ],
      }).lean()) as any;
    }

    // Default fallback: get the first active kitchen if identifier didn't match
    if (!kitchen) {
      kitchen = (await Kitchen.findOne({ status: "active", deletedAt: null }).sort({ name: 1 }).lean()) as any;
    }

    if (!kitchen) {
      throw new Error(`Invalid kitchen identifier: ${branchIdentifier}`);
    }

    const user = await getCurrentUser();
    if (user) {
      // Authenticated user: update assigned kitchen in DB
      await User.findByIdAndUpdate(user.id, { assignedKitchen: kitchen._id });
    }

    // Set cookies for fast server action and middleware access
    const cookieStore = await cookies();
    cookieStore.set("assigned_kitchen", kitchen._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    cookieStore.set("assigned_branch_code", kitchen.code, {
      httpOnly: false, // accessible to client JS if needed
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return {
      success: true,
      kitchenId: kitchen._id.toString(),
      branchCode: kitchen.code,
      kitchenName: kitchen.name,
    };
  } catch (error: any) {
    console.error("setAssignedKitchen error:", error);
    return { success: false, error: error.message || "Failed to set assigned kitchen" };
  }
};

/**
 * Returns the assigned kitchen MongoDB _id string from cookies or user profile.
 */
export const getAssignedKitchenId = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const cookieKitchenId = cookieStore.get("assigned_kitchen")?.value;
  if (cookieKitchenId) return cookieKitchenId;

  const user = await getCurrentUser();
  if (user) {
    await connectToDatabase();
    const dbUser = (await User.findById(user.id).select("assignedKitchen").lean()) as any;
    if (dbUser?.assignedKitchen) {
      return dbUser.assignedKitchen.toString();
    }
  }

  return null;
};

/**
 * Retrieves full details of the currently assigned kitchen.
 */
export const getAssignedKitchenDetails = async () => {
  await connectToDatabase();

  const kitchenId = await getAssignedKitchenId();
  if (kitchenId) {
    const kitchen = await Kitchen.findById(kitchenId).lean();
    if (kitchen) return JSON.parse(JSON.stringify(kitchen));
  }

  // Default fallback: return first active kitchen
  const defaultKitchen = await Kitchen.findOne({ status: "active", deletedAt: null }).sort({ name: 1 }).lean();
  if (defaultKitchen) return JSON.parse(JSON.stringify(defaultKitchen));

  return null;
};
