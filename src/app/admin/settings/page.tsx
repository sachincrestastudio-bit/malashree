"use server";

import { getSystemSettings } from "@/actions/adminSetting";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings();
  return <AdminSettingsClient initialSettings={settings} />;
}
