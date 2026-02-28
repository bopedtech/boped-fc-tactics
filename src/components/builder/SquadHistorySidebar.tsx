import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ChevronRight, Lock, Globe } from "lucide-react";
import { useT } from "@/contexts/LocalizationContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface SquadHistorySidebarProps {
  user: any;
  onSelectSquad: (squad: any) => void;
  currentSquadId?: string;
}

export default function SquadHistorySidebar({ user, onSelectSquad, currentSquadId }: SquadHistorySidebarProps) {
  const { t } = useT();
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSquads();
    }
  }, [user]);

  const fetchSquads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("squads")
      .select("*")
      .eq("userId", user.id)
      .order("updatedAt", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setSquads(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t("builder.confirmDelete", "Bạn có chắc chắn muốn xóa?"))) return;

    const { error } = await supabase.from("squads").delete().eq("id", id);
    if (error) {
      toast.error(t("builder.deleteError", "Lỗi xóa đội hình"));
    } else {
      toast.success(t("builder.deleteSuccess", "Đã xóa đội hình"));
      fetchSquads();
    }
  };

  if (!user) {
    return (
      <Card className="h-full p-6 flex flex-col items-center justify-center text-center space-y-4 bg-muted/30">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h3 className="font-semibold text-lg">{t("builder.loginRequired", "Cần đăng nhập")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("builder.loginPrompt", "Đăng nhập để xem và lưu lịch sử đội hình của bạn.")}
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-bold flex items-center">
          <ChevronRight className="w-4 h-4 mr-2" />
          {t("builder.history", "Đội hình của bạn")}
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        {loading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
        ) : squads.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t("builder.noSquads", "Chưa có đội hình nào")}
          </div>
        ) : (
          <div className="space-y-2">
            {squads.map((squad) => (
              <div
                key={squad.id}
                onClick={() => onSelectSquad(squad)}
                className={`
                  group p-3 rounded-md cursor-pointer border transition-all hover:bg-accent
                  ${currentSquadId === squad.id ? "bg-primary/10 border-primary" : "bg-card border-transparent hover:border-border"}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate max-w-[140px]" title={squad.squadName}>
                    {squad.squadName}
                  </span>
                  <div className="flex items-center space-x-1">
                    {squad.is_public ? <Globe className="w-3 h-3 text-blue-400" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                   <div className="text-xs text-muted-foreground">
                      {squad.formation} • OVR: {(() => {
                        try {
                           const data = typeof squad.lineup === 'string' ? JSON.parse(squad.lineup) : squad.lineup;
                           return Math.round(data?.players?.reduce((sum:any, p:any) => sum + (p.playerOvr || 0), 0) / 11) || 0;
                        } catch { return 0; }
                      })()}
                      <div className="text-[10px] mt-0.5 opacity-70">
                        {format(new Date(squad.updatedAt || squad.createdAt), "dd/MM/yyyy")}
                      </div>
                   </div>
                   <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                      onClick={(e) => handleDelete(e, squad.id)}
                   >
                     <Trash2 className="w-3 h-3" />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
