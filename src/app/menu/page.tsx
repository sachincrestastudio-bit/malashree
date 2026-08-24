import { getKitchenMenu } from "@/actions/menu";
import { getAssignedKitchenDetails } from "@/actions/kitchen";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [kitchenDetails, initialDishes] = await Promise.all([
    getAssignedKitchenDetails(),
    getKitchenMenu(),
  ]);

  return (
    <MenuClient
      initialDishes={initialDishes || []}
      initialKitchenName={kitchenDetails?.name || "Malashree Pure Veg"}
      initialKitchenArea={kitchenDetails?.area || "Pune"}
    />
  );
}
