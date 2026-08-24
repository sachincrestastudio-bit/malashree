import { requireKitchenAccess } from "@/actions/kitchen/auth";
import { KitchenDashboardService } from "@/services/kitchen/KitchenDashboardService";
import KitchenDashboardClient from "./KitchenDashboardClient";

export const dynamic = "force-dynamic";

export default async function KitchenDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ kitchenId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireKitchenAccess(params?.kitchenId);
  const data = await KitchenDashboardService.getDashboardMetrics(user.kitchenId);

  return <KitchenDashboardClient data={data as any} />;
}
