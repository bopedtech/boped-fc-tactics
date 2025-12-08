import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/contexts/LocalizationContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Bot, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface AIChatIntroDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AIChatIntroDialog({ open, onOpenChange }: AIChatIntroDialogProps) {
    const { t } = useT();
    const navigate = useNavigate();
    const [typedText, setTypedText] = useState("");
    const [exampleIndex, setExampleIndex] = useState(0);

    const examples = [
        t("aiIntro.example1", "Tìm tiền đạo cắm giá rẻ lương cao?"),
        t("aiIntro.example2", "Build đội hình Real Madrid 2014..."),
        t("aiIntro.example3", "So sánh Rô béo và Rô điệu?"),
    ];

    // Typing effect
    useEffect(() => {
        if (!open) return;

        let currentIndex = 0;
        let currentText = "";
        let isDeleting = false;
        let typingSpeed = 100;

        const type = () => {
            const fullText = examples[exampleIndex];

            if (isDeleting) {
                currentText = fullText.substring(0, currentIndex - 1);
                currentIndex--;
                typingSpeed = 50;
            } else {
                currentText = fullText.substring(0, currentIndex + 1);
                currentIndex++;
                typingSpeed = 100;
            }

            setTypedText(currentText);

            if (!isDeleting && currentIndex === fullText.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at end
            } else if (isDeleting && currentIndex === 0) {
                isDeleting = false;
                setExampleIndex((prev) => (prev + 1) % examples.length);
                typingSpeed = 500; // Pause before next
            }

            timeout = setTimeout(type, typingSpeed);
        };

        let timeout = setTimeout(type, typingSpeed);

        return () => clearTimeout(timeout);
    }, [open, exampleIndex]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted border-primary/20">
                <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        {t("aiIntro.title", "Trợ lý AI Thông Minh")}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {t("aiIntro.desc", "Giải đáp mọi thắc mắc về FC Mobile, gợi ý đội hình và tra cứu cầu thủ trong tích tắc.")}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 p-4 bg-black/20 rounded-lg border border-white/10 relative overflow-hidden">
                    <div className="flex items-start gap-3">
                        <Bot className="w-6 h-6 text-primary mt-1" />
                        <div className="flex-1">
                            <p className="text-sm font-mono text-primary/80 mb-1">{t("aiIntro.asking", "Bạn có thể hỏi:")}</p>
                            <p className="text-lg font-medium min-h-[1.75rem]">
                                {typedText}<span className="animate-blink">|</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50 border border-border flex flex-col items-center text-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-medium">{t("aiIntro.feat1", "Chat tự nhiên")}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border flex flex-col items-center text-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs font-medium">{t("aiIntro.feat2", "Gợi ý thông minh")}</span>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex-col sm:flex-col gap-3">
                    <Button
                        className="w-full gradient-primary font-bold text-lg h-12 shadow-lg hover:shadow-primary/25 transition-all"
                        onClick={() => {
                            onOpenChange(false);
                            navigate("/auth");
                        }}
                    >
                        {t("aiIntro.loginButton", "Đăng nhập để chat ngay")}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground"
                        onClick={() => onOpenChange(false)}
                    >
                        {t("common.close", "Để sau")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
