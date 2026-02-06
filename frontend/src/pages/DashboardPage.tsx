import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SectionCards } from "@/components/dashboard/SectionCards";
import { ChartAreaInteractive } from "@/components/dashboard/ChartAreaInteractive";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">
        Dashboard
        </h1>
        {/* Stats Cards */}
        <SectionCards />

        {/* Sales Chart */}
        <ChartAreaInteractive />

        {/* Alerts & Top Products */}
        <InventoryAlerts />
      </div>
    </DashboardLayout>
  );
}
