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

const lowStockItems = [
  {
    id: 1,
    sku: "SKU-001234",
    name: "Organic Milk 1L",
    category: "Dairy",
    currentStock: 12,
    threshold: 50,
    reorderQty: 100,
    urgency: "critical",
  },
  {
    id: 2,
    sku: "SKU-002345",
    name: "Whole Wheat Bread",
    category: "Bakery",
    currentStock: 18,
    threshold: 40,
    reorderQty: 60,
    urgency: "critical",
  },
  {
    id: 3,
    sku: "SKU-003456",
    name: "Fresh Eggs (12pk)",
    category: "Dairy",
    currentStock: 35,
    threshold: 60,
    reorderQty: 80,
    urgency: "low",
  },
  {
    id: 4,
    sku: "SKU-004567",
    name: "Bananas (bunch)",
    category: "Produce",
    currentStock: 42,
    threshold: 80,
    reorderQty: 120,
    urgency: "low",
  },
  {
    id: 5,
    sku: "SKU-005678",
    name: "Paper Towels",
    category: "Household",
    currentStock: 8,
    threshold: 30,
    reorderQty: 50,
    urgency: "critical",
  },
];

const topProducts = [
  { name: "Cola 2L", sales: 2847, trend: "up", change: "+15%" },
  { name: "Potato Chips", sales: 2234, trend: "up", change: "+8%" },
  { name: "Ice Cream", sales: 1956, trend: "down", change: "-3%" },
  { name: "Energy Drink", sales: 1823, trend: "up", change: "+22%" },
  { name: "Bottled Water", sales: 1654, trend: "up", change: "+5%" },
];

export function InventoryAlerts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
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
              {lowStockItems.slice(0, 5).map((item) => (
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
                        className={`h-2 ${
                          item.urgency === "critical"
                            ? "[&>div]:bg-destructive"
                            : "[&>div]:bg-warning"
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        item.urgency === "critical" ? "destructive" : "outline"
                      }
                      className="text-xs"
                    >
                      {item.urgency === "critical" ? "Reorder Now" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Moving Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="size-5 text-success" />
            Top Moving Products
          </CardTitle>
          <CardDescription>Best sellers this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales.toLocaleString()} units
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    product.trend === "up"
                      ? "text-success border-success/30"
                      : "text-destructive border-destructive/30"
                  }
                >
                  {product.trend === "up" ? (
                    <IconTrendingUp className="size-3 mr-1" />
                  ) : (
                    <IconTrendingDown className="size-3 mr-1" />
                  )}
                  {product.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
