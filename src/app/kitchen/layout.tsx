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
    redirect("/");
  }

  const rawKitchens = await Kitchen.find({ status: "active", deletedAt: null })
    .sort({ name: 1 })
    .lean();

  const kitchens = rawKitchens.map((k: any) => ({
    id: k._id.toString(),
    name: k.name,
    code: k.code,
    area: k.area || "Pune",
  }));

  const currentKitchenId = user.assignedKitchen?.toString() || kitchens[0]?.id || "";

  return (
    <KitchenLayoutClient
      user={user}
      kitchens={kitchens}
      currentKitchenId={currentKitchenId}
    >
      {children}
    </KitchenLayoutClient>
  );
}
