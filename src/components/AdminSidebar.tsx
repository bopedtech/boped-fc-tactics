import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Database,
  Trophy,
  Settings,
  Activity,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/admin", 
    icon: LayoutDashboard,
    exact: true 
  },
  { 
    title: "Quản Lý Cầu Thủ", 
    url: "/admin/players", 
    icon: Users 
  },
  { 
    title: "Đồng Bộ Dữ Liệu", 
    url: "/admin/sync", 
    icon: Database 
  },
  { 
    title: "Giải Đấu & CLB", 
    url: "/admin/leagues", 
    icon: Trophy 
  },
  { 
    title: "Quản Lý Users", 
    url: "/admin/users", 
    icon: Shield 
  },
  { 
    title: "Logs & Hoạt Động", 
    url: "/admin/logs", 
    icon: Activity 
  },
  { 
    title: "Cài Đặt Hệ Thống", 
    url: "/admin/settings", 
    icon: Settings 
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Về Trang Chủ</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            {isCollapsed ? "CMS" : "Bảng Điều Khiển CMS"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted/50"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}