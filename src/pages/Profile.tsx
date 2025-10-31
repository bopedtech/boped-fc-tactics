import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().max(100, "Tên đầy đủ không được quá 100 ký tự").optional(),
  display_name: z.string().max(50, "Tên hiển thị không được quá 50 ký tự").optional(),
  age: z.number().min(1, "Tuổi phải lớn hơn 0").max(120, "Tuổi không hợp lệ").optional().nullable(),
  bio: z.string().max(500, "Giới thiệu không được quá 500 ký tự").optional(),
  fc_mobile_experience: z.string().max(100).optional(),
  favorite_formation: z.string().max(50).optional(),
  favorite_position: z.string().max(20).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    display_name: "",
    age: null,
    bio: "",
    fc_mobile_experience: "Người mới",
    favorite_formation: "",
    favorite_position: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vui lòng đăng nhập để truy cập trang này");
        navigate("/auth");
        return;
      }

      setUser(user);
      await fetchProfile(user.id);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          display_name: data.display_name || "",
          age: data.age,
          bio: data.bio || "",
          fc_mobile_experience: data.fc_mobile_experience || "Người mới",
          favorite_formation: data.favorite_formation || "",
          favorite_position: data.favorite_position || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setSaving(true);

      // Validate form data
      const validatedData = profileSchema.parse(formData);

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...validatedData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Đã cập nhật profile thành công!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Error updating profile:", error);
        toast.error("Không thể cập nhật profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hồ Sơ Cá Nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <CardTitle>Thông Tin Cơ Bản</CardTitle>
              </div>
              <CardDescription>
                Cập nhật thông tin của bạn để cộng đồng dễ dàng kết nối
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Tên đầy đủ</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  maxLength={100}
                />
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Tên hiển thị</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleChange("display_name", e.target.value)}
                  placeholder="VanA_Gaming"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Tên này sẽ hiển thị công khai trong cộng đồng
                </p>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Tuổi</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => handleChange("age", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="25"
                  min="1"
                  max="120"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Chia sẻ một chút về bản thân bạn..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio?.length || 0}/500 ký tự
                </p>
              </div>

              {/* FC Mobile Experience */}
              <div className="space-y-2">
                <Label htmlFor="fc_mobile_experience">Kinh nghiệm chơi FC Mobile</Label>
                <Select
                  value={formData.fc_mobile_experience}
                  onValueChange={(value) => handleChange("fc_mobile_experience", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Người mới">Người mới (0-6 tháng)</SelectItem>
                    <SelectItem value="Trung bình">Trung bình (6-12 tháng)</SelectItem>
                    <SelectItem value="Có kinh nghiệm">Có kinh nghiệm (1-2 năm)</SelectItem>
                    <SelectItem value="Chuyên nghiệp">Chuyên nghiệp (2+ năm)</SelectItem>
                    <SelectItem value="Pro Player">Pro Player / Thi đấu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Favorite Formation */}
              <div className="space-y-2">
                <Label htmlFor="favorite_formation">Sơ đồ chiến thuật yêu thích</Label>
                <Select
                  value={formData.favorite_formation}
                  onValueChange={(value) => handleChange("favorite_formation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sơ đồ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-3-3">4-3-3</SelectItem>
                    <SelectItem value="4-4-2">4-4-2</SelectItem>
                    <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                    <SelectItem value="5-3-2">5-3-2</SelectItem>
                    <SelectItem value="4-1-2-1-2">4-1-2-1-2</SelectItem>
                    <SelectItem value="4-3-1-2">4-3-1-2</SelectItem>
                    <SelectItem value="3-4-3">3-4-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Favorite Position */}
              <div className="space-y-2">
                <Label htmlFor="favorite_position">Vị trí yêu thích</Label>
                <Select
                  value={formData.favorite_position}
                  onValueChange={(value) => handleChange("favorite_position", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GK">Thủ môn (GK)</SelectItem>
                    <SelectItem value="CB">Trung vệ (CB)</SelectItem>
                    <SelectItem value="LB">Hậu vệ trái (LB)</SelectItem>
                    <SelectItem value="RB">Hậu vệ phải (RB)</SelectItem>
                    <SelectItem value="CDM">Tiền vệ phòng ngự (CDM)</SelectItem>
                    <SelectItem value="CM">Tiền vệ trung tâm (CM)</SelectItem>
                    <SelectItem value="CAM">Tiền vệ tấn công (CAM)</SelectItem>
                    <SelectItem value="LW">Cánh trái (LW)</SelectItem>
                    <SelectItem value="RW">Cánh phải (RW)</SelectItem>
                    <SelectItem value="ST">Tiền đạo (ST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}