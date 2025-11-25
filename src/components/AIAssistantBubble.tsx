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
}

const randomGreetings = [
  "Tìm cầu thủ có tốc độ nhanh nhất FC Mobile",
  "Bấm để nhận gợi ý về chiến thuật giả lập xếp hạng",
  "Tìm cầu thủ phù hợp với đội hình Tiki-Taka",
  "Gợi ý cầu thủ có giá trị tốt nhất theo vị trí",
  "Chiến thuật phòng ngự phản công hiệu quả",
  "So sánh 2 cầu thủ bất kỳ trong FC Mobile",
  "Xây dựng đội hình hoàn hảo cho budget của bạn",
];

const AIAssistantBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
    // Add initial greeting message if chat is empty
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Xin chào! Tôi là trợ lý AI của Boped FC Tactics. Tôi có thể giúp bạn tìm cầu thủ, tư vấn đội hình, hoặc trả lời các câu hỏi về FC Mobile. Bạn cần giúp gì?"
        }
      ]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
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
          userQuery: inputValue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi kết nối");
      }

      const data = await response.json();
      const responseText = data.response || "Xin lỗi, tôi không thể trả lời.";
      
      // Parse player cards from JSON blocks
      const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      let players: Player[] | undefined = undefined;
      let displayContent = responseText;
      
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[1]);
          if (jsonData.playerCards && Array.isArray(jsonData.playerCards)) {
            players = jsonData.playerCards;
          }
          // Remove JSON block from display
          displayContent = responseText.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').trim();
        } catch (e) {
          console.error("Failed to parse player cards:", e);
        }
      }
      
      // Remove markdown formatting
      displayContent = displayContent.replace(/\*\*/g, '').replace(/\*/g, '');
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: displayContent,
        players: players 
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Lỗi khi gửi tin nhắn");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Greeting bubble */}
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 animate-in slide-in-from-right-5">
          <div 
            onClick={handleOpen}
            className="bg-gradient-to-r from-primary/90 to-purple-500/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl max-w-[250px] relative cursor-pointer hover:scale-105 transition-transform"
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
            <p className="text-sm font-bold text-white drop-shadow-lg">{greeting}</p>
          </div>
        </div>
      )}

      {/* Main bubble button */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
        {!isOpen ? (
          <div
            onClick={handleOpen}
            className="h-16 w-16 rounded-full shadow-2xl bg-white hover:scale-110 transition-all cursor-pointer relative overflow-hidden group border-2 border-primary/30"
          >
            <div className="w-full h-full flex items-center justify-center p-2">
              <img 
                src={logoImage} 
                alt="AI Assistant" 
                className="w-full h-full object-contain"
              />
            </div>
            <Sparkles className="h-4 w-4 absolute -bottom-0.5 -right-0.5 text-primary bg-white rounded-full p-0.5 shadow-lg animate-pulse" />
          </div>
        ) : (
          <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center p-2">
                  <img src={logoImage} alt="Boped FC Tactics" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Trợ lý FC Tactics</h3>
                  <p className="text-sm text-muted-foreground">Tìm kiếm & phân tích cầu thủ</p>
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
                      <div className="flex flex-wrap gap-3 max-w-full">
                        {message.players.map((player) => (
                          <div 
                            key={player.assetId}
                            className="w-[160px] cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedPlayer(player.assetId)}
                          >
                            <PlayerCard player={player} />
                          </div>
                        ))}
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
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-5 py-3 bg-muted">
                      <p className="text-sm">Đang tìm kiếm...</p>
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
                    placeholder="Hỏi về cầu thủ, chiến thuật, đội hình..."
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
      </div>

      {/* Player Detail Dialog */}
      <PlayerDetailDialog
        assetId={selectedPlayer}
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      />
    </>
  );
};

export default AIAssistantBubble;
