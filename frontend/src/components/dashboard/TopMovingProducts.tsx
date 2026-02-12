import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronsUpDown,
    SquarePlus,
    Loader,
    Truck,
    CircleCheckBig,
    Clock,
    CircleX,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Mock data based on the provided HTML
const initialData = [
    {
        id: 1,
        customer: {
            name: "Marcus Chen",
            email: "marcus.chen@email.com",
            initials: "MC",
            color: "bg-slate-100 text-slate-700",
        },
        total: 384.92,
        status: "Processing",
        items: 10,
        date: new Date(), // Today
    },
    {
        id: 2,
        customer: {
            name: "Nina Patel",
            email: "nina.patel@email.com",
            initials: "NP",
            color: "bg-emerald-100 text-emerald-700",
        },
        total: 567.45,
        status: "Shipped",
        items: 11,
        date: new Date(Date.now() - 86400000), // Yesterday
    },
    {
        id: 3,
        customer: {
            name: "Oliver Martinez",
            email: "oliver.martinez@email.com",
            initials: "OM",
            color: "bg-indigo-100 text-indigo-700",
        },
        total: 892.34,
        status: "Delivered",
        items: 12,
        date: new Date(Date.now() - 400000000), // Within this week
    },
    {
        id: 4,
        customer: {
            name: "Sophia Kim",
            email: "sophia.kim@email.com",
            initials: "SK",
            color: "bg-amber-100 text-amber-700",
        },
        total: 246.78,
        status: "Pending",
        items: 7,
        date: new Date(Date.now() - 2000000000), // Within this month
    },
    {
        id: 5,
        customer: {
            name: "Jackson Wu",
            email: "jackson.wu@email.com",
            initials: "JW",
            color: "bg-rose-100 text-rose-700",
        },
        total: 1234.56,
        status: "Processing",
        items: 11,
        date: new Date(Date.now() - 5000000000), // Within this month
    },
    {
        id: 6,
        customer: {
            name: "Emma Thompson",
            email: "emma.thompson@email.com",
            initials: "ET",
            color: "bg-sky-100 text-sky-700",
        },
        total: 678.90,
        status: "Shipped",
        items: 18,
        date: new Date(Date.now() - 10000000000), // This year
    },
    {
        id: 7,
        customer: {
            name: "Lucas Gonzalez",
            email: "lucas.gonzalez@email.com",
            initials: "LG",
            color: "bg-slate-100 text-slate-700",
        },
        total: 423.67,
        status: "Delivered",
        items: 10,
        date: new Date(Date.now() - 15000000000), // This year
    },
    {
        id: 8,
        customer: {
            name: "Ava Robinson",
            email: "ava.robinson@email.com",
            initials: "AR",
            color: "bg-emerald-100 text-emerald-700",
        },
        total: 789.23,
        status: "Cancelled",
        items: 7,
        date: new Date(Date.now() - 20000000000), // This year
    },
    {
        id: 9,
        customer: {
            name: "Ethan Foster",
            email: "ethan.foster@email.com",
            initials: "EF",
            color: "bg-indigo-100 text-indigo-700",
        },
        total: 534.12,
        status: "Processing",
        items: 11,
        date: new Date(Date.now() - 25000000000), // This year
    },
    {
        id: 10,
        customer: {
            name: "Isabella Hayes",
            email: "isabella.hayes@email.com",
            initials: "IH",
            color: "bg-slate-100 text-slate-700",
        },
        total: 312.45,
        status: "Shipped",
        items: 12,
        date: new Date(Date.now() - 30000000000), // This year
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Processing":
            return (
                <Badge
                    variant="secondary"
                    className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50 gap-1"
                >
                    <Loader className="size-3" />
                    Processing
                </Badge>
            );
        case "Shipped":
            return (
                <Badge
                    variant="secondary"
                    className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50 gap-1"
                >
                    <Truck className="size-3" />
                    Shipped
                </Badge>
            );
        case "Delivered":
            return (
                <Badge
                    variant="secondary"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 gap-1"
                >
                    <CircleCheckBig className="size-3" />
                    Delivered
                </Badge>
            );
        case "Pending":
            return (
                <Badge
                    variant="secondary"
                    className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 gap-1"
                >
                    <Clock className="size-3" />
                    Pending
                </Badge>
            );
        case "Cancelled":
            return (
                <Badge
                    variant="secondary"
                    className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50 gap-1"
                >
                    <CircleX className="size-3" />
                    Cancelled
                </Badge>
            );
        default:
            return <Badge>{status}</Badge>;
    }
};

export function TopMovingProducts() {
    const [filter, setFilter] = useState("today");

    const { data: topProducts = [] } = useQuery({
        queryKey: ["top-products"],
        queryFn: async () => {
            const res = await fetch("http://localhost:5000/api/dashboard/top-products");
            if (!res.ok) throw new Error("Failed to fetch top products");
            return res.json();
        }
    });

    const products = topProducts.map((item: any, idx: number) => ({
        id: idx,
        name: item.name,
        category: item.category,
        items: parseInt(item.stock),
        sold: parseInt(item.sold_last_30_days),
        revenue: parseFloat(item.revenue),
        status: parseInt(item.stock) > 20 ? "In Stock" : "Low Stock",
        initials: item.name.substring(0, 2).toUpperCase()
    }));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Moving Products</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-0 hover:bg-transparent">
                                        Total <ChevronsUpDown className="size-4 opacity-50" />
                                    </Button>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-0 hover:bg-transparent">
                                        Items <ChevronsUpDown className="size-4 opacity-50" />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Button variant="ghost" size="icon" className="size-9">
                                                    <SquarePlus className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-10 border border-border/60">
                                                    <AvatarFallback className={`bg-primary/10 text-primary text-xs font-semibold uppercase`}>
                                                        {item.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-medium">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-semibold tabular-nums">
                                                ${item.revenue.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {item.sold} sold
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No transactions found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
