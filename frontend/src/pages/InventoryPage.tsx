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

import { useQuery } from "@tanstack/react-query";

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  maxStock: number;
  status: string;
  lastUpdated: string;
  supplier?: string;
}

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

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory`, {
        headers: {
          "x-auth-token": token || "",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();

      // Transform snake_case from DB to camelCase for frontend
      return data.map((item: any) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        stock: item.stock,
        threshold: item.threshold,
        maxStock: item.max_stock, // DB column: max_stock
        status: item.status,
        lastUpdated: item.last_updated, // DB column: last_updated
        supplier: item.supplier,
      })) as InventoryItem[];
    },
  });

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
                        }
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
                    const config = statusConfig[item.status] || {
                      label: item.status,
                      variant: "secondary",
                      progressClass: "[&>div]:bg-secondary",
                    };
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
