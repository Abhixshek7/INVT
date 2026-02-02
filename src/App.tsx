import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Dashboard Pages
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import LowStockPage from "./pages/LowStockPage";
import AnalyticsPage from "./pages/AnalyticsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/low-stock" element={<LowStockPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Placeholder routes for other sections */}
          <Route path="/purchase-orders" element={<DashboardPage />} />
          <Route path="/warehouse" element={<DashboardPage />} />
          <Route path="/shipments" element={<DashboardPage />} />
          <Route path="/suppliers" element={<DashboardPage />} />
          <Route path="/forecast" element={<DashboardPage />} />
          <Route path="/reorder" element={<DashboardPage />} />
          <Route path="/users" element={<DashboardPage />} />
          <Route path="/settings" element={<DashboardPage />} />
          <Route path="/configuration" element={<DashboardPage />} />
          <Route path="/notifications" element={<DashboardPage />} />
          <Route path="/help" element={<DashboardPage />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
