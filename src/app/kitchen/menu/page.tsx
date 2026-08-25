import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenAvailabilityService } from "@/services/kitchen/KitchenAvailabilityService";
import { KitchenMenuClient } from "./KitchenMenuClient";

export default async function KitchenMenuPage() {
  const user = await requireKitchenAccess();
  const rawItems = await KitchenAvailabilityService.getKitchenMenu(user.kitchenId);

  const items = rawItems.map((item: any) => ({
    id: item._id?.toString() || item.id,
    name: item.name,
    price: item.price,
    categoryName: item.category?.name || "Main Course",
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    isVeg: item.isVeg !== undefined ? item.isVeg : true,
  }));

  return <KitchenMenuClient initialItems={items} kitchenId={user.kitchenId} />;
}
