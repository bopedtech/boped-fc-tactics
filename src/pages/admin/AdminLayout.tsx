import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Loader2, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang xác thực quyền truy cập...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-4">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-6 w-6" />
                <CardTitle>Truy Cập Bị Từ Chối</CardTitle>
              </div>
              <CardDescription>
                Bạn không có quyền truy cập vào trang quản trị
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Trang này chỉ dành cho quản trị viên hệ thống. Nếu bạn cho rằng đây là lỗi, 
                vui lòng liên hệ với quản trị viên.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Quay về trang chủ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full min-h-[calc(100vh-4rem)]">
          <AdminSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <SidebarTrigger />
              <div className="ml-4 flex-1">
                <h2 className="text-lg font-semibold">Quản Trị Hệ Thống</h2>
              </div>
            </div>
            
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}