import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, ScanLine, Loader2 } from "lucide-react";
import { useState } from "react";
import { useT } from "@/contexts/LocalizationContext";
import { toast } from "sonner";

interface OCRScannerProps {
  onScanComplete: (players: any[]) => void;
}

export default function OCRScanner({ onScanComplete }: OCRScannerProps) {
  const { t } = useT();
  const [scanning, setScanning] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    // Simulate OCR delay
    toast.info("Đang phân tích hình ảnh... (Giả lập)");
    
    setTimeout(() => {
      setScanning(false);
      setOpen(false);
      // Mock result
      toast.success("Đã tìm thấy 11 cầu thủ từ ảnh!");
      onScanComplete([
          // Start a few dummy players for demo
          { position: 0, commonName: "Ronaldo", rating: 96, assetId: 23000 },
          { position: 10, commonName: "Van der Sar", rating: 95, assetId: 24000 }
      ]);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 shadow-lg border border-primary/20 hover:bg-primary/20">
          <ScanLine className="w-4 h-4" />
          {t("builder.ocr", "Quét đội hình (OCR)")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("builder.ocrTitle", "Nhập đội hình từ ảnh")}</DialogTitle>
          <DialogDescription>
            Tải lên ảnh chụp màn hình đội hình của bạn. AI sẽ tự động nhận diện cầu thủ.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
            {scanning ? (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Đang xử lý...</p>
                </div>
            ) : (
                <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                            Chọn ảnh
                        </span>
                        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    <p className="mt-2 text-xs text-muted-foreground">Hỗ trợ JPG, PNG</p>
                </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
