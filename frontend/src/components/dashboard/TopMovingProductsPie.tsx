"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"
import { useQuery } from "@tanstack/react-query"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
    sold: {
        label: "Units Sold",
    },
} satisfies ChartConfig

export function TopMovingProductsPie() {
    const { data: topProducts = [] } = useQuery({
        queryKey: ["top-products"],
        queryFn: async () => {
            const res = await fetch(`import.meta.env.VITE_API_URL || "http://localhost:5000"/api/dashboard/top-products`);
            if (!res.ok) throw new Error("Failed to fetch top products");
            return res.json();
        }
    });

    // Transform data for pie chart - take top 5 products
    const chartData = topProducts.slice(0, 5).map((item: any, index: number) => ({
        name: item.name,
        sold: parseInt(item.sold_last_30_days || 0),
        fill: `hsl(var(--chart-${index + 1}))`,
    }));

    // Calculate total sold
    const totalSold = chartData.reduce((acc: number, curr: any) => acc + curr.sold, 0);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Top Moving Products</CardTitle>
                <CardDescription>Last 30 Days</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[300px] pb-0"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="sold"
                            label={(entry) => entry.name}
                            nameKey="name"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 12.5% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing top 5 products by units sold
                </div>
            </CardFooter>
        </Card>
    )
}
