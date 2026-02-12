import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  IconDashboard,
  IconPackage,
  IconChartBar,
  IconTruck,
  IconSettings,
  IconBell,
  IconHelp,
  IconAlertTriangle,
  IconUserShield,
  IconReportAnalytics,
  IconBuildingWarehouse,
  IconRefresh,
  IconFileInvoice,
  IconBox,
  IconLogout,
} from "@tabler/icons-react";

import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard, roles: ["admin", "store_manager", "inventory_analyst", "staff"] },
  { title: "Inventory", url: "/inventory", icon: IconPackage, roles: ["admin", "store_manager", "inventory_analyst", "staff"] },
  { title: "Low Stock", url: "/low-stock", icon: IconAlertTriangle, roles: ["admin", "store_manager", "inventory_analyst", "staff"] },
  { title: "Analytics", url: "/analytics", icon: IconChartBar, roles: ["admin", "inventory_analyst"] },
  { title: "Notifications", url: "/notifications", icon: IconBell, roles: ["admin", "store_manager", "inventory_analyst", "staff"] }
];

const navSupplyChain = [
  { title: "Purchase Orders", url: "/purchase-orders", icon: IconFileInvoice, roles: ["admin", "store_manager"] },
  { title: "Warehouse", url: "/warehouse", icon: IconBuildingWarehouse, roles: ["admin", "store_manager"] },
  { title: "Shipments", url: "/shipments", icon: IconTruck, roles: ["admin", "store_manager"] },
  { title: "Suppliers", url: "/suppliers", icon: IconBox, roles: ["admin", "store_manager"] },
];

const navForecasting = [
  { title: "Demand Forecast", url: "/forecast", icon: IconReportAnalytics, roles: ["admin", "inventory_analyst"] },
  { title: "Reorder Suggestions", url: "/reorder", icon: IconRefresh, roles: ["admin", "inventory_analyst"] },
];

const navAdmin = [
  { title: "Admin Access", url: "/admin", icon: IconUserShield, roles: ["admin"] },
];

const navGeneral = [
  { title: "Settings", url: "/settings", icon: IconSettings, roles: ["admin", "store_manager", "inventory_analyst", "staff"] },
  { title: "Help", url: "/help", icon: IconHelp, roles: ["admin", "store_manager", "inventory_analyst", "staff"] },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => location.pathname === url;

  const userRole = user?.role || "";

  const filterByRole = (items: any[]) => {
    return items.filter(item => item.roles.includes(userRole));
  };

  const filteredMain = filterByRole(navMain);
  const filteredSupplyChain = filterByRole(navSupplyChain);
  const filteredForecasting = filterByRole(navForecasting);
  const filteredAdmin = filterByRole(navAdmin);
  const filteredGeneral = filterByRole(navGeneral);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between w-full px-2">
          <button
            onClick={collapsed ? toggleSidebar : undefined}
            className={`flex items-center gap-2 ${collapsed ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <IconPackage className="size-5" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold">INVT</span>
            )}
          </button>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-7"
              aria-label="Hide sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="size-4"
              >
                <path
                  fill="currentColor"
                  d="M19.25 7A2.25 2.25 0 0 0 17 4.75H7A2.25 2.25 0 0 0 4.75 7v10A2.25 2.25 0 0 0 7 19.25h10A2.25 2.25 0 0 0 19.25 17zm-12 9V8a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-1.5 0m13.5 1A3.75 3.75 0 0 1 17 20.75H7A3.75 3.75 0 0 1 3.25 17V7A3.75 3.75 0 0 1 7 3.25h10A3.75 3.75 0 0 1 20.75 7z"
                />
              </svg>
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        {/* Main Navigation */}
        {filteredMain.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>MENU</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Supply Chain */}
        {filteredSupplyChain.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>SUPPLY CHAIN</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSupplyChain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Forecasting */}
        {filteredForecasting.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>FORECASTING</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredForecasting.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>ADMIN</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* General - pushed towards bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>GENERAL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredGeneral.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  tooltip="Logout"
                  className="text-destructive hover:text-destructive"
                >
                  <IconLogout className="size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
