import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { SiteHeader } from "./SiteHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      {/* Fixed Top Bar */}
      <TopBar />
      
      <div className="flex min-h-screen w-full pt-16">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <SiteHeader title={title} />
          <main className="flex-1 overflow-auto">
            <div className="@container/main flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
