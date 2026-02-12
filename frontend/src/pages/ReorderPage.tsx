import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    IconSearch,
    IconFilter,
    IconDownload,
    IconAlertTriangle,
    IconRefresh,
    IconShoppingCart,
    IconTrendingUp,
    IconClock,
    IconCurrencyDollar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface ReorderSuggestion {
    id: number;
    sku: string;
    name: string;
    category: string;
    stock: number;
    threshold: number;
    max_stock: number;
    status: string;
    supplier: string;
    avg_daily_sales: number;
    max_daily_sales: number;
    total_sales_90d: number;
    sales_volatility: number;
    active_sales_days: number;
    days_until_stockout: number;
    suggested_order_quantity: number;
    priority_score: number;
    urgency: string;
    estimated_cost: number;
}

interface ReorderData {
    summary: {
        total_items: number;
        critical_items: number;
        urgent_items: number;
        total_suggested_units: number;
        total_estimated_cost: number;
        avg_days_until_stockout: number;
    };
    suggestions: ReorderSuggestion[];
}

const urgencyConfig: Record<
    string,
    {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        color: string;
    }
> = {
    critical: {
        label: "Critical",
        variant: "destructive",
        color: "text-red-600 dark:text-red-400",
    },
    urgent: {
        label: "Urgent",
        variant: "destructive",
        color: "text-orange-600 dark:text-orange-400",
    },
    moderate: {
        label: "Moderate",
        variant: "outline",
        color: "text-yellow-600 dark:text-yellow-400",
    },
    low_stock: {
        label: "Low Stock",
        variant: "secondary",
        color: "text-blue-600 dark:text-blue-400",
    },
    normal: {
        label: "Normal",
        variant: "outline",
        color: "text-green-600 dark:text-green-400",
    },
};

export default function ReorderPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUrgency, setSelectedUrgency] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [lookAheadDays, setLookAheadDays] = useState("30");

    const { data: reorderData, isLoading, refetch } = useQuery({
        queryKey: ["reorder-suggestions", lookAheadDays],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:5000/api/reorder/suggestions?days=${lookAheadDays}`,
                {
                    headers: {
                        "x-auth-token": token || "",
                    },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch reorder suggestions");
            return res.json() as Promise<ReorderData>;
        },
    });

    const suggestions = reorderData?.suggestions || [];
    const summary = reorderData?.summary;

    // Get unique categories
    const categories = Array.from(
        new Set(suggestions.map((s) => s.category))
    ).sort();

    const filteredData = suggestions.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUrgency =
            selectedUrgency === "all" || item.urgency === selectedUrgency;
        const matchesCategory =
            selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesUrgency && matchesCategory;
    });

    const activeFilterCount =
        (selectedUrgency !== "all" ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0);

    const handleRefresh = () => {
        toast.info("Refreshing reorder suggestions...");
        refetch();
    };

    const getPriorityColor = (score: number) => {
        if (score >= 80) return "bg-red-500";
        if (score >= 60) return "bg-orange-500";
        if (score >= 40) return "bg-yellow-500";
        return "bg-blue-500";
    };

    return (
        <DashboardLayout title="Reorder Suggestions">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Reorder Suggestions
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            AI-powered recommendations based on sales data and inventory levels
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Select value={lookAheadDays} onValueChange={setLookAheadDays}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Next 7 days</SelectItem>
                                <SelectItem value="14">Next 14 days</SelectItem>
                                <SelectItem value="30">Next 30 days</SelectItem>
                                <SelectItem value="60">Next 60 days</SelectItem>
                                <SelectItem value="90">Next 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <IconRefresh
                                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : summary ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <IconAlertTriangle className="size-5 text-destructive" />
                                    <div>
                                        <div className="text-2xl font-bold text-destructive">
                                            {summary.critical_items}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Critical Items
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <IconShoppingCart className="size-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {summary.total_suggested_units.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Units to Order
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <IconCurrencyDollar className="size-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            ${summary.total_estimated_cost.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Estimated Cost
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <IconClock className="size-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {summary.avg_days_until_stockout.toFixed(0)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Avg Days to Stockout
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}

                {/* Reorder Table */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
                        <div className="shrink-0">
                            <CardTitle className="text-xl font-bold">
                                Suggested Orders
                            </CardTitle>
                            <CardDescription>
                                Items requiring reorder based on {lookAheadDays}-day forecast
                            </CardDescription>
                        </div>

                        <div className="flex-1 w-full sm:max-w-md sm:mx-4">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, SKU, or supplier..."
                                    className="pl-9 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-dashed"
                                    >
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
                                            <h4 className="font-medium leading-none">
                                                Filter Options
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Refine your suggestions list.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="urgency">Urgency</Label>
                                                <Select
                                                    value={selectedUrgency}
                                                    onValueChange={setSelectedUrgency}
                                                >
                                                    <SelectTrigger id="urgency">
                                                        <SelectValue placeholder="Urgency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Urgency</SelectItem>
                                                        <SelectItem value="critical">Critical</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                        <SelectItem value="moderate">Moderate</SelectItem>
                                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={selectedCategory}
                                                    onValueChange={setSelectedCategory}
                                                >
                                                    <SelectTrigger id="category">
                                                        <SelectValue placeholder="Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Categories</SelectItem>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat} value={cat}>
                                                                {cat}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {activeFilterCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                className="justify-center text-primary w-full"
                                                onClick={() => {
                                                    setSelectedUrgency("all");
                                                    setSelectedCategory("all");
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
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : filteredData.length === 0 ? (
                            <Alert>
                                <AlertDescription>
                                    {suggestions.length === 0
                                        ? "No reorder suggestions at this time. All inventory levels are sufficient."
                                        : "No items match your search criteria."}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="rounded-md border overflow-auto max-h-[600px]">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background">
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-center">Current Stock</TableHead>
                                            <TableHead className="text-center">Avg Daily Sales</TableHead>
                                            <TableHead className="text-center">Days to Stockout</TableHead>
                                            <TableHead className="text-right">Order Qty</TableHead>
                                            <TableHead className="text-right">Est. Cost</TableHead>
                                            <TableHead className="text-center">Priority</TableHead>
                                            <TableHead className="text-center">Urgency</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.map((item) => {
                                            const config = urgencyConfig[item.urgency] || {
                                                label: item.urgency,
                                                variant: "secondary",
                                                color: "text-gray-600",
                                            };

                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{item.name}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-muted-foreground font-mono">
                                                                    {item.sku}
                                                                </span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {item.category}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground mt-1">
                                                                Supplier: {item.supplier || "—"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">{item.stock}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                / {item.max_stock}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">
                                                                {parseFloat(item.avg_daily_sales?.toString() || '0').toFixed(1)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                units/day
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={
                                                                item.days_until_stockout <= 3
                                                                    ? "destructive"
                                                                    : item.days_until_stockout <= 7
                                                                        ? "outline"
                                                                        : "secondary"
                                                            }
                                                        >
                                                            {item.days_until_stockout} days
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-bold text-primary">
                                                            {item.suggested_order_quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        $
                                                        {parseFloat(
                                                            item.estimated_cost?.toString() || "0"
                                                        ).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="w-full max-w-[100px]">
                                                                <Progress
                                                                    value={item.priority_score}
                                                                    className={`h-2 [&>div]:${getPriorityColor(
                                                                        item.priority_score
                                                                    )}`}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">
                                                                {item.priority_score}/100
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={config.variant}>
                                                            {config.label}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Alert>
                    <IconTrendingUp className="h-4 w-4" />
                    <AlertDescription>
                        <strong>How it works:</strong> Reorder suggestions are calculated
                        using historical sales data from the past 90 days. The system
                        analyzes average daily sales, volatility, and current stock levels to
                        determine optimal reorder quantities. Priority scores help you focus
                        on the most critical items first.
                    </AlertDescription>
                </Alert>
            </div>
        </DashboardLayout>
    );
}
