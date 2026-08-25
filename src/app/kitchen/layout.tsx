import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user";
import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { KitchenLayoutClient } from "@/components/kitchen/KitchenLayoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Malashree Kitchen Ops",
};

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  await connectToDatabase();
  const user = await getCurrentUser();

  // Strict Authorization: Allowed for admin and kitchen_manager
  if (!user || (user.role !== "kitchen_manager" && user.role !== "admin")) {
    redirect("/login?redirect=/kitchen/dashboard");
  }

  let kitchens: Array<{ id: string; name: string; code: string; area: string }> = [];

  if (user.role === "kitchen_manager") {
    // Multi-tenant isolation: Manager ONLY receives their assigned kitchen
    if (user.assignedKitchen) {
      const assigned = await Kitchen.findById(user.assignedKitchen).lean();
      if (assigned) {
        kitchens = [
          {
            id: (assigned as any)._id.toString(),
            name: (assigned as any).name,
            code: (assigned as any).code,
            area: (assigned as any).area || (assigned as any).address || "Pune",
          },
        ];
      }
    }
  } else {
    // Super Admin has access to all active kitchens
    const rawKitchens = await Kitchen.find({ status: "active", deletedAt: null })
      .sort({ name: 1 })
      .lean();

    kitchens = rawKitchens.map((k: any) => ({
      id: k._id.toString(),
      name: k.name,
      code: k.code,
      area: k.area || k.address || "Pune",
    }));
  }

  const currentKitchenId = user.assignedKitchen?.toString() || kitchens[0]?.id || "";

  return (
    <KitchenLayoutClient
      user={user}
      kitchens={kitchens}
      currentKitchenId={currentKitchenId}
      isBranchLocked={user.role === "kitchen_manager"}
    >
      {children}
    </KitchenLayoutClient>
  );
}
