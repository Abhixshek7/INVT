import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SectionCards } from "@/components/dashboard/SectionCards";
import { ChartAreaInteractive } from "@/components/dashboard/ChartAreaInteractive";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { TopMovingProducts } from "@/components/dashboard/TopMovingProducts";
import { BentoGrid } from "@/components/ui/bento-grid";
import { TopMovingProductsPie } from "@/components/dashboard/TopMovingProductsPie";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Bento Grid Layout */}
        <BentoGrid className="auto-rows-auto md:grid-cols-6 lg:grid-cols-6">
          {/* Section Cards - Left Column */}
          <div className="col-span-5 md:col-span-3 lg:col-span-2 row-span-2">

            <SectionCards />

          </div>

          {/* Sales vs Forecast Chart - Right Column, spans 2 rows */}
          <div className="col-span-6 md:col-span-3 lg:col-span-4 row-span-2">

            <ChartAreaInteractive />

          </div>

          {/* Low Stock Alerts - Bottom Left */}
          <div className="col-span-6 md:col-span-3 lg:col-span-3">
            
              <InventoryAlerts />
            
          </div>

          {/* Top Moving Products - Bottom Right */}
          <div className="col-span-6 md:col-span-3 lg:col-span-3">
            
              <TopMovingProductsPie />
  
          </div>
        </BentoGrid>
      </div>
    </DashboardLayout>
  );
}
