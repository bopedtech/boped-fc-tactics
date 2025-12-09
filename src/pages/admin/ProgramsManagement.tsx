import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Loader2, Plus, Edit, Trash2, Package } from "lucide-react";

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    displayName: "",
    localizationKey: "",
    image: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("displayName");

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Không thể tải danh sách program");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProgram(null);
    setFormData({
      id: "",
      displayName: "",
      localizationKey: "",
      image: "",
    });
    setFormOpen(true);
  };

  const handleEdit = (program: any) => {
    setSelectedProgram(program);
    setFormData({
      id: program.id,
      displayName: program.displayName,
      localizationKey: program.localizationKey,
      image: program.image || "",
    });
    setFormOpen(true);
  };

  const handleDelete = (program: any) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProgram) return;

    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", selectedProgram.id);

      if (error) throw error;

      toast.success("Đã xóa program thành công");
      fetchPrograms();
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Không thể xóa program");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const programData = {
        id: formData.id,
        displayName: formData.displayName,
        localizationKey: formData.localizationKey,
        image: formData.image || null,
        rawData: {},
      };

      if (selectedProgram) {
        // Update
        const { error } = await supabase
          .from("programs")
          .update(programData as any)
          .eq("id", selectedProgram.id);

        if (error) throw error;
        toast.success("Cập nhật program thành công");
      } else {
        // Create
        const { error } = await supabase
          .from("programs")
          .insert(programData as any);

        if (error) throw error;
        toast.success("Tạo program mới thành công");
      }

      fetchPrograms();
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error(selectedProgram ? "Không thể cập nhật program" : "Không thể tạo program");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPrograms = programs.filter((program) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      program.displayName?.toLowerCase().includes(query) ||
      program.id?.toLowerCase().includes(query) ||
      program.localizationKey?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Quản Lý Programs</h1>
          <p className="text-muted-foreground">
            Quản lý các chương trình/sự kiện trong game
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Program
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Tổng Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{programs.length}</div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Programs</CardTitle>
          <CardDescription>{filteredPrograms.length} programs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
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
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-mono text-xs">{program.id}</TableCell>
                      <TableCell className="font-medium">{program.displayName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {program.localizationKey}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(program.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(program)}
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
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProgram ? "Chỉnh Sửa Program" : "Tạo Program Mới"}</DialogTitle>
            <DialogDescription>
              {selectedProgram ? "Cập nhật thông tin program" : "Thêm program mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID *</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!selectedProgram}
                required
                placeholder="vd: TOTW, TOTY, UCL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                placeholder="vd: Team of the Week"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizationKey">Localization Key *</Label>
              <Input
                id="localizationKey"
                value={formData.localizationKey}
                onChange={(e) => setFormData({ ...formData, localizationKey: e.target.value })}
                required
                placeholder="vd: program.totw"
              />
            </div>

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
                {selectedProgram ? "Cập nhật" : "Tạo mới"}
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
              Bạn có chắc chắn muốn xóa program "{selectedProgram?.displayName}"?
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
