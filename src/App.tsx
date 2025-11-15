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
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import SyncData from "./pages/admin/SyncData";
import AdminSettings from "./pages/admin/Settings";
import PlayersManagement from "./pages/admin/PlayersManagement";
import LeaguesManagement from "./pages/admin/LeaguesManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import LogsActivity from "./pages/admin/LogsActivity";

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
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        
        {/* Admin Routes with Sidebar Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="players" element={<PlayersManagement />} />
          <Route path="sync" element={<SyncData />} />
          <Route path="leagues" element={<LeaguesManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="logs" element={<LogsActivity />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
