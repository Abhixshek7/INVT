import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  IconAlertTriangle,
  IconRefresh,
  IconDownload,
  IconCheck,
} from "@tabler/icons-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Helper to estimate days until stockout (mock logic for now)
const estimateStockoutDays = (stock: number) => {
  if (stock === 0) return 0;
  const dailySales = Math.floor(Math.random() * 5) + 1; // Mock daily sales
  return Math.floor(stock / dailySales);
};

export default function LowStockPage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/inventory", {
        headers: {
          "x-auth-token": token || "",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      return data;
    },
  });

  const lowStockItems = inventoryData
    .filter((item: any) => item.stock <= item.threshold)
    .map((item: any) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      currentStock: item.stock,
      threshold: item.threshold,
      maxStock: item.max_stock,
      suggestedReorder: item.max_stock - item.stock,
      daysUntilStockout: estimateStockoutDays(item.stock),
      supplier: item.supplier || "Unknown Supplier",
      urgency: item.stock === 0 ? "critical" : item.stock < item.threshold / 2 ? "critical" : "low",
    }));

  const criticalCount = lowStockItems.filter(
    (item) => item.urgency === "critical"
  ).length;

  const toggleItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === lowStockItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(lowStockItems.map((item) => item.id));
    }
  };

  const handleReorder = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected", {
        description: "Please select items to reorder.",
      });
      return;
    }
    toast.success(`Reorder initiated for ${selectedItems.length} items`, {
      description: "Purchase orders have been created.",
    });
    setSelectedItems([]);
  };

  return (
    <DashboardLayout title="Low Stock">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Low Stock Alerts
            </h2>
            {/* <p className="text-muted-foreground">
              {lowStockItems.length} items below minimum threshold
            </p> */}
          </div>

        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card >
            <CardHeader className="pb-2">
              <CardDescription>Critical Items</CardDescription>
              <CardTitle className="text-3xl font-bold text-destructive">
                {criticalCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Require immediate reorder
              </p>
            </CardContent>
          </Card>
          <Card >
            <CardHeader className="pb-2">
              <CardDescription>Low Stock Items</CardDescription>
              <CardTitle className="text-3xl font-bold text-warning">
                {lowStockItems.length - criticalCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Below threshold, monitor closely
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Est. Stockout Risk</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {Math.min(
                  ...lowStockItems.map((i) => i.daysUntilStockout)
                )}{" "}
                days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earliest stockout prediction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Table */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            {/* LEFT : Title + Description */}
            <div>
              <CardTitle>Items Requiring Attention</CardTitle>
              <CardDescription>
                Select items and click "Reorder Selected" to create purchase orders
              </CardDescription>
            </div>

            {/* RIGHT : Buttons */}
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm">
                <IconDownload className="size-4 mr-2" />
                Export Report
              </Button>

              <Button size="sm" onClick={handleReorder}>
                <IconRefresh className="size-4 mr-2" />
                Reorder Selected ({selectedItems.length})
              </Button>
            </div>

          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length === lowStockItems.length &&
                          lowStockItems.length > 0
                        }
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Stock Level</TableHead>
                    <TableHead className="text-center">Days Left</TableHead>
                    <TableHead className="text-center">
                      Suggested Order
                    </TableHead>
                    <TableHead className="text-center">Urgency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => {
                    const stockPercent =
                      (item.currentStock / item.threshold) * 100;
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <TableRow
                        key={item.id}
                        className={isSelected ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItem(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.sku} · {item.category}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.supplier}
                        </TableCell>
                        <TableCell>
                          <div className="w-28 mx-auto space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">
                                {item.currentStock}
                              </span>
                              <span className="text-muted-foreground">
                                / {item.threshold}
                              </span>
                            </div>
                            <Progress
                              value={stockPercent}
                              className={`h-2 ${item.urgency === "critical"
                                  ? "[&>div]:bg-destructive"
                                  : "[&>div]:bg-warning"
                                }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.daysUntilStockout <= 2
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {item.daysUntilStockout} days
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.suggestedReorder} units
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.urgency === "critical"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {item.urgency === "critical" ? (
                              <>
                                <IconAlertTriangle className="size-3 mr-1" />
                                Critical
                              </>
                            ) : (
                              "Low"
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
