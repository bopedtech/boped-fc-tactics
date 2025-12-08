import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useT } from "@/contexts/LocalizationContext";
import { ArrowLeft } from "lucide-react";
import logoImage from "@/assets/bopedfctactics-logo.png";

export default function Auth() {
  const { t } = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success(t("auth.signupSuccess", "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận."));
    } catch (error: any) {
      toast.error(error.message || t("auth.signupError", "Có lỗi xảy ra khi đăng ký"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(t("auth.signinSuccess", "Đăng nhập thành công!"));
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || t("auth.signinError", "Email hoặc mật khẩu không đúng"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || t("auth.googleError", "Có lỗi xảy ra khi đăng nhập với Google"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20 relative">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 hover:bg-background/80">
          <ArrowLeft className="w-4 h-4" />
          {t("auth.backToHome", "Trở về Trang chủ")}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-white/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 flex flex-col items-center">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-2 flex items-center justify-center flex-shrink-0 mb-2">
            <img
              src={logoImage}
              alt="BopedFCTactics Logo"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
          <div className="text-center space-y-1">
            <CardDescription className="text-base font-medium">
              {t("auth.description", "Xây dựng đội hình và chiến thuật tối ưu")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">{t("auth.signin", "Đăng nhập")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup", "Đăng ký")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t("auth.email", "Email")}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">{t("auth.password", "Mật khẩu")}</Label>
                    <Link to="#" className="text-xs text-primary hover:underline">
                      {t("auth.forgotPassword", "Quên mật khẩu?")}
                    </Link>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary font-bold shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? t("auth.signingIn", "Đang đăng nhập...") : t("auth.signin", "Đăng nhập")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email", "Email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("auth.password", "Mật khẩu")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder", "Tối thiểu 6 ký tự")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background/50"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary font-bold shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? t("auth.signingUp", "Đang đăng ký...") : t("auth.signup", "Đăng ký")}
                </Button>
              </form>
            </TabsContent>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("auth.orContinueWith", "Hoặc tiếp tục với")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full hover:bg-muted/50"
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
