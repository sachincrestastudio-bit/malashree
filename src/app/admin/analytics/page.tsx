import { connectToDatabase } from "@/database/mongoose";
import { Kitchen } from "@/models/Kitchen";
import { AnalyticsFilters } from "@/components/admin/analytics/AnalyticsFilters";
import { DashboardKPIs } from "@/components/admin/analytics/DashboardKPIs";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { MenuPerformanceTable } from "@/components/admin/analytics/MenuPerformanceTable";
import { ExportButton } from "@/components/admin/analytics/ExportButton";
import { RevenueAnalyticsService } from "@/services/admin/RevenueAnalyticsService";
import { CustomerAnalyticsService } from "@/services/admin/CustomerAnalyticsService";
import { MenuAnalyticsService } from "@/services/admin/MenuAnalyticsService";

export default async function AdminAnalyticsPage(props: any) {
  const searchParams = await props.searchParams;
  const kitchenId = searchParams?.kitchenId || "all";
  const period = searchParams?.period || "30d";

  await connectToDatabase();
  const rawKitchens = await Kitchen.find({ deletedAt: null }).lean();

  const kitchens = rawKitchens.map((k: any) => ({
    _id: k._id.toString(),
    name: k.name,
    code: k.code,
    status: k.status,
  }));

  // Fetch data concurrently using analytics services
  const [revenueKPIs, customerKPIs, revenueTrend, menuPerf] = await Promise.all([
    RevenueAnalyticsService.getRevenueKPIs(kitchenId, period),
    CustomerAnalyticsService.getCustomerMetrics(kitchenId, period),
    RevenueAnalyticsService.getRevenueTrend(kitchenId, period),
    MenuAnalyticsService.getDishPerformance(kitchenId, period),
  ]);

  const dashboardData = JSON.parse(
    JSON.stringify({
      ...revenueKPIs,
      ...customerKPIs,
    })
  );

  const serializedTrend = JSON.parse(JSON.stringify(revenueTrend));
  const serializedMenuPerf = JSON.parse(JSON.stringify(menuPerf));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Intelligence</h2>
          <p className="text-gray-500">Enterprise analytics and reporting dashboard.</p>
        </div>
        <ExportButton kitchenId={kitchenId} period={period} />
      </div>

      <AnalyticsFilters kitchens={kitchens} />

      <DashboardKPIs data={dashboardData} />

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
        <RevenueChart data={serializedTrend} />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Menu Performance</h3>
        <MenuPerformanceTable data={serializedMenuPerf} />
      </div>
    </div>
  );
}
