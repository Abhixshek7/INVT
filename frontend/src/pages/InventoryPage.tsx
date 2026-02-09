import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const inventoryData = [
  {
    id: 1,
    sku: "SKU-001234",
    name: "Organic Milk 1L",
    category: "Dairy",
    stock: 12,
    threshold: 50,
    maxStock: 200,
    status: "critical",
    lastUpdated: "2024-01-15",
  },
  {
    id: 2,
    sku: "SKU-002345",
    name: "Whole Wheat Bread",
    category: "Bakery",
    stock: 18,
    threshold: 40,
    maxStock: 150,
    status: "critical",
    lastUpdated: "2024-01-15",
  },
  {
    id: 3,
    sku: "SKU-003456",
    name: "Fresh Eggs (12pk)",
    category: "Dairy",
    stock: 85,
    threshold: 60,
    maxStock: 200,
    status: "good",
    lastUpdated: "2024-01-14",
  },
  {
    id: 4,
    sku: "SKU-004567",
    name: "Bananas (bunch)",
    category: "Produce",
    stock: 42,
    threshold: 80,
    maxStock: 300,
    status: "low",
    lastUpdated: "2024-01-15",
  },
  {
    id: 5,
    sku: "SKU-005678",
    name: "Paper Towels",
    category: "Household",
    stock: 8,
    threshold: 30,
    maxStock: 100,
    status: "critical",
    lastUpdated: "2024-01-15",
  },
  {
    id: 6,
    sku: "SKU-006789",
    name: "Cola 2L",
    category: "Beverages",
    stock: 245,
    threshold: 100,
    maxStock: 400,
    status: "excess",
    lastUpdated: "2024-01-14",
  },
  {
    id: 7,
    sku: "SKU-007890",
    name: "Potato Chips",
    category: "Snacks",
    stock: 156,
    threshold: 80,
    maxStock: 250,
    status: "good",
    lastUpdated: "2024-01-15",
  },
  {
    id: 8,
    sku: "SKU-008901",
    name: "Laundry Detergent",
    category: "Household",
    stock: 67,
    threshold: 40,
    maxStock: 150,
    status: "good",
    lastUpdated: "2024-01-13",
  },
  {
    id: 9,
    sku: "SKU-009012",
    name: "Orange Juice 1L",
    category: "Beverages",
    stock: 34,
    threshold: 50,
    maxStock: 180,
    status: "low",
    lastUpdated: "2024-01-15",
  },
  {
    id: 10,
    sku: "SKU-010123",
    name: "Chicken Breast 1kg",
    category: "Meat",
    stock: 28,
    threshold: 25,
    maxStock: 100,
    status: "good",
    lastUpdated: "2024-01-15",
  },
];

const categories = [
  "All Categories",
  "Dairy",
  "Bakery",
  "Produce",
  "Beverages",
  "Snacks",
  "Household",
  "Meat",
];

const statusConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline"; progressClass: string }> = {
  critical: {
    label: "Critical",
    variant: "destructive",
    progressClass: "[&>div]:bg-destructive",
  },
  low: {
    label: "Low",
    variant: "outline",
    progressClass: "[&>div]:bg-warning",
  },
  good: {
    label: "In Stock",
    variant: "outline",
    progressClass: "[&>div]:bg-success",
  },
  excess: {
    label: "Excess",
    variant: "outline",
    progressClass: "[&>div]:bg-info",
  },
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeFilterCount = (selectedCategory !== "All Categories" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0);

  return (
    <DashboardLayout title="Inventory">
      <div className="flex flex-col gap-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Inventory Management
            </h1>
          </div>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
            <div className="shrink-0">
              <CardTitle className="text-xl font-bold">Products</CardTitle>
            </div>

            <div className="flex-1 w-full sm:max-w-md sm:mx-4">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-dashed">
                    <IconFilter className="size-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="px-1 font-normal h-5">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filter Options</h4>
                      <p className="text-sm text-muted-foreground">
                        Refine your product list.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="low">Low Stock</SelectItem>
                            <SelectItem value="good">In Stock</SelectItem>
                            <SelectItem value="excess">Excess</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {(activeFilterCount > 0) && (
                      <Button
                        variant="ghost"
                        className="justify-center text-primary w-full"
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setSelectedStatus("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button size="sm">
                <IconDownload className="size-4 mr-2" />
                Export
              </Button>
              {/* <Button size="sm">
                <IconPlus className="size-4 mr-2" />
                Add Product
              </Button> */}
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock Level</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const config = statusConfig[item.status];
                    const stockPercent = (item.stock / item.maxStock) * 100;
                    return (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-32 mx-auto space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{item.stock}</span>
                              <span className="text-muted-foreground">
                                / {item.maxStock}
                              </span>
                            </div>
                            <Progress
                              value={stockPercent}
                              className={`h-2 ${config.progressClass}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(item.lastUpdated).toLocaleDateString()}
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
