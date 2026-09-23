import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Malashree Admin Portal",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If a branch manager accesses the admin route, redirect to their dedicated branch dashboard
  if (user?.role === "kitchen_manager") {
    redirect("/kitchen/dashboard");
  }

  // Strict Server-Side Authorization: Super Admin only
  if (!user || user.role !== "admin") {
    redirect("/"); // Redirect unauthorized users to customer home
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
