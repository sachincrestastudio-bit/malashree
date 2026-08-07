"use server";

import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenQueueService } from "@/services/kitchen/KitchenQueueService";
import KitchenLiveQueueClient from "./KitchenLiveQueueClient";

export default async function KitchenLiveQueuePage() {
  const user = await requireKitchenAccess();
  const queue = await KitchenQueueService.getLiveQueue(user.kitchenId);

  return <KitchenLiveQueueClient initialQueue={queue} kitchenName={user.kitchenId} />;
}
