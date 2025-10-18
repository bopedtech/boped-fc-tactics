import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

interface AIAnalysis {
  playstyle: string;
  explanation: string;
  buildUp: {
    speed: number;
    passingDistance: number;
    positioning: string;
  };
  offense: {
    shooting: number;
    crossing: number;
    passing: number;
  };
  defense: {
    pressure: number;
    aggression: number;
    width: number;
    offsideTrap: boolean;
  };
}

interface AIAdvisorProps {
  onClose: () => void;
  squadData?: any;
}

export default function AIAdvisor({ onClose, squadData }: AIAdvisorProps) {
  const [selectedPlaystyle, setSelectedPlaystyle] = useState<string>("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const playstyles = [
    { value: "control", label: "Kiểm soát bóng", icon: TrendingUp },
    { value: "counter", label: "Phản công nhanh", icon: Zap },
    { value: "gegenpressing", label: "Gegenpressing", icon: Shield },
    { value: "defensive", label: "Phòng ngự chặt", icon: Shield },
  ];

  const handleAnalyze = async () => {
    if (!selectedPlaystyle) {
      toast.error("Vui lòng chọn lối chơi mong muốn");
      return;
    }

    setAnalyzing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI analysis based on selected playstyle
    const mockAnalysis: AIAnalysis = {
      playstyle: selectedPlaystyle === "counter" 
        ? "Fast Counter-Attack" 
        : selectedPlaystyle === "control"
        ? "Possession Control"
        : selectedPlaystyle === "gegenpressing"
        ? "High Press & Recovery"
        : "Defensive Stability",
      explanation:
        selectedPlaystyle === "counter"
          ? "Dựa trên tốc độ cao của hàng công và khả năng chuyển đổi trạng thái nhanh, đội hình này tối ưu cho việc phản công. Hàng thủ lùi sâu và tận dụng khoảng trống phía sau hàng thủ đối phương. Các cầu thủ có pace cao như Mbappé và Vinicius sẽ phát huy tối đa trong lối chơi này."
          : selectedPlaystyle === "control"
          ? "Với khả năng passing xuất sắc của De Bruyne và Bellingham, đội hình có thể kiểm soát bóng hiệu quả. Tập trung vào việc xây dựng bóng ngắn từ hàng thủ, di chuyển bóng nhanh qua các khu vực và tạo ra cơ hội ghi bàn thông qua sự lưu thông."
          : selectedPlaystyle === "gegenpressing"
          ? "Lối chơi ép sân cao với việc tranh bóng ngay khi mất bóng. Cần các cầu thủ có thể lực tốt và work rate cao như Bellingham, Rodri để duy trì cường độ. Hàng thủ đẩy cao và sử dụng bẫy việt vị thường xuyên."
          : "Tập trung vào việc giữ vững hàng thủ với các trung vệ mạnh mẽ như Van Dijk và Dias. Hạn chế khoảng trống, chơi compact và phản công khi có cơ hội. Thích hợp khi đối đầu với đối thủ mạnh.",
      buildUp: {
        speed: selectedPlaystyle === "counter" ? 85 : selectedPlaystyle === "control" ? 40 : 65,
        passingDistance: selectedPlaystyle === "counter" ? 70 : selectedPlaystyle === "control" ? 35 : 50,
        positioning: selectedPlaystyle === "defensive" ? "Organized" : "Free Form",
      },
      offense: {
        shooting: selectedPlaystyle === "counter" ? 75 : selectedPlaystyle === "control" ? 60 : 70,
        crossing: selectedPlaystyle === "counter" ? 45 : selectedPlaystyle === "control" ? 55 : 50,
        passing: selectedPlaystyle === "control" ? 85 : selectedPlaystyle === "counter" ? 60 : 70,
      },
      defense: {
        pressure: selectedPlaystyle === "gegenpressing" ? 85 : selectedPlaystyle === "defensive" ? 35 : 55,
        aggression: selectedPlaystyle === "gegenpressing" ? 75 : selectedPlaystyle === "defensive" ? 45 : 60,
        width: selectedPlaystyle === "defensive" ? 35 : 50,
        offsideTrap: selectedPlaystyle === "gegenpressing",
      },
    };

    setAnalysis(mockAnalysis);
    setAnalyzing(false);
    toast.success("Phân tích hoàn tất!");
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Tactics Advisor</h1>
              <p className="text-muted-foreground">
                Gợi ý chiến thuật thông minh cho đội hình của bạn
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>

        {!analysis ? (
          <Card className="p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Chọn lối chơi mong muốn</h2>
                <p className="text-muted-foreground">
                  AI sẽ phân tích và đề xuất thiết lập tối ưu dựa trên đội hình của bạn
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg">Lối chơi</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playstyles.map((style) => (
                    <Card
                      key={style.value}
                      className={`p-6 cursor-pointer transition-all card-hover ${
                        selectedPlaystyle === style.value
                          ? "border-primary border-2 gradient-glow"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedPlaystyle(style.value)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedPlaystyle === style.value
                              ? "gradient-primary"
                              : "bg-muted"
                          }`}
                        >
                          <style.icon
                            className={`h-6 w-6 ${
                              selectedPlaystyle === style.value
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <span className="font-semibold text-lg">{style.label}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedPlaystyle || analyzing}
                className="w-full gradient-primary text-lg py-6"
              >
                {analyzing ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Phân tích với AI
                  </>
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* AI Insight Box */}
            <Card className="p-6 bg-accent/10 border-accent/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-accent-foreground">
                    Boped AI Insight
                  </h3>
                  <p className="text-accent-foreground/90 leading-relaxed">
                    {analysis.explanation}
                  </p>
                  <Badge className="mt-3 bg-accent text-accent-foreground">
                    Lối chơi đề xuất: {analysis.playstyle}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Detailed Settings */}
            <Tabs defaultValue="buildup" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="buildup">Build-up</TabsTrigger>
                <TabsTrigger value="offense">Tấn công</TabsTrigger>
                <TabsTrigger value="defense">Phòng thủ</TabsTrigger>
                <TabsTrigger value="summary">Tổng quan</TabsTrigger>
              </TabsList>

              <TabsContent value="buildup" className="space-y-6 mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6">Thiết lập xây dựng lối chơi</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">
                        Tốc độ: {analysis.buildUp.speed}/100
                      </Label>
                      <Slider
                        value={[analysis.buildUp.speed]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">
                        Khoảng cách chuyền: {analysis.buildUp.passingDistance}/100
                      </Label>
                      <Slider
                        value={[analysis.buildUp.passingDistance]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Vị trí cầu thủ</Label>
                      <Select value={analysis.buildUp.positioning} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="Organized">Tổ chức</SelectItem>
                          <SelectItem value="Free Form">Tự do</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="offense" className="space-y-6 mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6">Thiết lập tấn công</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">
                        Sút xa: {analysis.offense.shooting}/100
                      </Label>
                      <Slider
                        value={[analysis.offense.shooting]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">
                        Tạt cánh: {analysis.offense.crossing}/100
                      </Label>
                      <Slider
                        value={[analysis.offense.crossing]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">
                        Chuyền bóng trong vòng cấm: {analysis.offense.passing}/100
                      </Label>
                      <Slider
                        value={[analysis.offense.passing]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="defense" className="space-y-6 mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6">Thiết lập phòng thủ</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">
                        Áp lực: {analysis.defense.pressure}/100
                      </Label>
                      <Slider
                        value={[analysis.defense.pressure]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">
                        Quyết liệt: {analysis.defense.aggression}/100
                      </Label>
                      <Slider
                        value={[analysis.defense.aggression]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">
                        Độ rộng hàng thủ: {analysis.defense.width}/100
                      </Label>
                      <Slider
                        value={[analysis.defense.width]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Bẫy việt vị</Label>
                      <Select
                        value={analysis.defense.offsideTrap ? "on" : "off"}
                        disabled
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="on">Bật</SelectItem>
                          <SelectItem value="off">Tắt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="space-y-6 mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6">Tổng quan chiến thuật</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Điểm mạnh</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Chuyển đổi trạng thái nhanh với pace cao</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Khả năng ghi bàn xuất sắc từ hàng công</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Hàng thủ vững chắc với các trung vệ đẳng cấp</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-destructive">Lưu ý</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>Cần kiểm soát tốc độ để tránh mệt mỏi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>Chú ý khoảng trống khi hàng thủ đẩy cao</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>Cần thể lực tốt cho pressing liên tục</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button
                onClick={() => setAnalysis(null)}
                variant="outline"
                className="flex-1"
              >
                Phân tích lại
              </Button>
              <Button onClick={onClose} className="flex-1 gradient-primary">
                Áp dụng thiết lập
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
