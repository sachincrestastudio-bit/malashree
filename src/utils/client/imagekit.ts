/**
 * Client-side helper to upload an image to ImageKit via Server Action.
 * Does not expose the private key to the browser.
 */
import { uploadToImageKitAction } from "@/actions/upload";

export const uploadToImageKit = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await uploadToImageKitAction(formData);

  if (res.error || !res.url) {
    throw new Error(res.error || "Image upload to ImageKit failed.");
  }

  return res.url;
};
