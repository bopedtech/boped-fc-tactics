import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import Header from "@/components/Header";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <AdminSidebar />
          
          <SidebarInset>
            <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <SidebarTrigger />
              <div className="ml-4 flex-1">
                <h2 className="text-lg font-semibold">Quản Trị Hệ Thống</h2>
              </div>
            </div>
            
            <main className="flex-1 p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}