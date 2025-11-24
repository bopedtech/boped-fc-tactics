import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const randomGreetings = [
  "Bạn cần tôi trợ giúp gì không? 🤖",
  "Có câu hỏi gì về FC Mobile không? ⚽",
  "Tôi có thể giúp gì cho bạn? 💬",
  "Cần tư vấn về đội hình không? 🎯",
  "Muốn tìm cầu thủ phù hợp? 🔍",
];

const AIAssistantBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Show random greeting after 3 seconds
    const timer = setTimeout(() => {
      const randomGreeting = randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
      setGreeting(randomGreeting);
      setShowGreeting(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide greeting after 5 seconds
    if (showGreeting) {
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showGreeting]);

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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response (replace with actual AI call later)
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "Cảm ơn bạn đã nhắn tin! Chức năng AI đang được phát triển. Hiện tại bạn có thể sử dụng thanh tìm kiếm ở trên để tìm cầu thủ nhé! 🎮"
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInputValue("");
  };

  return (
    <>
      {/* Greeting bubble */}
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 animate-in slide-in-from-right">
          <div className="bg-card border-2 border-primary/30 rounded-2xl px-4 py-3 shadow-xl max-w-[250px] relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-card border border-border"
              onClick={() => setShowGreeting(false)}
            >
              <X className="h-3 w-3" />
            </Button>
            <p className="text-sm font-medium">{greeting}</p>
          </div>
        </div>
      )}

      {/* Main bubble button */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
        {!isOpen ? (
          <Button
            onClick={handleOpen}
            size="lg"
            className="h-14 w-14 rounded-full shadow-2xl gradient-primary hover:scale-110 transition-transform"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-2xl w-[90vw] md:w-[400px] h-[600px] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
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
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 max-w-[80%]",
                        message.role === "user"
                          ? "gradient-primary text-white"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
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
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIAssistantBubble;
