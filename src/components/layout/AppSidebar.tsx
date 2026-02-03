import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  IconDashboard,
  IconPackage,
  IconChartBar,
  IconTruck,
  IconUsers,
  IconSettings,
  IconBell,
  IconHelp,
  IconAlertTriangle,
  IconReportAnalytics,
  IconBuildingWarehouse,
  IconRefresh,
  IconFileInvoice,
  IconAdjustments,
  IconBox,
  IconChevronsLeft,
  IconChevronsRight,
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
  { title: "Settings", url: "/settings", icon: IconSettings },
  { title: "Help", url: "/help", icon: IconHelp },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar collapsible="icon" className="bg-white/15 dark:bg-white/10 backdrop-blur-[19px] border-r border-white/30" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconPackage className="size-4" />
              </div>
              {!collapsed && (
                <span className="text-lg font-semibold">INVT</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
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

        {/* Supply Chain */}
        <SidebarGroup>
          <SidebarGroupLabel>SUPPLY CHAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSupplyChain.map((item) => (
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

        {/* Forecasting */}
        <SidebarGroup>
          <SidebarGroupLabel>FORECASTING</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navForecasting.map((item) => (
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

        {/* General - pushed towards bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>GENERAL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGeneral.map((item) => (
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
                <SidebarMenuButton tooltip="Logout" className="text-destructive hover:text-destructive">
                  <IconLogout className="size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center"
        >
          {collapsed ? (
            <IconChevronsRight className="size-4" />
          ) : (
            <>
              <IconChevronsLeft className="size-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
