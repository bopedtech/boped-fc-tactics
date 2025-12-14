import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Loader2, Shield, Eye, UserX, UserCheck, Trash2, Ban, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  profile: any;
  roles: string[];
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
      });

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (user: User) => {
    const isBanned = !!user.banned_until;
    setActionLoading(user.id);

    try {
      const { error } = await supabase.functions.invoke('admin-users/toggle-ban', {
        method: 'POST',
        body: { userId: user.id, ban: !isBanned },
      });

      if (error) throw error;

      toast.success(isBanned ? "Đã bỏ cấm người dùng" : "Đã cấm người dùng");
      fetchUsers();
    } catch (error) {
      console.error("Error toggling ban:", error);
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete.id);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'DELETE',
        body: { userId: userToDelete.id },
      });

      if (error) throw error;

      toast.success("Đã xóa người dùng");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Không thể xóa người dùng");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.functions.invoke('admin-users/add-role', {
        method: 'POST',
        body: { userId, role },
      });

      if (error) throw error;

      toast.success("Đã thêm quyền");
      fetchUsers();
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Không thể thêm quyền");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.functions.invoke('admin-users/remove-role', {
        method: 'POST',
        body: { userId, role },
      });

      if (error) throw error;

      toast.success("Đã xóa quyền");
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Không thể xóa quyền");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.profile?.display_name?.toLowerCase().includes(query)
    );
  });

  const adminCount = users.filter(u => u.roles.includes('super_admin') || u.roles.includes('admin')).length;
  const bannedCount = users.filter(u => !!u.banned_until).length;
  const activeToday = users.filter(u => {
    if (!u.last_sign_in_at) return false;
    const lastSignIn = new Date(u.last_sign_in_at);
    const today = new Date();
    return lastSignIn.toDateString() === today.toDateString();
  }).length;

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
            <div className="text-3xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bị cấm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{bannedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{activeToday}</div>
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
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isBanned = !!user.banned_until;
                  const isLoading = actionLoading === user.id;

                  return (
                    <TableRow key={user.id} className={isBanned ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.profile?.display_name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
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
                      <TableCell>
                        {isBanned ? (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Bị cấm
                          </Badge>
                        ) : user.email_confirmed_at ? (
                          <Badge variant="default" className="bg-green-600">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Chưa xác nhận</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleString("vi-VN")
                          : "Chưa đăng nhập"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedUser(user)}
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleBan(user)}
                            disabled={isLoading}
                          >
                            {isBanned ? (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Ban className="h-4 w-4 text-orange-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

              {selectedUser.profile && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Thông Tin Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tên hiển thị</p>
                      <p>{selectedUser.profile.display_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tên đầy đủ</p>
                      <p>{selectedUser.profile.full_name || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Quyền hạn</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedUser.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {role}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/20"
                        onClick={() => handleRemoveRole(selectedUser.id, role)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                  {!selectedUser.roles.includes('admin') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRole(selectedUser.id, 'admin')}
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Thêm Admin
                    </Button>
                  )}
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
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <span className="font-bold">{userToDelete?.email}</span>?
              Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
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