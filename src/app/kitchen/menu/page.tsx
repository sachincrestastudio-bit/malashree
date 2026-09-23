import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenAvailabilityService } from "@/services/kitchen/KitchenAvailabilityService";
import { KitchenMenuClient } from "./KitchenMenuClient";

export default async function KitchenMenuPage({
  searchParams,
}: {
  searchParams?: Promise<{ kitchenId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireKitchenAccess(params?.kitchenId);
  const rawItems = await KitchenAvailabilityService.getKitchenMenu(user.kitchenId);

  const items = rawItems.map((item: any) => {
    const override = (item.branchPricing || []).find(
      (bp: any) => bp.kitchenId?.toString() === user.kitchenId.toString()
    );

    const masterPrice = Number(item.price) || 0;
    const branchPrice =
      override && override.price !== undefined && override.price !== null
        ? Number(override.price)
        : masterPrice;

    const isAvailable =
      override && override.isAvailable !== undefined
        ? override.isAvailable
        : item.isAvailable !== undefined
        ? item.isAvailable
        : true;

    return {
      id: item._id?.toString() || item.id,
      name: item.name,
      masterPrice,
      price: branchPrice,
      hasOverride: branchPrice !== masterPrice,
      categoryName: item.category?.name || "Main Course",
      isAvailable,
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      image: item.images?.[0] || "",
    };
  });

  return <KitchenMenuClient initialItems={items} kitchenId={user.kitchenId} />;
}
