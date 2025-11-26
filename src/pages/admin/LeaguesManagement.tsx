import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Loader2, Trophy, Users, Plus, Edit, Trash2, Globe } from "lucide-react";

export default function LeaguesManagement() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [nations, setNations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formType, setFormType] = useState<"league" | "team" | "nation">("league");
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    displayName: "",
    localizationKey: "",
    image: "",
    leagueId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaguesRes, teamsRes, nationsRes] = await Promise.all([
        supabase.from("leagues").select("*").order("displayName"),
        supabase.from("teams").select("*").order("displayName"),
        supabase.from("nations").select("*").order("displayName"),
      ]);

      if (leaguesRes.error) throw leaguesRes.error;
      if (teamsRes.error) throw teamsRes.error;
      if (nationsRes.error) throw nationsRes.error;

      setLeagues(leaguesRes.data || []);
      setTeams(teamsRes.data || []);
      setNations(nationsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (items: any[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.displayName?.toLowerCase().includes(query)
    );
  };

  const filteredLeagues = filterItems(leagues);
  const filteredTeams = filterItems(teams);
  const filteredNations = filterItems(nations);

  const handleCreate = (type: "league" | "team" | "nation") => {
    setFormType(type);
    setSelectedItem(null);
    setFormData({
      id: "",
      displayName: "",
      localizationKey: "",
      image: "",
      leagueId: "",
    });
    setFormOpen(true);
  };

  const handleEdit = (item: any, type: "league" | "team" | "nation") => {
    setFormType(type);
    setSelectedItem(item);
    setFormData({
      id: item.id.toString(),
      displayName: item.displayName,
      localizationKey: item.localizationKey,
      image: item.image || "",
      leagueId: item.leagueId?.toString() || "",
    });
    setFormOpen(true);
  };

  const handleDelete = (item: any, type: "league" | "team" | "nation") => {
    setFormType(type);
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      const table = formType === "league" ? "leagues" : formType === "team" ? "teams" : "nations";
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast.success(`Đã xóa ${formType} thành công`);
      fetchData();
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(`Error deleting ${formType}:`, error);
      toast.error(`Không thể xóa ${formType}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const table = formType === "league" ? "leagues" : formType === "team" ? "teams" : "nations";
      const itemData: any = {
        displayName: formData.displayName,
        localizationKey: formData.localizationKey,
        image: formData.image || null,
        rawData: {},
      };

      if (formType === "team") {
        itemData.leagueId = formData.leagueId ? parseInt(formData.leagueId) : null;
      }

      if (selectedItem) {
        // Update
        const { error } = await supabase
          .from(table)
          .update(itemData)
          .eq("id", selectedItem.id);

        if (error) throw error;
        toast.success(`Cập nhật ${formType} thành công`);
      } else {
        // Create
        itemData.id = parseInt(formData.id);
        const { error } = await supabase
          .from(table)
          .insert(itemData);

        if (error) throw error;
        toast.success(`Tạo ${formType} mới thành công`);
      }

      fetchData();
      setFormOpen(false);
    } catch (error) {
      console.error(`Error saving ${formType}:`, error);
      toast.error(selectedItem ? `Không thể cập nhật ${formType}` : `Không thể tạo ${formType}`);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Giải Đấu & Câu Lạc Bộ</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin giải đấu, câu lạc bộ và quốc gia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Giải Đấu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leagues.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Câu Lạc Bộ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quốc Gia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{nations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="leagues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leagues">
            <Trophy className="h-4 w-4 mr-2" />
            Giải Đấu
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            Câu Lạc Bộ
          </TabsTrigger>
          <TabsTrigger value="nations">
            Quốc Gia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leagues">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh Sách Giải Đấu</CardTitle>
                <CardDescription>
                  {filteredLeagues.length} giải đấu
                </CardDescription>
              </div>
              <Button onClick={() => handleCreate("league")}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Giải Đấu
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Localization Key</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeagues.map((league) => (
                      <TableRow key={league.id}>
                        <TableCell className="font-mono text-xs">{league.id}</TableCell>
                        <TableCell className="font-medium">{league.displayName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {league.localizationKey}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(league.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(league, "league")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(league, "league")}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh Sách Câu Lạc Bộ</CardTitle>
                <CardDescription>
                  {filteredTeams.length} câu lạc bộ
                </CardDescription>
              </div>
              <Button onClick={() => handleCreate("team")}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo CLB
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>League ID</TableHead>
                      <TableHead>Localization Key</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-mono text-xs">{team.id}</TableCell>
                        <TableCell className="font-medium">{team.displayName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {team.leagueId || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {team.localizationKey}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(team.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(team, "team")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(team, "team")}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh Sách Quốc Gia</CardTitle>
                <CardDescription>
                  {filteredNations.length} quốc gia
                </CardDescription>
              </div>
              <Button onClick={() => handleCreate("nation")}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Quốc Gia
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Localization Key</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNations.map((nation) => (
                      <TableRow key={nation.id}>
                        <TableCell className="font-mono text-xs">{nation.id}</TableCell>
                        <TableCell className="font-medium">{nation.displayName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {nation.localizationKey}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(nation.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(nation, "nation")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(nation, "nation")}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem 
                ? `Chỉnh Sửa ${formType === "league" ? "Giải Đấu" : formType === "team" ? "CLB" : "Quốc Gia"}` 
                : `Tạo ${formType === "league" ? "Giải Đấu" : formType === "team" ? "CLB" : "Quốc Gia"} Mới`}
            </DialogTitle>
            <DialogDescription>
              {selectedItem ? "Cập nhật thông tin" : "Thêm mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID *</Label>
              <Input
                id="id"
                type="number"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!selectedItem}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizationKey">Localization Key *</Label>
              <Input
                id="localizationKey"
                value={formData.localizationKey}
                onChange={(e) => setFormData({ ...formData, localizationKey: e.target.value })}
                required
              />
            </div>

            {formType === "team" && (
              <div className="space-y-2">
                <Label htmlFor="leagueId">League ID</Label>
                <Input
                  id="leagueId"
                  type="number"
                  value={formData.leagueId}
                  onChange={(e) => setFormData({ ...formData, leagueId: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={formLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedItem ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{selectedItem?.displayName}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}