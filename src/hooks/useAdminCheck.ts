import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        navigate("/auth");
        return;
      }

      // Check if user has super_admin role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (roleError) {
        console.error("Error checking admin role:", roleError);
        toast.error("Không thể xác thực quyền truy cập");
        navigate("/");
        return;
      }

      if (!roles) {
        toast.error("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Admin check error:", error);
      toast.error("Đã xảy ra lỗi khi kiểm tra quyền truy cập");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}