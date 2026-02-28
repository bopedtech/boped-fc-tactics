import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useT } from "@/contexts/LocalizationContext";

export default function CommunitySquads() {
  const { t } = useT();
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunitySquads();
  }, []);

  const fetchCommunitySquads = async () => {
    try {
      const { data, error } = await supabase
        .from("squads")
        .select("*")
        .order("createdAt", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSquads(data || []);
    } catch (err) {
      console.error("Error fetching community squads", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="mt-12 mb-20 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        {t("builder.communitySquads", "Đội hình cộng đồng")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {squads.length === 0 && !loading && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            Chưa có đội hình nào được chia sẻ.
          </div>
        )}
        
        {squads.map((squad) => (
          <Card key={squad.id} className="group overflow-hidden hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="font-bold text-lg truncate pr-2" title={squad.squadName}>{squad.squadName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center">
                       {squad.userId ? `ID: ${squad.userId.slice(0, 8)}...` : "Unknown"}
                    </p>
                 </div>
                 <div className="px-2 py-1 bg-primary/10 rounded text-xs font-bold text-primary">
                    OVR: {(() => {
                      try {
                         const data = typeof squad.lineup === 'string' ? JSON.parse(squad.lineup) : squad.lineup;
                         return Math.round(data?.players?.reduce((a:any, b:any) => a + (b.playerOvr || 0), 0) / 11) || "?";
                      } catch { return "?"; }
                    })()}
                 </div>
              </div>

              <div className="text-sm text-muted-foreground flex items-center justify-between">
                 <span>{squad.formation}</span>
                 <span className="flex items-center text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(squad.createdAt), "dd/MM")}
                 </span>
              </div>

              <div className="pt-2 flex justify-end items-center border-t border-border/50">
                 <Button size="sm" variant="outline" className="text-xs">
                    Xem & Copy
                 </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
