"use server";

import { connectToDatabase } from "@/database/mongoose";
import { KitchenOffer } from "@/models/KitchenOffer";
import { Kitchen } from "@/models/Kitchen";
import { revalidatePath } from "next/cache";

export const createOffer = async (data: {
  kitchenId: string;
  code: string;
  title: string;
  sub?: string;
  active?: boolean;
}) => {
  try {
    await connectToDatabase();

    if (!data.title || !data.title.trim()) {
      return { error: "Offer title is required." };
    }
    if (!data.code || !data.code.trim()) {
      return { error: "Promo code / badge text is required." };
    }
    if (!data.kitchenId) {
      return { error: "Kitchen branch is required." };
    }

    const kitchen = await Kitchen.findById(data.kitchenId);
    if (!kitchen) {
      return { error: "Selected kitchen branch not found." };
    }

    await KitchenOffer.create({
      kitchenId: data.kitchenId,
      code: data.code.trim().toUpperCase(),
      title: data.title.trim(),
      sub: data.sub?.trim() || "",
      active: data.active !== undefined ? data.active : true,
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("createOffer error:", err);
    return { error: "Failed to create offer." };
  }
};

export const updateOffer = async (
  id: string,
  data: {
    kitchenId: string;
    code: string;
    title: string;
    sub?: string;
    active?: boolean;
  }
) => {
  try {
    await connectToDatabase();

    if (!data.title || !data.title.trim()) {
      return { error: "Offer title is required." };
    }
    if (!data.code || !data.code.trim()) {
      return { error: "Promo code / badge text is required." };
    }
    if (!data.kitchenId) {
      return { error: "Kitchen branch is required." };
    }

    await KitchenOffer.findByIdAndUpdate(id, {
      kitchenId: data.kitchenId,
      code: data.code.trim().toUpperCase(),
      title: data.title.trim(),
      sub: data.sub?.trim() || "",
      active: data.active !== undefined ? data.active : true,
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("updateOffer error:", err);
    return { error: "Failed to update offer." };
  }
};

export const toggleOfferStatus = async (id: string, active: boolean) => {
  try {
    await connectToDatabase();
    await KitchenOffer.findByIdAndUpdate(id, { active });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("toggleOfferStatus error:", err);
    return { error: "Failed to toggle offer status." };
  }
};

export const deleteOffer = async (id: string) => {
  try {
    await connectToDatabase();
    await KitchenOffer.findByIdAndUpdate(id, { deletedAt: new Date(), active: false });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("deleteOffer error:", err);
    return { error: "Failed to delete offer." };
  }
};
