import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logoImage from "@/assets/bopedfctactics-logo.png";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailDialog from "@/components/PlayerDetailDialog";
import { useT } from "@/contexts/LocalizationContext";
import { useUserTierContext } from "@/contexts/UserTierContext";
import { AIChatIntroDialog } from "./AIChatIntroDialog";
import { useNavigate } from "react-router-dom";

interface Player {
  assetId: number;
  playerId?: number;
  rating: number;
  position: string;
  commonName: string;
  firstName?: string;
  lastName?: string;
  cardName?: string;
  club?: any;
  nation?: any;
  league?: any;
  images?: any;
  stats: any;
  foot?: number;
  skillMovesLevel?: number;
  weakFoot?: number;
  height?: number;
  weight?: number;
  workRates?: any;
  traits?: any[];
  source?: string;
  auctionable?: boolean;
  avgStats?: any;
  avgGkStats?: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  players?: Player[];
  suggestedQuestions?: string[];
}

const AIAssistantBubble = () => {
  const { t, locale } = useT();
  const { user, isAdmin } = useUserTierContext();
  const navigate = useNavigate();

  const randomGreetings = [
    t("aiAssistant.greeting1", "Tìm cầu thủ có tốc độ nhanh nhất FC Mobile"),
    t("aiAssistant.greeting2", "Bấm để nhận gợi ý về chiến thuật giả lập xếp hạng"),
    t("aiAssistant.greeting3", "Tìm cầu thủ phù hợp với đội hình Tiki-Taka"),
    t("aiAssistant.greeting4", "Gợi ý cầu thủ có giá trị tốt nhất theo vị trí"),
    t("aiAssistant.greeting5", "Chiến thuật phòng ngự phản công hiệu quả"),
    t("aiAssistant.greeting6", "So sánh 2 cầu thủ bất kỳ trong FC Mobile"),
    t("aiAssistant.greeting7", "Xây dựng đội hình hoàn hảo cho budget của bạn"),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Show random greeting every 5 seconds
    const showRandomGreeting = () => {
      const randomGreeting = randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
      setGreeting(randomGreeting);
      setShowGreeting(true);

      // Hide after 4 seconds
      setTimeout(() => {
        setShowGreeting(false);
      }, 4000);
    };

    // First greeting after 3 seconds
    const initialTimer = setTimeout(showRandomGreeting, 3000);

    // Then repeat every 5 seconds
    const intervalTimer = setInterval(showRandomGreeting, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Handle window resize to keep bubble in bounds
  useEffect(() => {
    const handleResize = () => {
      if (position) {
        const maxX = window.innerWidth - 80; // 80 is approx bubble width + margin
        const maxY = window.innerHeight - 80;

        setPosition(prev => {
          if (!prev) return null;
          return {
            x: Math.min(Math.max(0, prev.x), maxX),
            y: Math.min(Math.max(0, prev.y), maxY)
          };
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  const handleOpen = () => {
    if (!user) {
      setShowIntro(true);
      return;
    }

    setIsOpen(true);
    setShowGreeting(false);
    // Add initial greeting message if chat is empty
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: t("aiAssistant.welcome", "Xin chào! Tôi là trợ lý AI của Boped FC Tactics. Tôi có thể giúp bạn tìm cầu thủ, tư vấn đội hình, hoặc trả lời các câu hỏi về FC Mobile. Bạn cần giúp gì?")
        }
      ]);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow left click for dragging
    if (e.button !== 0) return;

    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    dragStart.current = {
      x: e.clientX,
      y: e.clientY
    };

    setIsDragging(true);

    // Capture pointer to track movement even outside the element
    element.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    e.preventDefault();

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    // Boundary checks
    const maxX = window.innerWidth - 64; // Bubble width
    const maxY = window.innerHeight - 64; // Bubble height

    setPosition({
      x: Math.min(Math.max(0, newX), maxX),
      y: Math.min(Math.max(0, newY), maxY)
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    const element = e.currentTarget as HTMLElement;
    element.releasePointerCapture(e.pointerId);

    // Check if it was a drag or a click based on distance moved
    const dist = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
    if (dist < 5) {
      handleOpen();
    }
  };

  const handleSend = async (content?: string) => {
    const messageContent = typeof content === 'string' ? content : inputValue;
    if (!messageContent.trim() || isLoading) return;

    // Check daily limits
    const TODAY = new Date().toISOString().split('T')[0];
    const limit = 3;
    const usageKey = `ai_usage_${user?.id}_${TODAY}`;
    const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');

    if (!isAdmin && currentUsage >= limit) {
      toast.error(
        t("aiSearch.limitUser", "Bạn đã dùng hết 3 câu hỏi hôm nay!"),
        {
          description: t("aiSearch.upgradeDesc", "Nâng cấp gói Premium để chat không giới hạn."),
          action: {
            label: t("common.upgrade", "Nâng cấp"),
            onClick: () => {
              setIsOpen(false);
              navigate("/pricing");
            }
          },
          duration: 5000,
        }
      );
      return;
    }

    if (!isAdmin) {
      localStorage.setItem(usageKey, (currentUsage + 1).toString());
    }

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    if (!content) setInputValue(""); // Only clear input if sent manually
    setIsLoading(true);

    try {
      const CHAT_URL = `https://nhdmgiyoienkixokcoue.supabase.co/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userQuery: messageContent,
          locale: locale
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("aiAssistant.connectionError", "Lỗi kết nối"));
      }

      const data = await response.json();
      const responseText = data.response || t("aiAssistant.cannotAnswer", "Xin lỗi, tôi không thể trả lời.");

      // Parse response using regex to find JSON block
      let players: Player[] | undefined = undefined;
      let suggestedQuestions: string[] | undefined = undefined;
      let displayContent = responseText;

      // Try to find JSON with markdown code block
      let jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);

      // If not found, try to find raw JSON object
      if (!jsonMatch) {
        // Relaxed regex to catch JSON object that might start with { "playerCards": ... }
        jsonMatch = responseText.match(/(\{\s*"playerCards"[\s\S]*?\})/);
      }

      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1];
          const jsonData = JSON.parse(jsonStr);

          if (jsonData.playerCards && Array.isArray(jsonData.playerCards)) {
            players = jsonData.playerCards.map((p: any) => ({
              assetId: p.assetId,
              playerId: p.playerId || p.assetId,
              rating: p.rating,
              position: p.position,
              commonName: p.commonName,
              firstName: p.firstName,
              lastName: p.lastName,
              cardName: p.cardName,
              club: p.club,
              nation: p.nation,
              league: p.league,
              images: p.images,
              stats: p.stats,
              avgStats: p.avgStats,
              avgGkStats: p.avgGkStats,
              foot: p.foot,
              skillMovesLevel: p.skillMovesLevel,
              weakFoot: p.weakFoot,
              height: p.height,
              weight: p.weight,
              workRates: p.workRates,
              traits: p.traits,
              source: p.source,
              auctionable: p.auctionable
            }));
          }

          if (jsonData.suggestedQuestions && Array.isArray(jsonData.suggestedQuestions)) {
            suggestedQuestions = jsonData.suggestedQuestions;
          }

          // Remove JSON block from display
          displayContent = responseText.replace(/```json\s*\{[\s\S]*?\}\s*```/, '')
            .replace(/\{\s*"playerCards"[\s\S]*?\}/, '') // fallback removal
            .trim();
        } catch (e) {
          console.error("Failed to parse AI response JSON:", e);
        }
      }

      // Remove markdown formatting
      displayContent = displayContent.replace(/\*\*/g, '').replace(/\*/g, '');

      setMessages(prev => [...prev, {
        role: "assistant",
        content: displayContent,
        players: players,
        suggestedQuestions: suggestedQuestions
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : t("aiAssistant.sendError", "Lỗi khi gửi tin nhắn"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Draggable Bubble Container */}
      {!isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-transform touch-none",
            !position && "bottom-4 right-4 md:bottom-8 md:right-8"
          )}
          style={position ? { left: position.x, top: position.y } : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Greeting bubble - Now inside draggable container */}
          {showGreeting && (
            <div className="absolute bottom-full right-0 mb-4 w-max max-w-[250px] animate-in slide-in-from-right-5 pointer-events-auto">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen();
                }}
                className="bg-gradient-to-r from-primary/90 to-purple-500/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl relative cursor-pointer hover:scale-105 transition-transform"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-card border border-border hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGreeting(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-sm font-bold text-white drop-shadow-lg whitespace-normal">{greeting}</p>
              </div>
            </div>
          )}

          {/* Main bubble button */}
          <div
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl bg-white cursor-pointer relative overflow-hidden group border-2 border-primary/30",
              !isDragging && "hover:scale-110 transition-all"
            )}
          >
            <div className="w-full h-full flex items-center justify-center p-2">
              <img
                src={logoImage}
                alt="AI Assistant"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <Sparkles className="h-4 w-4 absolute -bottom-0.5 -right-0.5 text-primary bg-white rounded-full p-0.5 shadow-lg animate-pulse" />
          </div>
        </div>
      )}

      {/* Full Screen Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center p-2">
                <img src={logoImage} alt="Boped FC Tactics" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t("aiAssistant.title", "AI Trợ lý FC Tactics")}</h3>
                <p className="text-sm text-muted-foreground">{t("aiAssistant.subtitle", "Tìm kiếm & phân tích cầu thủ")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="lg"
              className="h-10 w-10 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col gap-3",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {/* Player Cards */}
                  {message.players && message.players.length > 0 && (
                    <div className="flex flex-col gap-4 max-w-full w-full">
                      {/* Top 1 Player - Featured */}
                      <div className="flex justify-center md:justify-start">
                        <div
                          className="w-[180px] md:w-[200px] cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedPlayer(message.players![0].assetId)}
                        >
                          <div className="relative">
                            <div className="absolute -top-3 -right-3 z-10 bg-yellow-400 text-black font-bold px-2 py-1 rounded-full text-xs shadow-lg animate-bounce">
                              TOP 1
                            </div>
                            <PlayerCard player={message.players[0]} variant="medium" />
                          </div>
                        </div>
                      </div>

                      {/* Remaining Players - List View */}
                      {message.players.length > 1 && (
                        <div className="grid grid-cols-1 gap-2 w-full">
                          {message.players.slice(1).map((player, idx) => (
                            <div
                              key={player.assetId}
                              className="w-full cursor-pointer hover:bg-muted/50 rounded-lg transition-colors p-1"
                              onClick={() => setSelectedPlayer(player.assetId)}
                            >
                              <div className="flex items-center gap-3 bg-card border border-border/50 rounded-lg p-2">
                                <div className="font-bold text-muted-foreground w-6 text-center">#{idx + 2}</div>
                                <PlayerCard player={player} variant="list" isSelected={false} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* View More Button */}
                      <div className="flex justify-center mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/database");
                          }}
                        >
                          {t("aiSearch.viewMore", "Xem thêm trong Database")}
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Text Message */}
                  {message.content && (
                    <div
                      className={cn(
                        "rounded-2xl px-5 py-3 max-w-[85%]",
                        message.role === "user"
                          ? "gradient-primary text-white"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content.replace(/\*\*/g, '').replace(/\*/g, '')}
                      </p>
                    </div>
                  )}

                  {/* Suggested Questions */}
                  {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {message.suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all px-3 py-1.5 rounded-full border border-primary/20 text-left"
                          onClick={() => handleSend(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-5 py-3 bg-muted">
                    <p className="text-sm">{t("aiAssistant.searching", "Đang tìm kiếm...")}</p>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t border-border bg-card/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("aiAssistant.inputPlaceholder", "Hỏi về cầu thủ, chiến thuật, đội hình...")}
                  className="flex-1 h-12 text-base"
                  autoFocus
                />
                <Button
                  type="submit"
                  size="lg"
                  className="gradient-primary h-12 px-6"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Player Detail Dialog */}
      <PlayerDetailDialog
        assetId={selectedPlayer}
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      />

      <AIChatIntroDialog open={showIntro} onOpenChange={setShowIntro} />
    </>
  );
};

export default AIAssistantBubble;
