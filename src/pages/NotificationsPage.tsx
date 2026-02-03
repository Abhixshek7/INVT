import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  IconBell,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconSearch,
  IconDotsVertical,
  IconMail,
  IconMailOpened,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "We're pleased to inform you that a new customer has registered! Please follow up promptly by contacting.",
    date: "Just Now",
    read: false,
    starred: false,
    archived: false,
  },
  {
    id: "2",
    message: "Hello Inventory Team, We have a special offer for our customers! Enjoy a 20% discount on selected..",
    date: "30 min ago",
    read: false,
    starred: true,
    archived: false,
  },
  {
    id: "3",
    message: "Hello Inventory Team, This is a reminder to achieve this month's sales target. Currently, we've....",
    date: "2 days ago",
    read: true,
    starred: false,
    archived: false,
  },
  {
    id: "4",
    message: "Hello Inventory Team, We've received a product information request from a potential customer.",
    date: "5 days ago",
    read: true,
    starred: true,
    archived: false,
  },
  {
    id: "5",
    message: "Hello Inventory Team, We've received a product information request from a potential customer.",
    date: "07 Feb, 2024",
    read: true,
    starred: false,
    archived: false,
  },
  {
    id: "6",
    message: "Hello Inventory Team, A meeting or presentation has been scheduled with a customer/prospect.",
    date: "01 Feb, 2024",
    read: false,
    starred: false,
    archived: false,
  },
  {
    id: "7",
    message: "Hello Inventory Team, This is a reminder to review the contract or proposal currently under....",
    date: "28 Jan, 2024",
    read: true,
    starred: false,
    archived: false,
  },
  {
    id: "8",
    message: "Hello Inventory Team, It's time for a follow-up with a customer after their recent purchase/meeting.",
    date: "27 Jan, 2024",
    read: true,
    starred: false,
    archived: false,
  },
  {
    id: "9",
    message: "Hello Inventory Team, We've received positive feedback/testimonial from a satisfied customer...",
    date: "26 Jan, 2024",
    read: true,
    starred: false,
    archived: true,
  },
  {
    id: "10",
    message: "Hello Inventory Team, This is a reminder regarding an outstanding payment from a customer......",
    date: "28 Jan, 2024",
    read: true,
    starred: false,
    archived: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const toggleStar = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch && !n.archived;
    if (activeTab === "archive") return matchesSearch && n.archived;
    if (activeTab === "favorite") return matchesSearch && n.starred;
    return matchesSearch;
  });

  const allCount = notifications.filter((n) => !n.archived).length;
  const archiveCount = notifications.filter((n) => n.archived).length;
  const favoriteCount = notifications.filter((n) => n.starred).length;

  return (
    <DashboardLayout
      title="Notifications"
      description="Manage your notifications and alerts"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <IconBell className="h-6 w-6" />
            <CardTitle className="text-xl font-semibold">List Notification</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            <IconDotsVertical className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Header with count and search */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {notifications.length} Notification
            </p>
            <div className="relative w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Name Product"
                className="pl-9 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 mb-4">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 pb-3"
              >
                <Badge variant="secondary" className="mr-2 rounded-full">
                  {allCount}
                </Badge>
                All
              </TabsTrigger>
              <TabsTrigger
                value="archive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 pb-3"
              >
                <span className="mr-2 text-muted-foreground">{archiveCount}</span>
                Archive
              </TabsTrigger>
              <TabsTrigger
                value="favorite"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 pb-3"
              >
                <span className="mr-2 text-muted-foreground">{favoriteCount}</span>
                Favorite
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-center gap-4 py-4 px-2 hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-muted/30"
                    )}
                  >
                    {/* Unread indicator */}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        !notification.read ? "bg-primary" : "bg-transparent"
                      )}
                    />

                    {/* Star button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => toggleStar(notification.id)}
                    >
                      {notification.starred ? (
                        <IconStarFilled className="h-5 w-5 text-amber-500" />
                      ) : (
                        <IconStar className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>

                    {/* Read/Unread icon */}
                    <div className="shrink-0">
                      {notification.read ? (
                        <IconMailOpened className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <IconMail className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    {/* Message */}
                    <p className="flex-1 text-sm truncate">{notification.message}</p>

                    {/* Date */}
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {notification.date}
                    </span>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <IconTrash className="h-5 w-5" />
                    </Button>
                  </div>
                ))}

                {filteredNotifications.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No notifications found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
