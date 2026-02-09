import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SectionCards } from "@/components/dashboard/SectionCards";
import { ChartAreaInteractive } from "@/components/dashboard/ChartAreaInteractive";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { TopMovingProducts } from "@/components/dashboard/TopMovingProducts";

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

        {/* Top Moving Products Table */}
        <TopMovingProducts />

        {/* Alerts & Small Stats */}
        <InventoryAlerts />
      </div>
    </DashboardLayout>
  );
}
