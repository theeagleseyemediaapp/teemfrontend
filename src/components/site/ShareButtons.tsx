import { useState, useEffect } from "react";
import { Twitter, Facebook, Link2, Check, Send } from "lucide-react";
import { toast } from "sonner";

interface Props {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);
  const enc = encodeURIComponent;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(url.startsWith("http") ? url : window.location.origin + url);
    }
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const shareTikTok = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied! Opening TikTok...");
      window.open("https://www.tiktok.com", "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Copy failed");
    }
  };

  const btn = "grid place-items-center size-9 rounded-full bg-muted hover:bg-navy hover:text-white transition shrink-0";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Share</span>
      <a href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(fullUrl)}`} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X"><Twitter className="size-4" /></a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(fullUrl)}`} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Facebook"><Facebook className="size-4" /></a>
      <a href={`https://wa.me/?text=${enc(title + " — " + fullUrl)}`} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on WhatsApp"><Send className="size-4" /></a>
      <button onClick={shareTikTok} className={btn} aria-label="Share on TikTok">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      </button>
      <button onClick={copy} className={btn} aria-label="Copy link">
        {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
