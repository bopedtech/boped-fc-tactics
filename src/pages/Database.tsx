import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: number;
  name: string;
  ovr: number;
  position: string;
  nation?: string;
  club?: string;
  image_url?: string;
  stats: any;
  traits?: any;
  work_rate_att?: string;
  work_rate_def?: string;
  created_at?: string;
}

const positions = ["GK", "LB", "CB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"];

export default function Database() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [ovrRange, setOvrRange] = useState([100, 120]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("ovr", { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu cầu thủ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      let query = supabase.from("players").select("*");

      if (searchName) {
        query = query.ilike("name", `%${searchName}%`);
      }

      if (selectedPosition !== "all") {
        query = query.eq("position", selectedPosition);
      }

      query = query.gte("ovr", ovrRange[0]).lte("ovr", ovrRange[1]);

      const { data, error } = await query.order("ovr", { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      toast.error("Có lỗi khi lọc dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchName("");
    setSelectedPosition("all");
    setOvrRange([100, 120]);
    fetchPlayers();
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Cơ sở dữ liệu cầu thủ FC Mobile
          </h1>
          <p className="text-muted-foreground">
            Khám phá và tìm kiếm cầu thủ cho đội hình FC Mobile của bạn
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-lg border p-6 space-y-6 sticky top-20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search by Name */}
              <div className="space-y-2">
                <Label htmlFor="search-name">Tìm theo tên</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-name"
                    placeholder="Tên cầu thủ..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter by Position */}
              <div className="space-y-2">
                <Label>Vị trí</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Tất cả vị trí</SelectItem>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by OVR Range */}
              <div className="space-y-2">
                <Label>Chỉ số OVR: {ovrRange[0]} - {ovrRange[1]}</Label>
                <Slider
                  min={80}
                  max={120}
                  step={1}
                  value={ovrRange}
                  onValueChange={setOvrRange}
                  className="mt-4"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button onClick={applyFilters} className="w-full gradient-primary">
                  Áp dụng
                </Button>
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  Đặt lại
                </Button>
              </div>
            </div>
          </div>

          {/* Player Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              <p className="text-sm text-muted-foreground">
                {players.length} cầu thủ
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-card animate-pulse rounded-lg" />
                ))}
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  Không tìm thấy cầu thủ nào
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
