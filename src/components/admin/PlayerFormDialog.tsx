import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PlayerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player?: any;
  onSuccess: () => void;
}

export default function PlayerFormDialog({ open, onOpenChange, player, onSuccess }: PlayerFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [nations, setNations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    commonName: "",
    cardName: "",
    position: "",
    rating: 75,
    height: 180,
    weight: 75,
    foot: 1,
    weakFoot: 3,
    skillMovesLevel: 3,
    nationId: "",
    clubId: "",
    programId: "",
    bio: "",
  });

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (player) {
      setFormData({
        firstName: player.firstName || "",
        lastName: player.lastName || "",
        commonName: player.commonName || "",
        cardName: player.cardName || "",
        position: player.position || "",
        rating: player.rating || 75,
        height: player.height || 180,
        weight: player.weight || 75,
        foot: player.foot || 1,
        weakFoot: player.weakFoot || 3,
        skillMovesLevel: player.skillMovesLevel || 3,
        nationId: player.nation?.id || "",
        clubId: player.club?.id || "",
        programId: player.source || "",
        bio: player.bio || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        firstName: "",
        lastName: "",
        commonName: "",
        cardName: "",
        position: "",
        rating: 75,
        height: 180,
        weight: 75,
        foot: 1,
        weakFoot: 3,
        skillMovesLevel: 3,
        nationId: "",
        clubId: "",
        programId: "",
        bio: "",
      });
    }
  }, [player]);

  const fetchReferenceData = async () => {
    try {
      const [nationsRes, teamsRes, programsRes] = await Promise.all([
        supabase.from("nations").select("id, displayName").order("displayName"),
        supabase.from("teams").select("id, displayName").order("displayName"),
        supabase.from("programs").select("id, displayName").order("displayName"),
      ]);

      if (nationsRes.data) setNations(nationsRes.data);
      if (teamsRes.data) setTeams(teamsRes.data);
      if (programsRes.data) setPrograms(programsRes.data);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const playerData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        commonName: formData.commonName,
        cardName: formData.cardName,
        position: formData.position,
        rating: parseInt(formData.rating.toString()),
        height: parseInt(formData.height.toString()),
        weight: parseInt(formData.weight.toString()),
        foot: parseInt(formData.foot.toString()),
        weakFoot: parseInt(formData.weakFoot.toString()),
        skillMovesLevel: parseInt(formData.skillMovesLevel.toString()),
        bio: formData.bio,
        nation: formData.nationId ? { id: parseInt(formData.nationId) } : null,
        club: formData.clubId ? { id: parseInt(formData.clubId) } : null,
        source: formData.programId || null,
        rawData: {},
        is_visible: true,
      };

      if (player) {
        // Update existing player
        const { error } = await supabase
          .from("players")
          .update(playerData)
          .eq("assetId", player.assetId);

        if (error) throw error;
        toast.success("Cập nhật cầu thủ thành công");
      } else {
        // Create new player
        // Generate unique assetId and playerId
        const assetId = Date.now();
        playerData.assetId = assetId;
        playerData.playerId = assetId;

        const { error } = await supabase
          .from("players")
          .insert(playerData);

        if (error) throw error;
        toast.success("Tạo cầu thủ mới thành công");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving player:", error);
      toast.error(player ? "Không thể cập nhật cầu thủ" : "Không thể tạo cầu thủ mới");
    } finally {
      setLoading(false);
    }
  };

  const positions = ["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{player ? "Chỉnh Sửa Cầu Thủ" : "Tạo Cầu Thủ Mới"}</DialogTitle>
          <DialogDescription>
            {player ? "Cập nhật thông tin cầu thủ" : "Thêm cầu thủ mới vào database"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Tên</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Họ</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commonName">Tên thường gọi</Label>
              <Input
                id="commonName"
                value={formData.commonName}
                onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Tên trên thẻ</Label>
              <Input
                id="cardName"
                value={formData.cardName}
                onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Vị trí</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (OVR)</Label>
              <Input
                id="rating"
                type="number"
                min="40"
                max="125"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input
                id="height"
                type="number"
                min="150"
                max="210"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Cân nặng (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="50"
                max="110"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foot">Chân thuận (1: Phải, 2: Trái)</Label>
              <Select value={formData.foot.toString()} onValueChange={(value) => setFormData({ ...formData, foot: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Phải</SelectItem>
                  <SelectItem value="2">Trái</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weakFoot">Chân yếu (1-5⭐)</Label>
              <Input
                id="weakFoot"
                type="number"
                min="1"
                max="5"
                value={formData.weakFoot}
                onChange={(e) => setFormData({ ...formData, weakFoot: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillMovesLevel">Kỹ năng (1-5⭐)</Label>
              <Input
                id="skillMovesLevel"
                type="number"
                min="1"
                max="5"
                value={formData.skillMovesLevel}
                onChange={(e) => setFormData({ ...formData, skillMovesLevel: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationId">Quốc gia</Label>
              <Select value={formData.nationId} onValueChange={(value) => setFormData({ ...formData, nationId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quốc gia" />
                </SelectTrigger>
                <SelectContent>
                  {nations.map((nation) => (
                    <SelectItem key={nation.id} value={nation.id.toString()}>{nation.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clubId">Câu lạc bộ</Label>
              <Select value={formData.clubId} onValueChange={(value) => setFormData({ ...formData, clubId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn CLB" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>{team.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="programId">Program</Label>
              <Select value={formData.programId} onValueChange={(value) => setFormData({ ...formData, programId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>{program.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {player ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
