import { Link } from "@tanstack/react-router";
import { Play, Maximize2 } from "lucide-react";
import { useSettings } from "@/lib/api";
import { brandLogoUrl } from "@/lib/branding";

interface LiveTvWidgetProps {
  fallbackArticle?: any;
}

export function LiveTvWidget({ fallbackArticle }: LiveTvWidgetProps) {
  const { data: settings } = useSettings();
  const rawCastrUrl = (settings as any)?.castrEmbedUrl || "https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b";
  const isLive = Boolean((settings as any)?.castrLiveEnabled ?? (settings as any)?.isLive ?? true);
  const castrEmbedUrl = rawCastrUrl.startsWith("http") ? rawCastrUrl : `https://player.castr.com/${rawCastrUrl}`;
  const isBlinking = (settings as any)?.castrLiveBlinking ?? true;
  const tvTickerText = (settings as any)?.tvTickerText || "EAGLE PRESS TV • LIVE PARLIAMENTARY PLENARY SESSION FROM YAOUNDÉ •";
  const tvTickerEnabled = (settings as any)?.tvTickerEnabled ?? true;

  const triggerFullscreen = () => {
    window.dispatchEvent(new CustomEvent("open-live-player"));
  };

  return (
    <div className="space-y-2">
      {/* ── CNN-STYLE EAGLE PRESS TV BROADCAST CARD ── */}
      <div className="rounded-xl bg-black border-0 shadow-md overflow-hidden relative group">
        <div className="w-full aspect-video bg-slate-900 relative">
          {/* Channel Watermark */}
          <div className="absolute top-2 right-2 z-20 bg-black/70 border-0 p-1 rounded-lg flex items-center gap-1 backdrop-blur-md shadow-sm pointer-events-none select-none">
            <img src={brandLogoUrl} alt="Logo" className="size-4 rounded-full object-cover bg-white" />
            {isLive && (
              <span className="flex size-1.5 relative shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isBlinking ? "bg-red-500 animate-ping" : "bg-red-500"}`} />
                <span className="relative inline-flex rounded-full size-1.5 bg-red-500" />
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isLive ? (
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full pointer-events-none select-none">
              <span className="relative flex size-1.5">
                {isBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />}
                <span className="relative inline-flex rounded-full size-1.5 bg-white" />
              </span>
              LIVE
            </div>
          ) : (
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-amber-400 text-navy text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full pointer-events-none select-none">
              EAGLE TV REPLAY
            </div>
          )}

          {isLive && castrEmbedUrl ? (
            <iframe
              src={castrEmbedUrl}
              title="Live Castr Stream"
              className="absolute inset-0 w-full h-full border-0"
              scrolling="no"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : fallbackArticle ? (
            <Link to="/article/$slug" params={{ slug: fallbackArticle.slug }} className="block w-full h-full relative group">
              <img
                src={fallbackArticle.coverImage || fallbackArticle.imageUrl || "/logo.png"}
                alt={fallbackArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="size-12 rounded-full bg-amber-400 text-navy flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="size-6 fill-current ml-0.5" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold p-4 text-center">
              Eagle Press TV Plenary Session Broadcast
            </div>
          )}

          {/* Hover Fullscreen Overlay */}
          {isLive && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
              <button
                onClick={triggerFullscreen}
                className="pointer-events-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Maximize2 className="size-4 animate-pulse" /> Watch Fullscreen
              </button>
            </div>
          )}

          {/* TV NEWS TICKER CRAWLER OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-950/90 text-amber-400 py-1 px-2.5 flex items-center overflow-hidden">
            <div className={`shrink-0 font-black text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded mr-2 ${isLive ? "bg-red-600 text-white" : "bg-amber-400 text-navy"}`}>
              {isLive ? "LIVE" : "TV DISPATCH"}
            </div>
            <div className="overflow-hidden flex-1 relative">
              <div className="whitespace-nowrap font-serif font-bold text-[10px] tracking-wide text-white animate-marquee">
                {tvTickerEnabled ? tvTickerText : "EAGLE PRESS TV • PARLIAMENTARY COVERAGE & ANALYSIS FROM YAOUNDÉ •"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-3 py-2 bg-slate-950 text-white flex items-center justify-between">
          {isLive ? (
            <button
              onClick={triggerFullscreen}
              className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span className="relative flex size-2">
                {isBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />}
                <span className="relative inline-flex rounded-full size-2 bg-white" />
              </span>
              Watch Fullscreen
            </button>
          ) : fallbackArticle ? (
            <Link to="/article/$slug" params={{ slug: fallbackArticle.slug }} className="w-full block">
              <h4 className="font-serif font-bold text-xs text-white hover:text-amber-400 transition-colors line-clamp-1">
                {fallbackArticle.title}
              </h4>
            </Link>
          ) : (
            <span className="text-[10px] text-slate-400">Eagle Press TV Channel</span>
          )}
        </div>
      </div>

      {/* ── SEPARATE PLATFORM LINKS ── */}
      <div className="flex gap-2 pt-0.5">
        <Link
          to="/watch-live"
          search={{ platform: "youtube" }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase tracking-wider py-2 px-2 rounded-lg transition-all"
        >
          <svg className="size-3 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          YouTube
        </Link>
        <Link
          to="/watch-live"
          search={{ platform: "facebook" }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider py-2 px-2 rounded-lg transition-all"
        >
          <svg className="size-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </Link>
      </div>
    </div>
  );
}
