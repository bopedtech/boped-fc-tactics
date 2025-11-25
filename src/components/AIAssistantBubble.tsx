import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logoImage from "@/assets/bopedfctactics-logo.png";
import ChatPlayerCard from "@/components/ChatPlayerCard";
import PlayerDetailDialog from "@/components/PlayerDetailDialog";

interface PlayerCard {
  assetId: number;
  name: string;
  rating: number;
  position: string;
  images?: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  playerCards?: PlayerCard[];
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

    let assistantContent = "";
    
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi kết nối");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      // Add initial assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              
              // Parse player cards from JSON blocks
              const jsonMatch = assistantContent.match(/```json\s*(\{[\s\S]*?\})\s*```/);
              let playerCards: PlayerCard[] | undefined = undefined;
              let displayContent = assistantContent;
              
              if (jsonMatch) {
                try {
                  const jsonData = JSON.parse(jsonMatch[1]);
                  if (jsonData.playerCards && Array.isArray(jsonData.playerCards)) {
                    playerCards = jsonData.playerCards;
                  }
                  // Remove JSON block from display
                  displayContent = assistantContent.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').trim();
                } catch {
                  // Invalid JSON, keep original content
                }
              }
              
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === "assistant") {
                  lastMessage.content = displayContent;
                  lastMessage.playerCards = playerCards;
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Lỗi khi gửi tin nhắn");
      setMessages(prev => prev.slice(0, -1)); // Remove empty assistant message
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
          <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-2xl w-[90vw] md:w-[400px] h-[600px] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-white border border-border flex items-center justify-center p-1.5">
                  <img src={logoImage} alt="Boped FC Tactics" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Trợ lý</h3>
                  <p className="text-xs text-muted-foreground">Boped FC Tactics</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col gap-2",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    {/* Player Cards */}
                    {message.playerCards && message.playerCards.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[90%]">
                        {message.playerCards.map((player) => (
                          <ChatPlayerCard
                            key={player.assetId}
                            player={player}
                            onClick={() => setSelectedPlayer(player.assetId)}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Text Message */}
                    {message.content && (
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 max-w-[80%]",
                          message.role === "user"
                            ? "gradient-primary text-white"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-2 bg-muted">
                      <p className="text-sm">Đang trả lời...</p>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="gradient-primary"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
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
