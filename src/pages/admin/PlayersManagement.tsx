import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Trash2, Edit, Eye, Loader2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function PlayersManagement() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 20;

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, positionFilter, ratingFilter, players]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("rating", { ascending: false })
        .limit(500);

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Không thể tải danh sách cầu thủ");
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = [...players];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName?.toLowerCase().includes(query) ||
          p.lastName?.toLowerCase().includes(query) ||
          p.commonName?.toLowerCase().includes(query) ||
          p.cardName?.toLowerCase().includes(query)
      );
    }

    // Position filter
    if (positionFilter !== "all") {
      filtered = filtered.filter((p) => p.position === positionFilter);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const minRating = parseInt(ratingFilter);
      const maxRating = minRating + 9;
      filtered = filtered.filter((p) => p.rating >= minRating && p.rating <= maxRating);
    }

    setFilteredPlayers(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!playerToDelete) return;

    try {
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("assetId", playerToDelete.assetId);

      if (error) throw error;

      toast.success("Đã xóa cầu thủ thành công");
      setPlayers(players.filter((p) => p.assetId !== playerToDelete.assetId));
      setDeleteDialogOpen(false);
      setPlayerToDelete(null);
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error("Không thể xóa cầu thủ");
    }
  };

  const positions = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST", "CF"];
  const ratingRanges = [
    { label: "90+", value: "90" },
    { label: "80-89", value: "80" },
    { label: "70-79", value: "70" },
    { label: "60-69", value: "60" },
    { label: "<60", value: "0" },
  ];

  // Pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  const getPlayerName = (player: any) => {
    return player.cardName || player.commonName || `${player.firstName} ${player.lastName}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Quản Lý Cầu Thủ</h1>
        <p className="text-muted-foreground">
          Quản lý và chỉnh sửa thông tin cầu thủ trong database
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng Cầu Thủ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{players.length.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Kết Quả Lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredPlayers.length.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trung Bình Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {players.length > 0
                ? (players.reduce((sum, p) => sum + p.rating, 0) / players.length).toFixed(1)
                : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc & Tìm Kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên cầu thủ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vị trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vị trí</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rating</SelectItem>
                {ratingRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setPositionFilter("all");
              setRatingFilter("all");
            }}>
              Xóa lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Cầu Thủ</CardTitle>
          <CardDescription>
            Hiển thị {currentPlayers.length} / {filteredPlayers.length} cầu thủ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Quốc gia</TableHead>
                      <TableHead>CLB</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPlayers.map((player) => (
                      <TableRow key={player.assetId}>
                        <TableCell className="font-mono text-xs">{player.assetId}</TableCell>
                        <TableCell className="font-medium">{getPlayerName(player)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              player.rating >= 90
                                ? "default"
                                : player.rating >= 80
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {player.rating}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(player.nation as any)?.id || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(player.club as any)?.id || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPlayer(player)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPlayerToDelete(player);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Player Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlayer && getPlayerName(selectedPlayer)}</DialogTitle>
            <DialogDescription>Chi tiết thông tin cầu thủ</DialogDescription>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Asset ID</p>
                  <p className="font-mono">{selectedPlayer.assetId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Player ID</p>
                  <p className="font-mono">{selectedPlayer.playerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vị trí</p>
                  <p>{selectedPlayer.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{selectedPlayer.rating}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chiều cao</p>
                  <p>{selectedPlayer.height} cm</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cân nặng</p>
                  <p>{selectedPlayer.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chân thuận</p>
                  <p>{selectedPlayer.foot === 1 ? "Phải" : selectedPlayer.foot === 2 ? "Trái" : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chân phụ</p>
                  <p>{selectedPlayer.weakFoot} ⭐</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cầu thủ{" "}
              <span className="font-bold">{playerToDelete && getPlayerName(playerToDelete)}</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}