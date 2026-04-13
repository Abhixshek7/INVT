import {
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowRight,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const getUrgency = (stock: number, threshold: number) => {
  if (stock === 0) return "out_of_stock";
  if (stock <= threshold * 0.5) return "critical";
  return "low";
};

export function InventoryAlerts() {
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["low-stock-alerts"],
    queryFn: async () => {
      const res = await fetch(`import.meta.env.VITE_API_URL || "http://localhost:5000"/api/dashboard/low-stock`);
      if (!res.ok) throw new Error("Failed to fetch low stock items");
      return res.json();
    }
  });

  const items = alertsData?.map((item: any) => ({
    ...item,
    urgency: getUrgency(item.currentStock, item.threshold)
  })) || [];

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  return (
    <div className="grid gap-4 lg:grid-cols-1">
      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconAlertTriangle className="size-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/low-stock">
              View All
              <IconArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{item.currentStock}</span>
                        <span className="text-muted-foreground">
                          / {item.threshold}
                        </span>
                      </div>
                      <Progress
                        value={(item.currentStock / item.threshold) * 100}
                        className={`h-2 ${item.urgency === "critical"
                          ? "[&>div]:bg-destructive"
                          : "[&>div]:bg-warning"
                          }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        item.urgency === "critical" || item.urgency === "out_of_stock" ? "destructive" : "outline"
                      }
                      className="text-xs"
                    >
                      {item.urgency === "out_of_stock" ? "Out of Stock" : item.urgency === "critical" ? "Critical" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
