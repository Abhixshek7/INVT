import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartData = [
  { date: "2024-01-01", sales: 42000, forecast: 40000 },
  { date: "2024-01-08", sales: 45000, forecast: 43000 },
  { date: "2024-01-15", sales: 48000, forecast: 47000 },
  { date: "2024-01-22", sales: 52000, forecast: 50000 },
  { date: "2024-01-29", sales: 49000, forecast: 51000 },
  { date: "2024-02-05", sales: 55000, forecast: 53000 },
  { date: "2024-02-12", sales: 58000, forecast: 56000 },
  { date: "2024-02-19", sales: 62000, forecast: 60000 },
  { date: "2024-02-26", sales: 65000, forecast: 63000 },
  { date: "2024-03-04", sales: 68000, forecast: 66000 },
  { date: "2024-03-11", sales: 72000, forecast: 70000 },
  { date: "2024-03-18", sales: 75000, forecast: 73000 },
];

const chartConfig = {
  sales: {
    label: "Actual Sales",
    color: "hsl(var(--primary))",
  },
  forecast: {
    label: "Forecast",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const daysToShow = timeRange === "90d" ? 12 : timeRange === "30d" ? 4 : 2;
    return chartData.slice(-daysToShow);
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales vs Forecast</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Comparing actual sales against demand forecasts
          </span>
          <span className="@[540px]/card:hidden">Sales trend analysis</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden @[600px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="px-3">
              3 Months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="px-3">
              30 Days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="px-3">
              7 Days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-36 @[600px]/card:hidden"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">3 Months</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                  formatter={(value, name) => (
                    <span>
                      {name === "sales" ? "Actual" : "Forecast"}: $
                      {Number(value).toLocaleString()}
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey="forecast"
              type="monotone"
              fill="url(#fillForecast)"
              stroke="hsl(var(--chart-1))"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Area
              dataKey="sales"
              type="monotone"
              fill="url(#fillSales)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
