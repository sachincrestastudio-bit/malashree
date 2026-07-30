"use server";

import { getCurrentUser } from "../user";
import { connectToDatabase } from "@/database/mongoose";
import { DriverProfile } from "@/models/DriverProfile";

/**
 * Ensures the current user is a delivery driver.
 * Retrieves both User and DriverProfile data.
 */
export async function requireDriverAccess() {
  await connectToDatabase();
  const user = await getCurrentUser();
  if (!user || user.role !== "driver") {
    throw new Error("Unauthorized: Driver access required");
  }

  // Ensure DriverProfile exists, create if missing
  let profile = await DriverProfile.findOne({ user: user.id });
  if (!profile) {
    profile = await DriverProfile.create({ user: user.id });
  }

  return {
    user,
    profileId: profile._id.toString(),
    driverId: user.id,
  };
}
