import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    IconSearch,
    IconFilter,
    IconDownload,
    IconPlus,
    IconStar,
    IconPhone,
    IconMail,
    IconMapPin,
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

interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    rating: number;
    total_orders: number;
    status: string;
    created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Active", variant: "default" },
    inactive: { label: "Inactive", variant: "secondary" },
    pending: { label: "Pending", variant: "outline" },
};

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const { data: suppliers = [], isLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/suppliers", {
                headers: {
                    "x-auth-token": token || "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch suppliers");
            return res.json() as Promise<Supplier[]>;
        },
    });

    const filteredData = suppliers.filter((supplier) => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            selectedStatus === "all" || supplier.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const activeFilterCount = selectedStatus !== "all" ? 1 : 0;

    return (
        <DashboardLayout title="Suppliers">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Suppliers Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your supplier relationships and contacts
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {suppliers.filter((s) => s.status === "active").length}
                            </div>
                            <p className="text-xs text-muted-foreground">Active Suppliers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{suppliers.length}</div>
                            <p className="text-xs text-muted-foreground">Total Suppliers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {(
                                    suppliers.reduce((sum, s) => sum + (parseFloat(s.rating?.toString() || '0') || 0), 0) /
                                    suppliers.length
                                ).toFixed(1)}
                            </div>
                            <p className="text-xs text-muted-foreground">Avg. Rating</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {suppliers.reduce((sum, s) => sum + (s.total_orders || 0), 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Suppliers Table */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
                        <div className="shrink-0">
                            <CardTitle className="text-xl font-bold">
                                Supplier Directory
                            </CardTitle>
                        </div>

                        <div className="flex-1 w-full sm:max-w-md sm:mx-4">
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, contact, or email..."
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
                                                Refine your supplier list.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Status</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
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
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Contact Person</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-center">Rating</TableHead>
                                        <TableHead className="text-center">Orders</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                Loading suppliers...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                No suppliers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((supplier) => {
                                            const config = statusConfig[supplier.status] || {
                                                label: supplier.status,
                                                variant: "secondary",
                                            };
                                            return (
                                                <TableRow
                                                    key={supplier.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{supplier.name}</span>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <IconMail className="size-3" />
                                                                    {supplier.email}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <IconPhone className="size-3" />
                                                                    {supplier.phone}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {supplier.contact_person || "—"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <IconMapPin className="size-3 text-muted-foreground" />
                                                            <span>
                                                                {supplier.city}, {supplier.country}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <IconStar className="size-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">
                                                                {supplier.rating ? parseFloat(supplier.rating.toString()).toFixed(1) : "N/A"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary">
                                                            {supplier.total_orders || 0}
                                                        </Badge>
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
