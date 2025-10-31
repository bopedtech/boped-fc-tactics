import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Loader2, Shield, Eye, UserX, UserCheck } from "lucide-react";

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch profiles and roles
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles(profilesRes.data || []);

      // Create roles map
      const rolesMap = new Map<string, string[]>();
      (rolesRes.data || []).forEach((role: any) => {
        const existing = rolesMap.get(role.user_id) || [];
        rolesMap.set(role.user_id, [...existing, role.role]);
      });
      setUserRoles(rolesMap);

      // Fetch auth users (admin only)
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      setUsers(authData.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: any) => {
    const profile = profiles.find((p) => p.user_id === user.id);
    setSelectedUser(user);
    setSelectedProfile(profile);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      profiles.find((p) => p.user_id === user.id)?.display_name?.toLowerCase().includes(query)
    );
  });

  const getUserRoles = (userId: string) => {
    return userRoles.get(userId) || [];
  };

  const getProfile = (userId: string) => {
    return profiles.find((p) => p.user_id === userId);
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
        <h1 className="text-4xl font-bold mb-2">Quản Lý Người Dùng</h1>
        <p className="text-muted-foreground">
          Quản lý tài khoản người dùng và phân quyền
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Array.from(userRoles.values()).filter((roles) =>
                roles.includes("super_admin")
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Có Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {users.filter((u) => {
                const lastSignIn = new Date(u.last_sign_in_at || 0);
                const today = new Date();
                return lastSignIn.toDateString() === today.toDateString();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo email hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Người Dùng</CardTitle>
          <CardDescription>{filteredUsers.length} người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tên hiển thị</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Đăng ký</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const profile = getProfile(user.id);
                  const roles = getUserRoles(user.id);

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{profile?.display_name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <Badge key={role} variant="secondary">
                                <Shield className="h-3 w-3 mr-1" />
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">user</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleString("vi-VN")
                          : "Chưa đăng nhập"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày đăng ký</p>
                  <p>{new Date(selectedUser.created_at).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đăng nhập cuối</p>
                  <p>
                    {selectedUser.last_sign_in_at
                      ? new Date(selectedUser.last_sign_in_at).toLocaleString("vi-VN")
                      : "Chưa đăng nhập"}
                  </p>
                </div>
              </div>

              {selectedProfile && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Thông Tin Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tên hiển thị</p>
                        <p>{selectedProfile.display_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tên đầy đủ</p>
                        <p>{selectedProfile.full_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tuổi</p>
                        <p>{selectedProfile.age || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Kinh nghiệm</p>
                        <p>{selectedProfile.fc_mobile_experience || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sơ đồ yêu thích</p>
                        <p>{selectedProfile.favorite_formation || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Vị trí yêu thích</p>
                        <p>{selectedProfile.favorite_position || "-"}</p>
                      </div>
                    </div>
                    {selectedProfile.bio && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Giới thiệu</p>
                        <p className="mt-1 text-sm">{selectedProfile.bio}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {getUserRoles(selectedUser.id).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Quyền hạn</h3>
                  <div className="flex gap-2">
                    {getUserRoles(selectedUser.id).map((role) => (
                      <Badge key={role} variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}