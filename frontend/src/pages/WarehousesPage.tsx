import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    IconSearch,
    IconFilter,
    IconDownload,
    IconBuilding,
    IconMapPin,
    IconUser,
    IconPhone,
    IconMail,
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
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface Warehouse {
    id: number;
    name: string;
    code: string;
    location: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
    current_utilization: number;
    manager_name: string;
    contact_email: string;
    contact_phone: string;
    status: string;
    created_at: string;
}

const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    operational: { label: "Operational", variant: "default" },
    maintenance: { label: "Maintenance", variant: "outline" },
    closed: { label: "Closed", variant: "destructive" },
};

export default function WarehousesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const { data: warehouses = [], isLoading } = useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`}/api/warehouses`, {
                headers: {
                    "x-auth-token": token || "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch warehouses");
            return res.json() as Promise<Warehouse[]>;
        },
    });

    const filteredData = warehouses.filter((warehouse) => {
        const matchesSearch =
            warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            warehouse.location?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            selectedStatus === "all" || warehouse.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const activeFilterCount = selectedStatus !== "all" ? 1 : 0;

    const totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0);
    const totalUtilization = warehouses.reduce(
        (sum, w) => sum + (w.current_utilization || 0),
        0
    );
    const avgUtilization = totalCapacity > 0 ? (totalUtilization / totalCapacity) * 100 : 0;

    return (
        <DashboardLayout title="Warehouses">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Warehouse Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage your warehouse facilities
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {warehouses.filter((w) => w.status === "operational").length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Operational Facilities
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{warehouses.length}</div>
                            <p className="text-xs text-muted-foreground">Total Warehouses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {totalCapacity.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Capacity</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{avgUtilization.toFixed(0)}%</div>
                            <p className="text-xs text-muted-foreground">Avg. Utilization</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Warehouses Table */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
                        <div className="shrink-0">
                            <CardTitle className="text-xl font-bold">
                                Warehouse Directory
                            </CardTitle>
                        </div>

                        <div className="flex-1 w-full sm:max-w-md sm:mx-4">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, code, or location..."
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
                                                Refine your warehouse list.
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
                                                        <SelectItem value="operational">Operational</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                                        <SelectItem value="closed">Closed</SelectItem>
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
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Manager</TableHead>
                                        <TableHead className="text-center">Capacity Usage</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                Loading warehouses...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                No warehouses found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((warehouse) => {
                                            const config = statusConfig[warehouse.status] || {
                                                label: warehouse.status,
                                                variant: "secondary",
                                            };
                                            const utilizationPercent =
                                                warehouse.capacity > 0
                                                    ? (warehouse.current_utilization / warehouse.capacity) * 100
                                                    : 0;

                                            return (
                                                <TableRow
                                                    key={warehouse.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <IconBuilding className="size-4 text-muted-foreground" />
                                                                <span className="font-medium">
                                                                    {warehouse.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground mt-1 font-mono">
                                                                {warehouse.code}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <IconMapPin className="size-3 text-muted-foreground" />
                                                                <span>
                                                                    {warehouse.city}, {warehouse.country}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground mt-1">
                                                                {warehouse.location}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <IconUser className="size-3 text-muted-foreground" />
                                                                <span>{warehouse.manager_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <IconMail className="size-3" />
                                                                    {warehouse.contact_email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="w-40 mx-auto space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="font-medium">
                                                                    {warehouse.current_utilization.toLocaleString()}
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    / {warehouse.capacity.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={utilizationPercent}
                                                                className={`h-2 ${utilizationPercent > 80
                                                                        ? "[&>div]:bg-destructive"
                                                                        : utilizationPercent > 60
                                                                            ? "[&>div]:bg-warning"
                                                                            : "[&>div]:bg-success"
                                                                    }`}
                                                            />
                                                            <div className="text-xs text-center text-muted-foreground">
                                                                {utilizationPercent.toFixed(0)}%
                                                            </div>
                                                        </div>
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
