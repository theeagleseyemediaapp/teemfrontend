import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";

const COOKIE_KEY = "eem.cookie-consent.v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hasConsent = localStorage.getItem(COOKIE_KEY);
      if (!hasConsent) {
        // Slight delay so it doesn't abruptly pop immediately
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, []);

  const acceptCookies = (choice: "all" | "essential" | "reject") => {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice, at: Date.now() }));
    } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 bg-slate-900/95 text-white border border-white/15 rounded-xl shadow-2xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-amber-400 shrink-0" />
          <span className="font-bold text-xs text-white">Privacy &amp; Cookies</span>
        </div>
        <button
          onClick={() => acceptCookies("essential")}
          className="text-white/50 hover:text-white transition-colors p-0.5 rounded"
          aria-label="Dismiss cookie notice"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">
        We use essential cookies to provide secure browsing and measure reading engagement.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => acceptCookies("all")}
          className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          Accept
        </button>
        <button
          onClick={() => acceptCookies("essential")}
          className="py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-[10px] rounded-lg transition-colors"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
