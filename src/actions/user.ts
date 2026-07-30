"use server";

import { connectToDatabase } from "../database/mongoose";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { getAuthCookie, verifyToken } from "../utils/jwt";

export const getCurrentUser = async () => {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    await connectToDatabase();
    const user = (await User.findById(payload.id).lean()) as any;
    if (!user) {
      console.log("getCurrentUser: No user found in DB for ID:", payload.id);
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "Pimple Saudagar, Pune",
      role: user.role,
      assignedKitchen: user.assignedKitchen ? user.assignedKitchen.toString() : null,
      joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-",
      lastLogin: user.lastLogin,
      loyaltyPoints: user.loyaltyPoints || 0,
    };
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("DYNAMIC_SERVER_USAGE")) {
      return null;
    }
    console.error("getCurrentUser Error:", err);
    return null;
  }
};

export const getUserOrders = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectToDatabase();

    const rawOrders = await Order.find({ customer: user.id, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    return rawOrders.map((o: any) => ({
      id: o.orderNumber || o._id.toString(),
      mongoId: o._id.toString(),
      date: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      dateFormatted: o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "-",
      status: o.orderStatus || "placed",
      paymentStatus: o.paymentStatus || "pending",
      items: (o.items || []).map((i: any) => ({
        dishName: i.dishName || "Dishes",
        qty: i.quantity || 1,
        price: i.price || 0,
      })),
      total: o.grandTotal || 0,
      kitchenName: o.kitchenName || "Malashree Kitchen",
    }));
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("DYNAMIC_SERVER_USAGE")) {
      return [];
    }
    console.error("getUserOrders Error:", err);
    return [];
  }
};
