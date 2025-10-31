import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [settings, setSettings] = useState({
    showPlayerRatings: true,
    showPlayerPrices: true,
    enablePublicDatabase: true,
    allowUserSquads: true,
    maintenanceMode: false,
    enableAIAdvisor: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    toast.success("Đã lưu cài đặt thành công!");
    setHasChanges(false);
  };

  const settingsGroups = [
    {
      title: "Hiển Thị Dữ Liệu",
      description: "Điều khiển dữ liệu nào được hiển thị cho người dùng",
      settings: [
        {
          key: "showPlayerRatings" as const,
          label: "Hiển thị Rating cầu thủ",
          description: "Cho phép người dùng xem rating của cầu thủ",
          icon: Eye,
        },
        {
          key: "showPlayerPrices" as const,
          label: "Hiển thị giá cầu thủ",
          description: "Hiển thị thông tin giá trị thị trường",
          icon: Eye,
        },
        {
          key: "enablePublicDatabase" as const,
          label: "Database công khai",
          description: "Cho phép truy cập database không cần đăng nhập",
          icon: Eye,
        },
      ],
    },
    {
      title: "Tính Năng Hệ Thống",
      description: "Bật/tắt các tính năng chính của hệ thống",
      settings: [
        {
          key: "allowUserSquads" as const,
          label: "Cho phép tạo đội hình",
          description: "Người dùng có thể tạo và lưu đội hình",
          icon: SettingsIcon,
        },
        {
          key: "enableAIAdvisor" as const,
          label: "Bật AI Advisor",
          description: "Sử dụng AI để gợi ý cầu thủ và đội hình",
          icon: SettingsIcon,
        },
        {
          key: "maintenanceMode" as const,
          label: "Chế độ bảo trì",
          description: "Tạm khóa truy cập cho người dùng thường",
          icon: EyeOff,
          variant: "destructive" as const,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Cài Đặt Hệ Thống</h1>
          <p className="text-muted-foreground">
            Quản lý cấu hình và hiển thị dữ liệu cho người dùng
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Lưu Thay Đổi
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {group.settings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between space-x-4 p-4 rounded-lg border"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <setting.icon
                      className={`h-5 w-5 mt-0.5 ${
                        setting.variant === "destructive"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={setting.key}
                        className="text-base font-medium cursor-pointer"
                      >
                        {setting.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={setting.key}
                    checked={settings[setting.key]}
                    onCheckedChange={() => handleToggle(setting.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Hệ Thống</CardTitle>
          <CardDescription>Chi tiết về phiên bản và cấu hình</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phiên bản:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database:</span>
            <span className="font-medium">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Framework:</span>
            <span className="font-medium">React + Vite</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Môi trường:</span>
            <span className="font-medium">Production</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}