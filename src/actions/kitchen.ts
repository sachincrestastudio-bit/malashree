"use server";

import { cookies } from "next/headers";
import { connectToDatabase } from "../database/mongoose";
import { User } from "../models/User";
import { Kitchen } from "../models/Kitchen";
import { getCurrentUser } from "./user";
import mongoose from "mongoose";

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

    let kitchen = (await Kitchen.findOne({
      $or: [
        { code: new RegExp(`^${branchIdentifier}$`, "i") },
        ...(isObjectId ? [{ _id: branchIdentifier }] : []),
        { name: new RegExp(`^${branchIdentifier}$`, "i") },
      ],
      status: "active",
      deletedAt: null,
    }).lean()) as any;

    if (!kitchen) {
      kitchen = (await Kitchen.findOne({
        $or: [
          { code: new RegExp(`^${branchIdentifier}$`, "i") },
          ...(isObjectId ? [{ _id: branchIdentifier }] : []),
        ],
      }).lean()) as any;
    }

    if (!kitchen) {
      kitchen = (await Kitchen.findOne({ status: "active", deletedAt: null }).sort({ name: 1 }).lean()) as any;
    }

    if (!kitchen) {
      throw new Error(`Invalid kitchen identifier: ${branchIdentifier}`);
    }

    const user = await getCurrentUser();
    if (user) {
      await User.findByIdAndUpdate(user.id, { assignedKitchen: kitchen._id });
    }

    const cookieStore = await cookies();
    cookieStore.set("assigned_kitchen", kitchen._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    cookieStore.set("assigned_branch_code", kitchen.code, {
      httpOnly: false,
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
      kitchenArea: kitchen.area || kitchen.address,
    };
  } catch (error: any) {
    console.error("setAssignedKitchen error:", error);
    return { success: false, error: error.message || "Failed to set assigned kitchen" };
  }
};

/**
 * Automatically locates the nearest active Malashree kitchen from user coordinates,
 * calculates distance & ETA, sets cookies, and returns detailed branch info.
 */
export const findNearestKitchenAndAssign = async (userLat: number, userLng: number) => {
  try {
    await connectToDatabase();

    const kitchens = (await Kitchen.find({ status: "active", deletedAt: null }).lean()) as any[];
    if (!kitchens || kitchens.length === 0) {
      return { success: false, error: "No active kitchens found in database." };
    }

    const kitchensWithDistance = kitchens.map((k) => {
      const kLng = k.location?.coordinates?.[0] || 73.7978;
      const kLat = k.location?.coordinates?.[1] || 18.5989;

      const distKm = calculateDistanceKm(userLat, userLng, kLat, kLng);
      const deliveryRadiusKm = (k.deliveryRadius || 10000) / 1000;
      const isDeliverable = distKm <= deliveryRadiusKm;
      const prepTime = k.preparationTime || 20;
      const etaMin = Math.max(20, Math.round(distKm * 4 + prepTime));

      return {
        id: k._id.toString(),
        name: k.name,
        code: k.code,
        area: k.area || k.address || "Pune",
        address: k.address,
        phone: k.phone,
        latitude: kLat,
        longitude: kLng,
        distanceKm: parseFloat(distKm.toFixed(1)),
        deliveryRadiusKm,
        isDeliverable,
        etaMin,
      };
    });

    // Sort by nearest distance ascending
    kitchensWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    const nearest = kitchensWithDistance[0];

    // Set cookie and user assignment
    await setAssignedKitchen(nearest.id);

    return {
      success: true,
      nearestKitchen: nearest,
      allKitchens: kitchensWithDistance,
    };
  } catch (err: any) {
    console.error("findNearestKitchenAndAssign error:", err);
    return { success: false, error: err.message || "Failed to find nearest kitchen." };
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
 * Retrieves full details of the currently assigned kitchen from MongoDB.
 */
export const getAssignedKitchenDetails = async () => {
  await connectToDatabase();

  const kitchenId = await getAssignedKitchenId();
  if (kitchenId) {
    const isObjectId = mongoose.Types.ObjectId.isValid(kitchenId);
    const kitchen = isObjectId
      ? await Kitchen.findById(kitchenId).lean()
      : await Kitchen.findOne({ code: kitchenId }).lean();
    if (kitchen) return JSON.parse(JSON.stringify(kitchen));
  }

  const defaultKitchen = await Kitchen.findOne({ status: "active", deletedAt: null }).sort({ name: 1 }).lean();
  if (defaultKitchen) return JSON.parse(JSON.stringify(defaultKitchen));

  return null;
};

/**
 * Retrieves all active kitchens from MongoDB database with full metadata.
 */
export const getActiveKitchens = async () => {
  try {
    await connectToDatabase();
    const kitchens = await Kitchen.find({ status: "active", deletedAt: null }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(kitchens));
  } catch (error) {
    console.error("getActiveKitchens error:", error);
    return [];
  }
};
