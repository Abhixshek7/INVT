import {
  IconTrendingUp,
  IconTrendingDown,
  IconPackage,
  IconAlertTriangle,
  IconShoppingCart,
  IconTruck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    title: "Total Products",
    value: "12,847",
    change: "+2.5%",
    trend: "up",
    description: "Across all categories",
    footer: "128 new items this week",
    icon: IconPackage,
  },
  {
    title: "Low Stock Items",
    value: "156",
    change: "+18%",
    trend: "down",
    description: "Below threshold",
    footer: "23 critical items need reorder",
    icon: IconAlertTriangle,
  },
  {
    title: "Today's Sales",
    value: "$48,352",
    change: "+12.3%",
    trend: "up",
    description: "Revenue generated",
    footer: "2,847 transactions processed",
    icon: IconShoppingCart,
  },
  {
    title: "Pending Orders",
    value: "34",
    change: "-8%",
    trend: "up",
    description: "Awaiting delivery",
    footer: "12 arriving today",
    icon: IconTruck,
  },
];

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}  className="@container/card">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardDescription className="flex items-center gap-2">
                <stat.icon className="size-4" />
                {stat.title}
              </CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums @[200px]/card:text-3xl">
                {stat.value}
              </CardTitle>
            </div>
            <CardAction>
              <Badge
                variant="outline"
                className={
                  stat.trend === "up"
                    ? "text-success border-success/30"
                    : "text-destructive border-destructive/30"
                }
              >
                {stat.trend === "up" ? (
                  <IconTrendingUp className="size-3 mr-1" />
                ) : (
                  <IconTrendingDown className="size-3 mr-1" />
                )}
                {stat.change}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </CardContent>
          <CardFooter className="pt-2">
            <p className="text-xs text-muted-foreground">{stat.footer}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
