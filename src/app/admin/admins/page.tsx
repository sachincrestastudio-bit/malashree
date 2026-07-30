"use server";

import { connectToDatabase } from "@/database/mongoose";
import { User } from "@/models/User";
import AdminAccountsClient from "./AdminAccountsClient";

export default async function AdminAccountsPage() {
  await connectToDatabase();

  const admins = await User.find({ role: "admin" })
    .sort({ createdAt: -1 })
    .lean();

  const serialized = admins.map((u: any) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone || "-",
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "-",
    lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-IN") : "Never",
  }));

  return <AdminAccountsClient admins={serialized} />;
}
