import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    IconSearch,
    IconFilter,
    IconDownload,
    IconCalendar,
    IconTruck,
    IconPackage,
    IconCurrencyDollar,
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_id: number;
    supplier_name: string;
    warehouse_id: number;
    warehouse_name: string;
    warehouse_code: string;
    order_date: string;
    expected_delivery: string;
    actual_delivery: string | null;
    status: string;
    total_items: number;
    total_amount: number;
    notes: string;
    created_at: string;
}

const statusConfig: Record<
    string,
    {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
    }
> = {
    pending: { label: "Pending", variant: "outline" },
    confirmed: { label: "Confirmed", variant: "secondary" },
    shipped: { label: "Shipped", variant: "default" },
    delivered: { label: "Delivered", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function PurchaseOrdersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const { data: purchaseOrders = [], isLoading } = useQuery({
        queryKey: ["purchase-orders"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`}/api/purchase-orders`, {
                headers: {
                    "x-auth-token": token || "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch purchase orders");
            return res.json() as Promise<PurchaseOrder[]>;
        },
    });

    const filteredData = purchaseOrders.filter((po) => {
        const matchesSearch =
            po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.warehouse_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const activeFilterCount = selectedStatus !== "all" ? 1 : 0;

    const totalValue = purchaseOrders.reduce(
        (sum, po) => sum + parseFloat(po.total_amount?.toString() || "0"),
        0
    );
    const pendingOrders = purchaseOrders.filter((po) => po.status === "pending").length;
    const deliveredOrders = purchaseOrders.filter((po) => po.status === "delivered").length;

    return (
        <DashboardLayout title="Purchase Orders">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Purchase Orders</h1>
                        <p className="text-muted-foreground mt-1">
                            Track and manage your purchase orders
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <IconPackage className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">{purchaseOrders.length}</div>
                                    <p className="text-xs text-muted-foreground">Total Orders</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <IconCalendar className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">{pendingOrders}</div>
                                    <p className="text-xs text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <IconTruck className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">{deliveredOrders}</div>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
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
                                        ${totalValue.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total Value</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Purchase Orders Table */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
                        <div className="shrink-0">
                            <CardTitle className="text-xl font-bold">All Orders</CardTitle>
                        </div>

                        <div className="flex-1 w-full sm:max-w-md sm:mx-4">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by PO number, supplier, or warehouse..."
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
                                            <h4 className="font-medium leading-none">Filter Options</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Refine your order list.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={selectedStatus}
                                                    onValueChange={setSelectedStatus}
                                                >
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Status</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {activeFilterCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                className="justify-center text-primary w-full"
                                                onClick={() => setSelectedStatus("all")}
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
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PO Number</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Order Date</TableHead>
                                        <TableHead>Expected Delivery</TableHead>
                                        <TableHead className="text-right">Items</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                Loading purchase orders...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                No purchase orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((po) => {
                                            const config = statusConfig[po.status] || {
                                                label: po.status,
                                                variant: "secondary",
                                            };

                                            return (
                                                <TableRow
                                                    key={po.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <span className="font-mono font-medium">
                                                            {po.po_number}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{po.supplier_name || "—"}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{po.warehouse_name || "—"}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                {po.warehouse_code}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {new Date(po.order_date).toLocaleDateString()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {po.expected_delivery
                                                                ? new Date(po.expected_delivery).toLocaleDateString()
                                                                : "—"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="secondary">{po.total_items}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ${parseFloat(po.total_amount?.toString() || "0").toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={config.variant}>{config.label}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
