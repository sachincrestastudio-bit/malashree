"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { revalidatePath } from "next/cache";

export const createKitchen = async (data: {
  name: string;
  code: string;
  address: string;
  latitude: string;
  longitude: string;
  deliveryRadius: string;
  preparationTime: string;
}) => {
  try {
    await connectToDatabase();

    if (!data.name || !data.code) return { error: "Name and branch code are required." };

    const existing = await Kitchen.findOne({ code: data.code.toUpperCase() });
    if (existing) return { error: "A kitchen with this branch code already exists." };

    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    if (isNaN(lat) || isNaN(lng)) return { error: "Please enter valid coordinates." };

    await Kitchen.create({
      name: data.name,
      code: data.code.toUpperCase(),
      address: data.address,
      location: { type: "Point", coordinates: [lng, lat] },
      deliveryRadius: parseInt(data.deliveryRadius) || 5000,
      preparationTime: parseInt(data.preparationTime) || 30,
      status: "active",
    });

    revalidatePath("/admin/kitchens");
    return { success: true };
  } catch (err: any) {
    console.error("createKitchen error:", err);
    return { error: "Failed to create kitchen." };
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
      name: data.name,
      address: data.address,
      deliveryRadius: parseInt(data.deliveryRadius) || 5000,
      preparationTime: parseInt(data.preparationTime) || 30,
      location: { type: "Point", coordinates: [lng, lat] },
    });

    revalidatePath("/admin/kitchens");
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
    return { success: true };
  } catch (err: any) {
    console.error("deleteKitchen error:", err);
    return { error: "Failed to delete kitchen." };
  }
};
