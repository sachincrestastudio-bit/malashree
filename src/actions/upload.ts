"use server";

import ImageKit from "imagekit";
import { requireAdmin } from "./authGuard";
import { connectToDatabase } from "@/database/mongoose";
import { SystemSetting } from "@/models/SystemSetting";

/**
 * Server action to upload an image to ImageKit.
 * Private key remains secure on the server.
 */
export async function uploadToImageKitAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file) {
      return { error: "No image file provided." };
    }

    // Try env vars first, fallback to SystemSetting DB document
    let publicKey =
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
      process.env.IMAGEKIT_PUBLIC_KEY ||
      "";
    let privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    let urlEndpoint =
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
      process.env.IMAGEKIT_URL_ENDPOINT ||
      "";

    if (!publicKey || !urlEndpoint) {
      await connectToDatabase();
      const settings = await SystemSetting.findOne().lean() as any;
      if (settings?.imagekitPublicKey) publicKey = settings.imagekitPublicKey;
      if (settings?.imagekitUrlEndpoint) urlEndpoint = settings.imagekitUrlEndpoint;
    }

    if (!publicKey || !privateKey || !urlEndpoint) {
      return {
        error:
          "ImageKit credentials not fully configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env.local or Admin Settings.",
      };
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeFileName = file.name
      ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      : `dish_${Date.now()}.jpg`;

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: safeFileName,
      folder: "/malashree/dishes",
      useUniqueFileName: true,
    });

    return { url: uploadResponse.url };
  } catch (err: any) {
    console.error("ImageKit upload error:", err);
    return { error: err.message || "Failed to upload image to ImageKit." };
  }
}
