import { useLocation, Link } from "react-router-dom";
import {
  IconBell,
  IconMail,
  IconSearch,
  IconMenu2,
  IconDashboard,
  IconPackage,
  IconChartBar,
  IconTruck,
  IconAlertTriangle,
  IconReportAnalytics,
  IconBuildingWarehouse,
  IconRefresh,
  IconFileInvoice,
  IconBox,
  IconSettings,
  IconHelp,
  IconLogout,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";
import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Inventory", url: "/inventory", icon: IconPackage },
  { title: "Low Stock", url: "/low-stock", icon: IconAlertTriangle },
  { title: "Analytics", url: "/analytics", icon: IconChartBar },
];

const navSupplyChain = [
  { title: "Purchase Orders", url: "/purchase-orders", icon: IconFileInvoice },
  { title: "Warehouse", url: "/warehouse", icon: IconBuildingWarehouse },
  { title: "Shipments", url: "/shipments", icon: IconTruck },
  { title: "Suppliers", url: "/suppliers", icon: IconBox },
];

const navForecasting = [
  { title: "Demand Forecast", url: "/forecast", icon: IconReportAnalytics },
  { title: "Reorder Suggestions", url: "/reorder", icon: IconRefresh },
];

const navGeneral = [
  { title: "Notifications", url: "/notifications", icon: IconBell },
  { title: "Settings", url: "/settings", icon: IconSettings },
  { title: "Help", url: "/help", icon: IconHelp },
];

export function TopBar() {
  const location = useLocation();
  const isActive = (url: string) => location.pathname === url;

  const NavSection = ({ title, items }: { title: string; items: typeof navMain }) => (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
        {title}
      </p>
      {items.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent ${isActive(item.url) ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
            }`}
        >
          <item.icon className="size-4" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:px-6">
      {/* Mobile hamburger menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <IconMenu2 className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconPackage className="size-4" />
              </div>
              <span className="text-lg font-semibold">INVT</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            <NavSection title="Menu" items={navMain} />
            <NavSection title="Supply Chain" items={navSupplyChain} />
            <NavSection title="Forecasting" items={navForecasting} />
            <NavSection title="General" items={navGeneral} />
            <div className="border-t pt-4 mt-auto">
              <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 w-full transition-colors">
                <IconLogout className="size-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Search Bar - Left/Center */}
      <div className="flex-1 flex justify-start px-4">
        <div className="relative w-full max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search task"
            className="w-full pl-9 pr-12 h-10 bg-muted/50 border-0"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>F
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mail - hidden on small screens */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative hidden sm:flex">
          <IconMail className="h-5 w-5" />
          <span className="sr-only">Mail</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" asChild>
          <Link to="/notifications">
            <IconBell className="h-5 w-5" />
            <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
              5
            </Badge>
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Nav */}
        <div className="sm:hidden">
          <UserNav showDetails={false} />
        </div>
        <div className="hidden sm:flex">
          <UserNav showDetails={true} />
        </div>
      </div>
    </header>
  );
}
