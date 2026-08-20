import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Send, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { useAiSearch } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  results?: any[];
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const aiSearch = useAiSearch();
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiSearch.isPending]);

  // Clear messages when widget closes
  const handleToggle = () => {
    if (open) {
      setMessages([]);
      setInput("");
    }
    setOpen((v) => !v);
  };

  const handleSend = () => {
    const query = input.trim();
    if (!query || aiSearch.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setInput("");

    aiSearch.mutate(query, {
      onSuccess: (data) => {
        const answer = (data?.answer || "").trim() || "I searched our archive but couldn't find a specific answer. Try rephrasing your question.";
        const results = data?.results ?? [];

        // Typewriter effect setup
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "", // Start empty
            results,
          },
        ]);

        let currentText = "";
        let index = 0;
        
        // Fast typing effect: append chunks of characters
        const interval = setInterval(() => {
          if (index < answer.length) {
            const nextChunk = answer.slice(index, index + 3);
            currentText += nextChunk;
            index += 3;
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === "assistant") {
                last.content = currentText;
              }
              return next;
            });
          } else {
            clearInterval(interval);
          }
        }, 15);
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong. Please try again.",
          },
        ]);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      {/* Floating AI chat button */}
      <button
        onClick={handleToggle}
        aria-label="Open AI assistant"
        className={`fixed bottom-6 right-6 z-50 inline-flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${
          open ? "bg-amber-400 text-slate-900" : "bg-navy text-white hover:bg-navy/90"
        }`}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          boxShadow: "0 8px 30px rgba(5,5,150,0.4), 0 0 0 3px rgba(255,255,255,0.2)",
        }}
      >
        {open ? (
          <X className="size-5 shrink-0" />
        ) : (
          <span className="material-symbols-outlined text-[2rem] text-white">psychology</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[88vw] max-w-[380px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right animate-in fade-in slide-in-from-bottom-2"
          style={{ maxHeight: "min(70vh, 560px)" }}
        >
          {/* Pointer tail */}
          <div className="absolute -bottom-2 right-6 size-4 rotate-45 bg-card border-r border-b border-border" />

          {/* Header */}
          <div className="bg-navy text-white px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-gold text-[1.6rem]">psychology</span>
            <div className="leading-tight flex-1">
              <div className="font-serif font-black text-sm">Eagle AI</div>
              <div className="text-[0.6rem] text-gold uppercase tracking-wider">Parliamentary Search</div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-full hover:bg-white/10 transition text-white/60 hover:text-white"
                title="Clear chat"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center gap-3">
                <span className="material-symbols-outlined text-[2.5rem] opacity-25 text-navy">psychology</span>
                <div className="text-muted-foreground text-sm leading-relaxed">
                  Ask me anything about parliament, bills, MPs, or news — I'll search our archive for you.
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-navy text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {/* Render paragraphs properly */}
                  {msg.content.split("\n\n").map((para, pi) => (
                    <p key={pi} className={pi > 0 ? "mt-2" : ""}>
                      {para}
                    </p>
                  ))}

                  {/* Linked article results */}
                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-border/40 pt-2">
                      <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">Related Articles</p>
                      {msg.results.slice(0, 3).map((r: any, idx: number) => (
                        <Link
                          key={r.id || idx}
                          to="/article/$slug"
                          params={{ slug: r.slug }}
                          onClick={handleToggle}
                          className="flex items-start gap-2 rounded-lg border border-border/50 bg-background/80 p-2 hover:border-navy transition"
                        >
                          <ExternalLink className="size-3.5 mt-0.5 shrink-0 text-navy" />
                          <div className="min-w-0">
                            <div className="font-serif font-bold text-navy text-xs leading-snug">{r.title}</div>
                            {r.summary && (
                              <div className="text-[0.65rem] text-muted-foreground mt-0.5 line-clamp-2">{r.summary}</div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {aiSearch.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Searching archive…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border bg-background px-3 py-3 shrink-0">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 focus-within:border-navy transition">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about parliament, bills, MPs…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || aiSearch.isPending}
                className="grid place-items-center size-8 rounded-full bg-navy text-white hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
