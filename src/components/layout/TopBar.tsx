import { IconBell, IconMail, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:px-6">
      {/* Search Bar - Left/Center */}
      <div className="flex-1 flex justify-start px-4">
        <div className="relative w-full max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search task"
            className="w-full pl-9 pr-12 h-10 bg-muted/50 border-0"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>F
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mail */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <IconMail className="h-5 w-5" />
          <span className="sr-only">Mail</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <IconBell className="h-5 w-5" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
            5
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Nav */}
        <UserNav showDetails={true} />
      </div>
    </header>
  );
}
