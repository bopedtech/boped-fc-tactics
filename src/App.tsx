import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Database from "./pages/Database";
import Builder from "./pages/Builder";
import MySquads from "./pages/MySquads";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import SyncData from "./pages/admin/SyncData";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/database" element={<Database />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/my-squads" element={<MySquads />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin Routes with Sidebar Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="sync" element={<SyncData />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="players" element={<div className="text-2xl font-bold">Quản Lý Cầu Thủ (Coming Soon)</div>} />
          <Route path="leagues" element={<div className="text-2xl font-bold">Giải Đấu & CLB (Coming Soon)</div>} />
          <Route path="users" element={<div className="text-2xl font-bold">Quản Lý Users (Coming Soon)</div>} />
          <Route path="logs" element={<div className="text-2xl font-bold">Logs & Hoạt Động (Coming Soon)</div>} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
