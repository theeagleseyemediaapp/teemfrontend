import { createFileRoute, redirect } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getStoredUser } from "@/lib/auth-session";
import { useAiSearch, useAiSupport, useAiRefine } from "@/lib/api";
import {
  Send,
  Download,
  Trash2,
  Bot,
  User,
  Sparkles,
  Search,
  MessageSquare,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/admin/ai")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/sign-in" });
  },
  component: AiChat,
});

type Mode = "chat" | "search" | "refine";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode: Mode;
}

const MODE_CONFIG = {
  chat: {
    label: "AI Chat",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    description: "Ask anything about parliamentary news, editing, or content strategy.",
    placeholder: "Ask the AI anything — content strategy, article ideas, writing help…",
  },
  search: {
    label: "News Search",
    icon: Search,
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
    description: "Search and explore articles in the archive with AI analysis.",
    placeholder: "Search for topics: e.g. 'Senate budget debate 2024'…",
  },
  refine: {
    label: "AI Refine",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    description: "Paste a headline, summary, or body paragraph and AI will polish it.",
    placeholder: "Paste text here to refine — headline, summary, or body paragraph…",
  },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const cfg = MODE_CONFIG[msg.mode];

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`shrink-0 size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
          isUser ? "bg-navy" : "bg-gradient-to-br from-gold to-amber-600"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-navy text-white rounded-tr-sm"
              : "bg-card border border-border rounded-tl-sm"
          }`}
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {msg.content}
        </div>
        <div className={`flex items-center gap-2 text-[10px] text-muted-foreground ${isUser ? "flex-row-reverse" : ""}`}>
          <span>{formatTime(msg.timestamp)}</span>
          {!isUser && (
            <>
              <span className={`${cfg.color} font-medium`}>{cfg.label}</span>
              <CopyButton text={msg.content} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 size-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gold to-amber-600 shadow-sm">
        <Bot className="size-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm Eagle AI, your intelligent assistant for The Eagle's Eye Media.\n\nI can help you:\n• 🔍 **Search & analyse** articles from the archive\n• ✍️ **Refine** headlines, summaries, and body text\n• 💬 **Chat** about content strategy, parliamentary topics, and editorial decisions\n\nSelect a mode below and start typing!",
      timestamp: new Date(),
      mode: "chat",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const aiSearch = useAiSearch();
  const aiSupport = useAiSupport();
  const aiRefine = useAiRefine();

  const user = getStoredUser();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addMessage = (role: "user" | "assistant", content: string, msgMode: Mode) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: new Date(), mode: msgMode },
    ]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const currentMode = mode;
    setInput("");
    setIsLoading(true);
    addMessage("user", text, currentMode);

    try {
      let reply = "";

      if (currentMode === "search") {
        const res = await aiSearch.mutateAsync(text);
        const resultList = (res.results ?? [])
          .slice(0, 5)
          .map((r: any, i: number) => `${i + 1}. ${r.title}\n   ${r.summary ?? ""}`)
          .join("\n\n");
        reply = `${res.answer}\n\n${resultList ? `📰 Related Articles:\n${resultList}` : ""}`.trim();
      } else if (currentMode === "refine") {
        // Auto-detect if it looks like a headline (short) or body (long)
        const field = text.length < 120 ? (text.includes("\n") ? "body" : "title") : "body";
        const res = await aiRefine.mutateAsync({ text, field });
        reply = `✅ Refined ${field}:\n\n${res.text}`;
      } else {
        const res = await aiSupport.mutateAsync(text);
        reply = res.answer ?? "I couldn't generate a response. Please try again.";
      }

      addMessage("assistant", reply, currentMode);
    } catch (err: any) {
      addMessage(
        "assistant",
        `⚠️ Something went wrong: ${err?.message ?? "Unknown error"}. Please try again.`,
        currentMode
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Chat cleared. How can I help you?",
        timestamp: new Date(),
        mode: "chat",
      },
    ]);
  };

  const downloadChat = () => {
    const text = messages
      .map(
        (m) =>
          `[${formatTime(m.timestamp)}] ${m.role === "user" ? (user?.displayName ?? "Admin") : "Eagle AI"} (${MODE_CONFIG[m.mode].label}):\n${m.content}`
      )
      .join("\n\n---\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eagle-ai-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center shadow">
            <Bot className="size-5 text-gold" />
          </div>
          <div>
            <h1 className="font-serif font-black text-2xl text-navy leading-none">Eagle AI</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Parliamentary news assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadChat} className="gap-1.5 text-xs">
            <Download className="size-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={clearChat} className="gap-1.5 text-xs text-red-500 hover:text-red-600 hover:border-red-300">
            <Trash2 className="size-3.5" /> Clear
          </Button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="py-3 flex items-center gap-2 shrink-0 relative">
        <span className="text-xs text-muted-foreground font-medium">Mode:</span>
        {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, c]) => {
          const Icon = c.icon;
          return (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                mode === key
                  ? `${c.bg} ${c.color} border-current shadow-sm`
                  : "border-border text-muted-foreground hover:border-muted-foreground/40"
              }`}
            >
              <Icon className="size-3" />
              {c.label}
            </button>
          );
        })}
        <p className="ml-auto text-[11px] text-muted-foreground hidden md:block">{cfg.description}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 py-4 px-1 scrollbar-thin">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`shrink-0 pt-4 border-t border-border`}>
        <div className={`rounded-xl border-2 transition-all ${isLoading ? "border-border" : `border-border focus-within:border-navy`} bg-card shadow-sm`}>
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={cfg.placeholder}
            rows={3}
            disabled={isLoading}
            className="border-0 shadow-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
          <div className="flex items-center justify-between px-3 pb-2.5">
            <span className="text-[10px] text-muted-foreground">
              <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Shift+Enter</kbd> new line
            </span>
            <Button
              size="sm"
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="gap-1.5 bg-navy hover:bg-navy/90 text-white h-8 px-4"
            >
              <Send className="size-3.5" />
              {isLoading ? "Thinking…" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
