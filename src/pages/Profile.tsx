import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/contexts/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Save, User, Upload, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().max(100, "Tên đầy đủ không được quá 100 ký tự").optional(),
  display_name: z.string().max(50, "Tên hiển thị không được quá 50 ký tự").optional(),
  age: z.number().min(1, "Tuổi phải lớn hơn 0").max(120, "Tuổi không hợp lệ").optional().nullable(),
  bio: z.string().max(500, "Giới thiệu không được quá 500 ký tự").optional(),
  fc_mobile_experience: z.string().max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Squad {
  id: string;
  squadName: string;
  formation: string;
  lineup: any;
  playstyle?: string;
  createdAt: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useT();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [squadsLoading, setSquadsLoading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    display_name: "",
    age: null,
    bio: "",
    fc_mobile_experience: "Người mới",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t("profile.toast.loginRequired"));
        navigate("/auth");
        return;
      }

      setUser(user);
      await fetchProfile(user.id);
      await fetchSquads(user.id);
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
        });
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(t("profile.toast.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchSquads = async (userId: string) => {
    try {
      setSquadsLoading(true);
      const { data, error } = await supabase
        .from("squads")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      setSquads(data || []);
    } catch (error: any) {
      toast.error(t("profile.toast.loadError"));
      console.error(error);
    } finally {
      setSquadsLoading(false);
    }
  };

  const deleteSquad = async (id: string) => {
    try {
      const { error } = await supabase.from("squads").delete().eq("id", id);

      if (error) throw error;

      setSquads(squads.filter((s) => s.id !== id));
      toast.success(t("profile.toast.squadDeleted"));
    } catch (error: any) {
      toast.error(t("profile.toast.squadDeleteError"));
      console.error(error);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };

    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  const handleCroppedImage = async (croppedImageBlob: Blob) => {
    if (!user) return;

    try {
      setUploading(true);

      const fileName = `avatar.jpg`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL with timestamp to force refresh
      const timestamp = new Date().getTime();
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const finalUrl = `${publicUrl}?t=${timestamp}`;

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: finalUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(finalUrl);
      toast.success(t("profile.toast.avatarUpdated"));

      // Trigger event to update avatar in Header
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatarUrl: finalUrl } }));
    } catch (error: any) {
      toast.error(t("profile.toast.avatarError"));
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSaving(true);

      // Validate form data
      const validatedData = profileSchema.parse(formData);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            ...validatedData,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            ...validatedData,
          });

        if (error) throw error;
      }

      toast.success(t("profile.toast.updateSuccess"));
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Error updating profile:", error);
        toast.error(t("profile.toast.updateError"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'age' ? (value ? parseInt(value) : null) : value
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

      <div className="container mx-auto py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t("profile.tabs.profile")}</TabsTrigger>
            <TabsTrigger value="squads">{t("profile.tabs.squads")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-6 w-6" />
                    <CardTitle>{t("profile.card.title")}</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {t("profile.card.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback>
                        {formData.display_name?.charAt(0)?.toUpperCase() || <User className="h-12 w-12" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                        disabled={uploading}
                      />
                      <Label htmlFor="avatar-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploading}
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("profile.uploading")}
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              {t("profile.uploadAvatar")}
                            </>
                          )}
                        </Button>
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">{t("profile.displayName")}</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name || ""}
                      onChange={handleChange}
                      placeholder={t("profile.displayName.placeholder")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t("profile.fullName")}</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name || ""}
                        onChange={handleChange}
                        placeholder={t("profile.fullName.placeholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">{t("profile.age")}</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age || ""}
                        onChange={handleChange}
                        placeholder={t("profile.age.placeholder")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fc_mobile_experience">{t("profile.experience")}</Label>
                    <Select
                      value={formData.fc_mobile_experience}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fc_mobile_experience: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Người mới">{t("profile.experience.beginner")}</SelectItem>
                        <SelectItem value="Trung bình">{t("profile.experience.intermediate")}</SelectItem>
                        <SelectItem value="Có kinh nghiệm">{t("profile.experience.experienced")}</SelectItem>
                        <SelectItem value="Chuyên nghiệp">{t("profile.experience.professional")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">{t("profile.bio")}</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ""}
                      onChange={handleChange}
                      placeholder={t("profile.bio.placeholder")}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 gradient-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("profile.saving")}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t("profile.saveChanges")}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                    >
                      {t("profile.cancel")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="squads">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{t("profile.squads.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("profile.squads.description")}
                  </p>
                </div>
                <Button
                  className="gradient-primary"
                  onClick={() => navigate("/builder")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("profile.squads.createNew")}
                </Button>
              </div>

              {squadsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-card animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : squads.length === 0 ? (
                <Card className="p-16">
                  <div className="text-center">
                    <div className="mb-4 text-6xl">⚽</div>
                    <h3 className="text-2xl font-bold mb-2">{t("profile.squads.empty")}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t("profile.squads.empty.subtitle")}
                    </p>
                    <Button
                      className="gradient-primary"
                      onClick={() => navigate("/builder")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("profile.squads.empty.create")}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {squads.map((squad) => (
                    <Card key={squad.id} className="p-6 card-hover">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-1">{squad.squadName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.squads.formation")} {squad.formation}
                        </p>
                        {squad.playstyle && (
                          <p className="text-sm text-muted-foreground">
                            {t("profile.squads.playstyle")} {squad.playstyle}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/builder?squad=${squad.id}`)}
                        >
                          {t("profile.squads.edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteSquad(squad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AvatarCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCroppedImage}
      />
    </div>
  );
}