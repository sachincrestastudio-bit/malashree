import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenQueueService } from "@/services/kitchen/KitchenQueueService";
import KitchenLiveQueueClient from "./KitchenLiveQueueClient";

export const dynamic = "force-dynamic";

export default async function KitchenLiveQueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ kitchenId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireKitchenAccess(params?.kitchenId);
  const queue = await KitchenQueueService.getLiveQueue(user.kitchenId);

  return <KitchenLiveQueueClient initialQueue={queue} kitchenName={user.kitchenId} />;
}
