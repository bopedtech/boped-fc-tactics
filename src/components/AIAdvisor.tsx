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
    { value: "control", label: "Kiểm soát bóng (Possession)", icon: TrendingUp },
    { value: "counter", label: "Phản công nhanh (Counter)", icon: Zap },
    { value: "gegenpressing", label: "Ép sân cao (High Press)", icon: Shield },
    { value: "defensive", label: "Phòng thủ chặt chẽ (Defensive)", icon: Shield },
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
        ? "Phản công nhanh (Fast Counter)" 
        : selectedPlaystyle === "control"
        ? "Kiểm soát bóng (Possession Control)"
        : selectedPlaystyle === "gegenpressing"
        ? "Ép sân cao (High Press)"
        : "Phòng thủ vững chắc (Defensive)",
      explanation:
        selectedPlaystyle === "counter"
          ? "Dựa trên tốc độ cao của hàng công (Mbappé, Vinicius có Pace 115+) và khả năng chuyển đổi trạng thái nhanh, đội hình này tối ưu cho phản công trong FC Mobile. Hàng thủ lùi sâu (~40 Defensive Line) và tận dụng khoảng trống phía sau hàng thủ đối phương với Build-up Speed cao (75-85). Thiết lập Manager Mode: Fast Counter-Attack, High Build-up Speed, Long Pass."
          : selectedPlaystyle === "control"
          ? "Với khả năng passing xuất sắc (De Bruyne 120 Passing, Bellingham 112 Passing), đội hình có thể kiểm soát bóng hiệu quả trong FC Mobile. Tập trung xây dựng bóng ngắn (Short Pass 30-40), di chuyển bóng nhanh qua các khu vực. Manager Mode: Possession, Low Build-up Speed (40), Short Pass, Free Form positioning."
          : selectedPlaystyle === "gegenpressing"
          ? "Lối chơi ép sân cao với tranh bóng ngay khi mất bóng - phù hợp FC Mobile. Cần cầu thủ có work rate cao (Bellingham High/High, Rodri Med/High). Thiết lập Manager Mode: High Defensive Line (65+), High Pressure (75-85), Offside Trap ON. Hàng thủ đẩy cao để thu hẹp khoảng cách."
          : "Tập trung giữ vững hàng thủ với trung vệ mạnh (Van Dijk 118 Defense, Dias 115 Defense) trong FC Mobile. Hạn chế khoảng trống, chơi compact với Low Defensive Line (35-40), Low Pressure (30-40). Manager Mode: Defensive, Organized positioning. Phản công khi có cơ hội.",
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
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trợ lý AI Chiến thuật</h1>
              <p className="text-muted-foreground">
                Gợi ý thiết lập Manager Mode FC Mobile thông minh cho đội hình của bạn
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
                  AI sẽ phân tích và đề xuất thiết lập Manager Mode tối ưu cho FC Mobile
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
                    Phân tích Boped AI
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
                <TabsTrigger value="buildup">Xây dựng</TabsTrigger>
                <TabsTrigger value="offense">Tấn công</TabsTrigger>
                <TabsTrigger value="defense">Phòng thủ</TabsTrigger>
                <TabsTrigger value="summary">Tổng quan</TabsTrigger>
              </TabsList>

              <TabsContent value="buildup" className="space-y-6 mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-6">Thiết lập xây dựng lối chơi (Build-up Play)</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">
                        Tốc độ xây dựng (Build-up Speed): {analysis.buildUp.speed}/100
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
                        Khoảng cách chuyền (Pass Distance): {analysis.buildUp.passingDistance}/100
                      </Label>
                      <Slider
                        value={[analysis.buildUp.passingDistance]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Vị trí cầu thủ (Player Positioning)</Label>
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
                  <h3 className="text-lg font-bold mb-6">Thiết lập tấn công (Offensive Play)</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">
                        Sút xa (Long Shots): {analysis.offense.shooting}/100
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
                        Tạt cánh (Crossing): {analysis.offense.crossing}/100
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
                        Chuyền trong vòng cấm (Pass in Box): {analysis.offense.passing}/100
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
                  <h3 className="text-lg font-bold mb-6">Thiết lập phòng thủ (Defensive Play)</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">
                        Áp lực (Defensive Pressure): {analysis.defense.pressure}/100
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
                        Quyết liệt (Defensive Aggression): {analysis.defense.aggression}/100
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
                        Độ rộng hàng thủ (Defensive Width): {analysis.defense.width}/100
                      </Label>
                      <Slider
                        value={[analysis.defense.width]}
                        max={100}
                        disabled
                        className="cursor-default"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Bẫy việt vị (Offside Trap)</Label>
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
                      <h4 className="font-semibold text-primary">✅ Điểm mạnh</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Chuyển trạng thái nhanh với pace cao (120+ Pace)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Sức mạnh ghi bàn từ hàng công (115+ Shooting)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Hàng thủ vững chắc với CB đẳng cấp (115+ Defense)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-destructive">⚠️ Lưu ý quan trọng</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>Kiểm soát stamina trong FC Mobile để tránh mệt</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>Chú ý khoảng trống khi hàng thủ đẩy cao</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>Cần work rate cao cho pressing liên tục (High/High)</span>
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
