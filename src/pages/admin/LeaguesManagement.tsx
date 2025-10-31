import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Loader2, Trophy, Users } from "lucide-react";

export default function LeaguesManagement() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [nations, setNations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
            <CardHeader>
              <CardTitle>Danh Sách Giải Đấu</CardTitle>
              <CardDescription>
                {filteredLeagues.length} giải đấu
              </CardDescription>
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
            <CardHeader>
              <CardTitle>Danh Sách Câu Lạc Bộ</CardTitle>
              <CardDescription>
                {filteredTeams.length} câu lạc bộ
              </CardDescription>
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
            <CardHeader>
              <CardTitle>Danh Sách Quốc Gia</CardTitle>
              <CardDescription>
                {filteredNations.length} quốc gia
              </CardDescription>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}