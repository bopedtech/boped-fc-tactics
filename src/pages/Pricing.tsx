import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Star, Crown, Shield } from "lucide-react";
import { useT } from "@/contexts/LocalizationContext";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
    const { t } = useT();

    const packages = [
        {
            name: t("pricing.free.title", "Free Starter"),
            price: "0đ",
            period: t("pricing.forever", "mãi mãi"),
            description: t("pricing.free.desc", "Trải nghiệm cơ bản cho người mới"),
            features: [
                t("pricing.free.feat1", "3 câu hỏi AI mỗi ngày"),
                t("pricing.free.feat2", "Tra cứu cầu thủ cơ bản"),
                t("pricing.free.feat3", "Xây dựng 1 đội hình"),
            ],
            icon: <Shield className="w-6 h-6 text-gray-400" />,
            buttonText: t("pricing.currentPlan", "Gói hiện tại"),
            popular: false,
            variant: "outline" as const,
        },
        {
            name: t("pricing.day.title", "Gói Ngày"),
            price: "5.000đ",
            period: "/ 24h",
            description: t("pricing.day.desc", "Không giới hạn trong 24 giờ"),
            features: [
                t("pricing.day.feat1", "Chat AI không giới hạn"),
                t("pricing.day.feat2", "Truy cập đầy đủ bộ lọc"),
                t("pricing.day.feat3", "Xây dựng đội hình không giới hạn"),
                t("pricing.day.feat4", "Không quảng cáo"),
            ],
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            buttonText: t("pricing.buyNow", "Mua ngay"),
            popular: false,
            variant: "default" as const,
        },
        {
            name: t("pricing.month.title", "Monthly Pro"),
            price: "99.000đ",
            period: t("pricing.month", "/ tháng"),
            description: t("pricing.month.desc", "Lựa chọn tốt nhất cho game thủ"),
            features: [
                t("pricing.month.feat1", "Tất cả tính năng Gói Ngày"),
                t("pricing.month.feat2", "Phân tích đội hình chuyên sâu"),
                t("pricing.month.feat3", "Huy hiệu thành viên VIP"),
                t("pricing.month.feat4", "Ưu tiên hỗ trợ"),
            ],
            icon: <Star className="w-6 h-6 text-primary" />,
            buttonText: t("pricing.subscribe", "Đăng ký ngay"),
            popular: true,
            variant: "default" as const, // We will override styling for popular
        },
        {
            name: t("pricing.year.title", "Yearly Elite"),
            price: "999.000đ",
            period: t("pricing.year", "/ năm"),
            description: t("pricing.year.desc", "Tiết kiệm 20% so với gói tháng"),
            features: [
                t("pricing.year.feat1", "Tất cả tính năng Pro"),
                t("pricing.year.feat2", "Quyền truy cập sớm tính năng mới"),
                t("pricing.year.feat3", "Quà tặng trong game (sắp ra mắt)"),
                t("pricing.year.feat4", "Huy hiệu Elite độc quyền"),
            ],
            icon: <Crown className="w-6 h-6 text-yellow-400" />,
            buttonText: t("pricing.subscribe", "Đăng ký ngay"),
            popular: false,
            variant: "default" as const,
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto py-16 px-4">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                        {t("pricing.title", "Nâng cấp trải nghiệm của bạn")}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t("pricing.subtitle", "Mở khóa toàn bộ sức mạnh của AI và các tính năng nâng cao để xây dựng đội hình trong mơ.")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {packages.map((pkg, index) => (
                        <Card
                            key={index}
                            className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-xl ${pkg.popular
                                ? "border-primary shadow-lg scale-105 z-10"
                                : "border-border hover:-translate-y-1"
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-primary hover:bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                                        {t("pricing.mostPopular", "Phổ biến nhất")}
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-lg ${pkg.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                                        {pkg.icon}
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-3xl font-bold">{pkg.price}</span>
                                    <span className="text-muted-foreground ml-1 text-sm">{pkg.period}</span>
                                </div>

                                <ul className="space-y-3">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.popular ? "text-primary" : "text-green-500"}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className={`w-full font-semibold ${pkg.popular ? "gradient-primary shadow-lg" : ""
                                        }`}
                                    variant={pkg.variant}
                                    disabled={pkg.price === "0đ"}
                                >
                                    {pkg.buttonText}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 text-center bg-muted/30 p-8 rounded-2xl border border-dashed border-border">
                    <h3 className="text-xl font-semibold mb-2">{t("pricing.enterprise.title", "Cần gói tùy chỉnh?")}</h3>
                    <p className="text-muted-foreground mb-4">
                        {t("pricing.enterprise.desc", "Liên hệ với chúng tôi để có giải pháp phù hợp cho đội nhóm hoặc doanh nghiệp.")}
                    </p>
                    <Button variant="outline">{t("pricing.contactUs", "Liên hệ hỗ trợ")}</Button>
                </div>
            </main>
        </div>
    );
}
