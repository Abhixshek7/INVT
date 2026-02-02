import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChartBar, IconTrendingUp, IconCalendar, IconTarget } from "@tabler/icons-react";

export default function AnalyticsPage() {
  return (
    <DashboardLayout title="Analytics">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Inventory performance metrics and insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card variant="gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Turnover Ratio</CardDescription>
              <IconChartBar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.4x</div>
              <p className="text-xs text-muted-foreground">+0.3 from last month</p>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Service Level</CardDescription>
              <IconTarget className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.8%</div>
              <p className="text-xs text-muted-foreground">Target: 95%</p>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Avg. Days in Stock</CardDescription>
              <IconCalendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.3</div>
              <p className="text-xs text-muted-foreground">-1.2 from last month</p>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Forecast Accuracy</CardDescription>
              <IconTrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Detailed analytics with drill-down capabilities, trend analysis, and exportable reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Advanced analytics features will be available here
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
