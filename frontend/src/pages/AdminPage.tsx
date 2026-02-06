import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconUsers,
  IconShield,
  IconBuildingStore,
  IconTruckDelivery,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconSearch,
} from "@tabler/icons-react";

// Mock data for users
const mockUsers = [
  { id: 1, name: "Sofia Martinez", email: "sofia.m@example.com", role: "store_manager", avatar: "" },
  { id: 2, name: "Alex Chen", email: "alex.c@example.com", role: "inventory_analyst", avatar: "" },
  { id: 3, name: "Jordan Blake", email: "jordan.b@example.com", role: "staff", avatar: "" },
  { id: 4, name: "Morgan Reid", email: "morgan.r@example.com", role: "staff", avatar: "" },
];

// Mock data for roles
const mockRoles = [
  { id: 1, name: "Admin", description: "Full access to all features", permissions: 15, users: 2 },
  { id: 2, name: "Store Manager", description: "Manage store inventory and orders", permissions: 10, users: 5 },
  { id: 3, name: "Inventory Analyst", description: "View and analyze inventory data", permissions: 6, users: 8 },
  { id: 4, name: "Warehouse Staff", description: "Handle warehouse operations", permissions: 4, users: 12 },
];

// Mock data for stores
const mockStores = [
  { id: 1, name: "Downtown Store", location: "123 Main St, New York", manager: "Sofia Martinez", status: "Active" },
  { id: 2, name: "Mall Outlet", location: "456 Mall Ave, Los Angeles", manager: "Alex Chen", status: "Active" },
  { id: 3, name: "Harbor Branch", location: "789 Harbor Rd, Chicago", manager: "Jordan Blake", status: "Inactive" },
];

// Mock data for suppliers
const mockSuppliers = [
  { id: 1, name: "Global Supplies Inc.", contact: "John Smith", email: "john@globalsupplies.com", status: "Active" },
  { id: 2, name: "Prime Distributors", contact: "Jane Doe", email: "jane@primedist.com", status: "Active" },
  { id: 3, name: "Fast Freight Co.", contact: "Mike Johnson", email: "mike@fastfreight.com", status: "Pending" },
];

function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvitation = () => {
    // TODO: Implement invitation logic
    console.log("Sending invitation to:", inviteEmail, "with role:", inviteRole);
    setInviteDialogOpen(false);
    setInviteEmail("");
    setInviteRole("editor");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5" />
              User Management
            </CardTitle>
           
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <IconPlus className="size-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new member to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@yourcompany.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Select role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="store_manager">Store Manager</SelectItem>
                      <SelectItem value="inventory_analyst">Inventory Analyst</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSendInvitation}
                  disabled={!inviteEmail}
                  className="w-full sm:w-auto"
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          {filteredUsers.length} members
        </div>
        <ul className="divide-y divide-border">
          {filteredUsers.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
             <div className="flex items-center gap-2">
                <Select defaultValue={user.role.toLowerCase()}>
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store_manager">Store manager</SelectItem>
                    <SelectItem value="inventory_analyst">Inventory Analyst</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8">
                      <IconDotsVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <IconEdit className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <IconTrash className="size-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RoleManagement() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="size-5" />
              Role & Permission Management
            </CardTitle>
          </div>
          <Button className="gap-2">
            <IconPlus className="size-4" />
            Create Role
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {role.description}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{role.permissions} permissions</Badge>
                </TableCell>
                <TableCell>{role.users} users</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <IconEdit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <IconTrash className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StoreManagement() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconBuildingStore className="size-5" />
              Store Management
            </CardTitle>
          </div>
          <Button className="gap-2">
            <IconPlus className="size-4" />
            Add Store
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden sm:table-cell">Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {store.location}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{store.manager}</TableCell>
                <TableCell>
                  <Badge variant={store.status === "Active" ? "default" : "secondary"}>
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <IconEdit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <IconTrash className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SupplierManagement() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconTruckDelivery className="size-5" />
              Supplier Management
            </CardTitle>
  
          </div>
          <Button className="gap-2">
            <IconPlus className="size-4" />
            Add Supplier
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead className="hidden sm:table-cell">Contact</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{supplier.contact}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {supplier.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={supplier.status === "Active" ? "default" : "outline"}
                  >
                    {supplier.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <IconEdit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <IconTrash className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  return (
    <DashboardLayout title="Admin Access">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="users" className="gap-2">
              <IconUsers className="size-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <IconShield className="size-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="gap-2">
              <IconBuildingStore className="size-4" />
              <span className="hidden sm:inline">Stores</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <IconTruckDelivery className="size-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="stores" className="mt-6">
            <StoreManagement />
          </TabsContent>

          <TabsContent value="suppliers" className="mt-6">
            <SupplierManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

