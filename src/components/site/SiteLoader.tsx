import { useEffect, useState } from "react";
import { brandLogoUrl } from "@/lib/branding";

interface SiteLoaderProps {
  isLoading: boolean;
  minDurationMs?: number;
}

export function SiteLoader({ isLoading, minDurationMs = 1500 }: SiteLoaderProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Lock body scroll while loader is visible so nothing behind it can move the page
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Minimum display duration so loader doesn't flash on fast connections
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs]);

  useEffect(() => {
    // Hide loader only when both initial data loading is done AND minimum display duration has passed
    if (!isLoading && minTimeElapsed) {
      setFadeOut(true);
      const hideTimer = setTimeout(() => {
        // Restore scroll and make sure we're at the very top
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
        setShouldRender(false);
      }, 700); // 700ms matches transition duration
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, minTimeElapsed]);

  const [lang, setLang] = useState<"en" | "fr">("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("eem.preferred-lang.v1");
    if (stored === "fr" || stored === "en") {
      setLang(stored);
    }
    const handleLang = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "en" || detail === "fr") setLang(detail);
    };
    window.addEventListener("eem-language-changed", handleLang);
    return () => window.removeEventListener("eem-language-changed", handleLang);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out select-none ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          src="/loader.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Subtle dark overlay so text remains readable */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        <div className="relative mb-6">
          <img
            src={brandLogoUrl}
            alt="The Eagle's Eye Media"
            className="size-20 rounded-full ring-4 ring-amber-400/40 shadow-2xl animate-pulse bg-white p-0.5"
          />
          <span className="absolute -bottom-1 -right-1 flex size-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-5 bg-red-600 border-2 border-slate-950" />
          </span>
        </div>

        <h1 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide mb-2 drop-shadow-md">
          {/* Brand name — must never be translated */}
          <span translate="no" lang="en">THE EAGLE'S EYE</span>
        </h1>
        <p className="text-amber-400 text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] mb-6">
          {lang === "fr" ? "Presse & Intelligence Parlementaire" : "Parliamentary Press & Intelligence"}
        </p>

        {/* Animated Loading Bar */}
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 border border-white/10">
          <div className="h-full bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 animate-pulse w-full rounded-full" />
        </div>

        <span className="text-[10px] text-white/60 font-semibold tracking-wider uppercase animate-pulse">
          {lang === "fr" ? "Chargement de la couverture législative…" : "Loading Legislative Coverage…"}
        </span>
      </div>
    </div>
  );
}
