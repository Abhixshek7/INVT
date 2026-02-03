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

const lowStockItems = [
  {
    id: 1,
    sku: "SKU-001234",
    name: "Organic Milk 1L",
    category: "Dairy",
    currentStock: 12,
    threshold: 50,
    maxStock: 200,
    suggestedReorder: 150,
    daysUntilStockout: 2,
    supplier: "Farm Fresh Co.",
    urgency: "critical",
  },
  {
    id: 2,
    sku: "SKU-002345",
    name: "Whole Wheat Bread",
    category: "Bakery",
    currentStock: 18,
    threshold: 40,
    maxStock: 150,
    suggestedReorder: 100,
    daysUntilStockout: 3,
    supplier: "Baker's Best",
    urgency: "critical",
  },
  {
    id: 3,
    sku: "SKU-005678",
    name: "Paper Towels",
    category: "Household",
    currentStock: 8,
    threshold: 30,
    maxStock: 100,
    suggestedReorder: 80,
    daysUntilStockout: 1,
    supplier: "CleanSupply Inc.",
    urgency: "critical",
  },
  {
    id: 4,
    sku: "SKU-004567",
    name: "Bananas (bunch)",
    category: "Produce",
    currentStock: 42,
    threshold: 80,
    maxStock: 300,
    suggestedReorder: 200,
    daysUntilStockout: 5,
    supplier: "Tropical Farms",
    urgency: "low",
  },
  {
    id: 5,
    sku: "SKU-009012",
    name: "Orange Juice 1L",
    category: "Beverages",
    currentStock: 34,
    threshold: 50,
    maxStock: 180,
    suggestedReorder: 120,
    daysUntilStockout: 4,
    supplier: "Citrus Direct",
    urgency: "low",
  },
  {
    id: 6,
    sku: "SKU-011234",
    name: "Greek Yogurt 500g",
    category: "Dairy",
    currentStock: 22,
    threshold: 45,
    maxStock: 120,
    suggestedReorder: 80,
    daysUntilStockout: 3,
    supplier: "Farm Fresh Co.",
    urgency: "critical",
  },
  {
    id: 7,
    sku: "SKU-012345",
    name: "Sliced Ham",
    category: "Deli",
    currentStock: 15,
    threshold: 35,
    maxStock: 80,
    suggestedReorder: 50,
    daysUntilStockout: 2,
    supplier: "Premium Meats",
    urgency: "critical",
  },
  {
    id: 8,
    sku: "SKU-013456",
    name: "Butter 250g",
    category: "Dairy",
    currentStock: 28,
    threshold: 40,
    maxStock: 150,
    suggestedReorder: 100,
    daysUntilStockout: 4,
    supplier: "Farm Fresh Co.",
    urgency: "low",
  },
];

export default function LowStockPage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

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
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <IconAlertTriangle className="size-6 text-warning" />
              Low Stock Alerts
            </h2>
            <p className="text-muted-foreground">
              {lowStockItems.length} items below minimum threshold
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <IconDownload className="size-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" onClick={handleReorder}>
              <IconRefresh className="size-4 mr-2" />
              Reorder Selected ({selectedItems.length})
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card variant="stat">
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
          <Card variant="stat">
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
          <Card variant="stat">
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
          <CardHeader>
            <CardTitle>Items Requiring Attention</CardTitle>
            <CardDescription>
              Select items and click "Reorder Selected" to create purchase
              orders
            </CardDescription>
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
                              className={`h-2 ${
                                item.urgency === "critical"
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
