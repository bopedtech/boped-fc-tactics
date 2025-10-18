import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

const formations = [
  "4-3-3 Attack",
  "4-4-2",
  "4-3-3 Defend",
  "4-2-3-1",
  "4-1-2-1-2",
  "3-5-2",
  "5-3-2",
  "4-3-2-1",
];

export default function Builder() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [squadName, setSquadName] = useState("");
  const [formation, setFormation] = useState("4-3-3 Attack");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vui lòng đăng nhập để sử dụng Squad Builder");
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const handleSave = async () => {
    if (!squadName.trim()) {
      toast.error("Vui lòng nhập tên đội hình");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      navigate("/auth");
      return;
    }

    try {
      setSaving(true);

      // Mock lineup - in a full implementation, this would come from the drag-drop state
      const mockLineup = {
        formation,
        positions: [],
      };

      const { error } = await supabase.from("squads").insert({
        user_id: user.id,
        squad_name: squadName,
        formation,
        lineup: mockLineup,
      });

      if (error) throw error;

      toast.success("Đã lưu đội hình!");
      navigate("/my-squads");
    } catch (error: any) {
      toast.error("Không thể lưu đội hình");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Squad Builder
          </h1>
          <p className="text-muted-foreground">
            Xây dựng đội hình tối ưu của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="squad-name">Tên đội hình</Label>
                <Input
                  id="squad-name"
                  placeholder="Đội hình của tôi..."
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Sơ đồ chiến thuật</Label>
                <Select value={formation} onValueChange={setFormation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {formations.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full gradient-primary"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu đội hình"}
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Hướng dẫn</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Chọn sơ đồ chiến thuật phù hợp</li>
                <li>• Đặt tên cho đội hình</li>
                <li>• Kéo thả cầu thủ vào vị trí</li>
                <li>• Phân tích với AI để tối ưu</li>
              </ul>
            </Card>
          </div>

          {/* Pitch View */}
          <div className="lg:col-span-2">
            <Card className="p-6 min-h-[600px] bg-pitch-green/20 border-pitch-green/30">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">⚽</div>
                  <h2 className="text-2xl font-bold mb-2">{formation}</h2>
                  <p className="text-muted-foreground mb-6">
                    Tính năng kéo thả đang được phát triển
                  </p>
                  <div className="inline-block px-6 py-3 bg-accent/20 border border-accent/30 rounded-lg">
                    <p className="text-accent-foreground font-medium">
                      📋 Sơ đồ hiện tại: {formation}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
