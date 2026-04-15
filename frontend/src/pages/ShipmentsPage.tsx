import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    IconSearch,
    IconFilter,
    IconDownload,
    IconTruck,
    IconPackage,
    IconMapPin,
    IconCalendar,
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
import { apiUrl } from "@/lib/api";

interface Shipment {
    id: number;
    tracking_number: string;
    po_id: number;
    po_number: string;
    origin_warehouse_id: number | null;
    origin_warehouse_name: string | null;
    origin_warehouse_code: string | null;
    destination_warehouse_id: number;
    destination_warehouse_name: string;
    destination_warehouse_code: string;
    carrier: string;
    shipping_method: string;
    status: string;
    ship_date: string;
    expected_delivery: string;
    actual_delivery: string | null;
    total_weight: number;
    total_cost: number;
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
    in_transit: { label: "In Transit", variant: "default" },
    delivered: { label: "Delivered", variant: "default" },
    delayed: { label: "Delayed", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "destructive" },
};

const methodConfig: Record<string, { label: string; icon: string }> = {
    air: { label: "Air", icon: "✈️" },
    sea: { label: "Sea", icon: "🚢" },
    road: { label: "Road", icon: "🚚" },
    rail: { label: "Rail", icon: "🚆" },
};

export default function ShipmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const { data: shipments = [], isLoading } = useQuery({
        queryKey: ["shipments"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(apiUrl("/api/shipments"), {
                headers: {
                    "x-auth-token": token || "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch shipments");
            return res.json() as Promise<Shipment[]>;
        },
    });

    const filteredData = shipments.filter((shipment) => {
        const matchesSearch =
            shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.carrier?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            selectedStatus === "all" || shipment.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const activeFilterCount = selectedStatus !== "all" ? 1 : 0;

    const inTransit = shipments.filter((s) => s.status === "in_transit").length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const totalCost = shipments.reduce(
        (sum, s) => sum + parseFloat(s.total_cost?.toString() || "0"),
        0
    );

    return (
        <DashboardLayout title="Shipments">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Shipments Tracking</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor shipments and deliveries in real-time
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
                                    <div className="text-2xl font-bold">{shipments.length}</div>
                                    <p className="text-xs text-muted-foreground">Total Shipments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <IconTruck className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">{inTransit}</div>
                                    <p className="text-xs text-muted-foreground">In Transit</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <IconCalendar className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">{delivered}</div>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <IconMapPin className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        ${totalCost.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Shipping Costs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shipments Table */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
                        <div className="shrink-0">
                            <CardTitle className="text-xl font-bold">All Shipments</CardTitle>
                        </div>

                        <div className="flex-1 w-full sm:max-w-md sm:mx-4">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by tracking number, PO, or carrier..."
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
                                                Refine your shipment list.
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
                                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="delayed">Delayed</SelectItem>
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
                                        <TableHead>Tracking Number</TableHead>
                                        <TableHead>PO Number</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Carrier</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Ship Date</TableHead>
                                        <TableHead>Expected Delivery</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                Loading shipments...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                No shipments found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((shipment) => {
                                            const config = statusConfig[shipment.status] || {
                                                label: shipment.status,
                                                variant: "secondary",
                                            };
                                            const methodInfo = methodConfig[shipment.shipping_method] || {
                                                label: shipment.shipping_method,
                                                icon: "📦",
                                            };

                                            return (
                                                <TableRow
                                                    key={shipment.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <span className="font-mono font-medium text-sm">
                                                            {shipment.tracking_number}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-sm">
                                                            {shipment.po_number || "—"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-muted-foreground">From:</span>
                                                                <span className="font-medium">
                                                                    {shipment.origin_warehouse_code || "Supplier"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-muted-foreground">To:</span>
                                                                <span className="font-medium">
                                                                    {shipment.destination_warehouse_code}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{shipment.carrier}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <span>{methodInfo.icon}</span>
                                                            <span className="text-sm">{methodInfo.label}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {shipment.ship_date
                                                                ? new Date(shipment.ship_date).toLocaleDateString()
                                                                : "—"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {shipment.expected_delivery
                                                                ? new Date(
                                                                    shipment.expected_delivery
                                                                ).toLocaleDateString()
                                                                : "—"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        $
                                                        {parseFloat(
                                                            shipment.total_cost?.toString() || "0"
                                                        ).toLocaleString(undefined, {
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
