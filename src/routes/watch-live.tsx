import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, Settings, Save, ExternalLink, Play, Youtube, Video, Maximize2, Share2, Copy, Check, QrCode } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "@/components/auth/useAuthState";
import { useSettings } from "@/lib/api";
import { brandLogoUrl } from "@/lib/branding";
import { fetchLiveStreamId, fetchChannelVideos, getChannelUrl, type YTVideo } from "@/lib/youtube";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";
const YT_CHANNEL_CONFIGURED = !!(import.meta.env.VITE_YOUTUBE_CHANNEL_ID && import.meta.env.VITE_YOUTUBE_API_KEY);
const FB_VIDEO_URL = "https://web.facebook.com/theeagleseyemedia1/videos/2465461737261446/";

export const Route = createFileRoute("/watch-live")({
  head: () => ({
    meta: [
      { title: "Watch Live Parliamentary TV & Plenary Broadcasts — Cameroon" },
      { name: "description", content: "Watch live television broadcasts, parliamentary plenary sessions, and committee hearings directly from Cameroon's National Assembly and Senate in Yaoundé. Multi-source live player with Castr, YouTube Live, and Facebook Live." },
      { name: "keywords", content: "watch live Cameroon parliament, live plenary broadcast Yaoundé, Cameroon TV live, National Assembly live stream, Senate live stream Cameroon, parliamentary debates live" },
      { property: "og:title", content: "Watch Live Parliamentary TV & Plenary Broadcasts" },
      { property: "og:description", content: "Live plenary sessions, committee hearings, and state legislative broadcasts from Yaoundé, Cameroon." },
      { property: "og:type", content: "video.other" },
      { property: "og:url", content: "https://theeagleseyemedia.com/watch-live" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Media Watch Live Player" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Watch Live — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Live plenary debates and parliamentary hearings from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/watch-live" }],
  }),
  component: WatchLive,
});

function extractId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z0-9_-]{6,15}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([a-zA-Z0-9_-]{6,15})/);
  return m ? m[1] : trimmed;
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider px-2.5 py-1">
      <span className="relative flex size-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full size-2 bg-red-500" />
      </span>
      Live
    </span>
  );
}

function useLiveConfig() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthState();
  const [draftId, setDraftId] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [saved, setSaved] = useState(false);

  const configQuery = useQuery({
    queryKey: ["live-config"],
    queryFn: () => fetch(`${API_BASE}/live-config`).then((r) => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: (body: { videoId: string; mode: "live" | "event" }) =>
      fetch(`${API_BASE}/admin/live-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id ?? "",
        },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-config"] });
      setSaved(true);
      setDraftId("");
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const configVideoId = configQuery.data?.videoId ?? "";
  const mode = configQuery.data?.mode ?? "live";

  const ytLiveQuery = useQuery({
    queryKey: ["yt-live-stream"],
    queryFn: fetchLiveStreamId,
    refetchInterval: 60_000,
    enabled: YT_CHANNEL_CONFIGURED,
  });

  const ytVideosQuery = useQuery({
    queryKey: ["yt-recent-videos"],
    queryFn: () => fetchChannelVideos({ maxResults: 5 }),
    staleTime: 5 * 60_000,
    enabled: YT_CHANNEL_CONFIGURED,
  });

  const recentVideos: YTVideo[] = ytVideosQuery.data ?? [];
  const activeVideoId = ytLiveQuery.data || configVideoId;
  const isOffline = !activeVideoId || activeVideoId === "offline" || activeVideoId.trim() === "";

  function save(e: React.FormEvent) {
    e.preventDefault();
    const id = draftId.trim() === "offline" || draftId.trim() === "" ? "offline" : extractId(draftId);
    saveMutation.mutate({ videoId: id, mode });
  }

  return {
    isAuthenticated,
    showAdmin,
    setShowAdmin,
    saved,
    mode,
    recentVideos,
    activeVideoId,
    isOffline,
    save,
    ytEmbedSrc: `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&modestbranding=1&rel=0&fs=1`,
    fbEmbedSrc: `https://www.facebook.com/plugins/video.php?height=314&href=${encodeURIComponent(FB_VIDEO_URL)}&show_text=false&width=560&t=0&autoplay=1`,
    draftId,
    setDraftId,
    saveMutation,
  };
}

function WatchLive() {
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platform, setPlatform] = useState<"youtube" | "facebook" | "castr">("castr");
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + "/watch-live?platform=castr"
    : "https://theeagleseyemedia.com/watch-live";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { data: settings } = useSettings();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("platform");
      if (p === "youtube" || p === "facebook" || p === "castr") {
        setPlatform(p);
      } else if ((settings as any)?.defaultLivePlatform) {
        setPlatform((settings as any).defaultLivePlatform);
      }
    }
  }, [settings]);

  const { isAuthenticated, showAdmin, setShowAdmin, saved, mode, recentVideos, activeVideoId, isOffline, save, ytEmbedSrc, fbEmbedSrc, draftId, setDraftId, saveMutation } = useLiveConfig();

  const rawCastrUrl = (settings as any)?.castrEmbedUrl || "https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b";
  const castrEmbedUrl = rawCastrUrl.startsWith("http") ? rawCastrUrl : `https://player.castr.com/${rawCastrUrl}`;
  const castrBlinking = (settings as any)?.castrLiveBlinking ?? true;
  const youtubeBlinking = (settings as any)?.youtubeLiveBlinking ?? true;
  const facebookBlinking = (settings as any)?.facebookLiveBlinking ?? true;
  const tvTickerText = (settings as any)?.tvTickerText || "EAGLE PRESS TV • LIVE PARLIAMENTARY PLENARY SESSION FROM YAOUNDÉ •";
  const tvTickerEnabled = (settings as any)?.tvTickerEnabled ?? true;
  const tvChannelName = (settings as any)?.tvChannelName || "EAGLE PRESS TV";
  const tvShowWatermark = (settings as any)?.tvShowWatermark ?? true;

  const currentPlatformBlinking =
    platform === "castr" ? castrBlinking : platform === "youtube" ? youtubeBlinking : facebookBlinking;

  useEffect(() => {
    if (!isOffline && !hasPrompted) {
      const params = new URLSearchParams(window.location.search);
      const hasPlatformParam = params.has("platform");
      if (!hasPlatformParam) {
        setShowPlatformModal(true);
      }
      setHasPrompted(true);
    }
  }, [isOffline, hasPrompted]);

  const selectPlatform = (p: "youtube" | "facebook" | "castr") => {
    setPlatform(p);
    setShowPlatformModal(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("platform", p);
      window.history.pushState({}, "", url.toString());
    }
  };

  const currentPlatform = platform;

  return (
    <div className="mx-auto max-w-[1536px] px-4 py-8">
      <div className="border-b border-border pb-4 mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="section-rule text-3xl sm:text-4xl flex items-center gap-3">
            <Radio className={`size-7 text-destructive ${currentPlatformBlinking ? "animate-pulse" : ""}`} /> Watch Live
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {mode === "live"
              ? "Live coverage from the National Assembly and Senate. Stream switches automatically when a plenary or special event is on air."
              : "Scheduled event broadcast. Replay availability appears under our Video section once the session ends."}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowAdmin((s) => !s)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-navy"
          >
            <Settings className="size-4" /> Editor controls
          </button>
        )}
      </div>

      {/* Standalone clean Platform Selector Card - Fully Detached and Positioned Above Grid */}
      {!isOffline && (
        <div className="mb-6 bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Select Broadcast Feed:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => selectPlatform("castr")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                currentPlatform === "castr"
                  ? "bg-[#050596] text-white shadow-md border border-[#050596]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <Radio className="size-3.5" />
              Castr Live
            </button>
            <button
              onClick={() => selectPlatform("youtube")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                currentPlatform === "youtube"
                  ? "bg-[#FF0000] text-white shadow-md border border-[#FF0000]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </button>
            <button
              onClick={() => selectPlatform("facebook")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                currentPlatform === "facebook"
                  ? "bg-[#1877F2] text-white shadow-md border border-[#1877F2]/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {isOffline ? (
            <div className="relative aspect-video w-full rounded-sm bg-gradient-to-br from-navy to-slate-900 shadow-lg border border-white/5 flex flex-col items-center justify-center p-8 text-center">
              <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative">
                <span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                <Radio className="size-8 text-white/40" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">No Active Live Session</h2>
              <p className="text-sm text-white/60 max-w-md leading-relaxed">
                Cameroon&apos;s National Assembly &amp; Senate are currently off the air. Live coverage will resume when the next plenary session or committee debate is on the floor.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" /> Off Air
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-black shadow-lg">
                {/* Channel Watermark - Floating Right Responsive (Logo & Blinking dot only) */}
                {tvShowWatermark && (
                  <div className="absolute top-4 right-4 z-20 bg-slate-950/60 border border-white/10 p-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all hover:scale-105 pointer-events-auto">
                    <span className="flex size-1.5 relative shrink-0 mr-0.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${currentPlatformBlinking ? "bg-red-500 animate-ping" : "bg-red-500"}`} />
                      <span className="relative inline-flex rounded-full size-1.5 bg-red-500" />
                    </span>
                  </div>
                )}

                {/* Blinking Live Border Overlay */}
                <div className={`absolute inset-0 border border-red-500/30 rounded-sm pointer-events-none z-10 ${currentPlatformBlinking ? "animate-pulse" : ""}`} />
                {currentPlatform === "castr" ? (
                  <iframe
                    src={castrEmbedUrl}
                    title="The Eagle's Eye Media — Live Castr Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                    style={{ border: "none" }}
                  />
                ) : currentPlatform === "youtube" ? (
                  <iframe
                    key={activeVideoId + mode}
                    src={(settings as any)?.youtubeLiveLink ? (settings as any).youtubeLiveLink : ytEmbedSrc}
                    title="The Eagle's Eye Media — Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <iframe
                    src={(settings as any)?.facebookLiveLink ? (settings as any).facebookLiveLink : fbEmbedSrc}
                    title="The Eagle's Eye Media — Live on Facebook"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                    style={{ border: "none", overflow: "hidden" }}
                  />
                )}

                {/* TV NEWS TICKER CRAWLER OVERLAY */}
                {tvTickerEnabled && (
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-1.5 px-3 flex items-center border-t border-red-500/50 shadow-2xl overflow-hidden pointer-events-none">
                    <div className="shrink-0 bg-slate-950 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-md mr-3.5 flex items-center gap-1">
                      <span className="size-2 rounded-full bg-red-500 animate-ping" />
                      LIVE NEWS
                    </div>
                    <div className="overflow-hidden flex-1 relative">
                      <div className="whitespace-nowrap font-serif font-bold text-xs sm:text-sm tracking-wide text-white animate-marquee">
                        {tvTickerText} &nbsp;&bull;&nbsp; {tvTickerText}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls Bar Underneath the Player Container */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1530]/50 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <LiveBadge />
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-live-player"))}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded animate-pulse cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Maximize2 className="size-3" /> Play Fullscreen
                  </button>
                  <button
                    onClick={() => setShowSharePanel((v) => !v)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      showSharePanel
                        ? "bg-amber-400 text-navy"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Share2 className="size-3" /> Share
                  </button>
                </div>
              </div>

              {/* Share Panel */}
              {showSharePanel && (
                <div className="rounded-xl bg-slate-900 border border-white/10 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-black text-white flex items-center gap-2">
                      <Share2 className="size-4 text-amber-400" /> Share This Live Stream
                    </h3>
                    <button
                      onClick={() => setShowSharePanel(false)}
                      className="text-white/40 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <p className="text-xs text-white/60">Invite colleagues or citizens to watch this live parliamentary session.</p>

                  {/* Copy Link */}
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-1.5 pl-3">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="bg-transparent text-xs text-white/90 outline-none flex-1 min-w-0 overflow-hidden text-ellipsis"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 bg-amber-400 hover:bg-amber-500 text-navy text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copied ? (
                        <><Check className="size-3" /> Copied!</>
                      ) : (
                        <><Copy className="size-3" /> Copy Link</>
                      )}
                    </button>
                  </div>

                  {/* Two-column: social + QR */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-1">
                    {/* Social share buttons */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Share via</p>
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Watch Live Cameroon Parliamentary Press on The Eagle's Eye: " + shareUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-[9px] font-bold text-white transition-all gap-1 cursor-pointer"
                        >
                          <svg className="size-4 fill-current text-emerald-400" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.782.001-2.592-1.01-5.032-2.846-6.87S13.993 1.848 11.4 1.848c-5.404 0-9.806 4.385-9.808 9.787-.001 1.512.42 2.986 1.22 4.3l-.979 3.57 3.684-.966c1.3.7 2.6 1.05 3.6 1.05zm10.963-7.393c-.3-.15-1.77-.875-2.04-.975-.27-.1-.47-.15-.67.15-.2.3-.77.975-.94 1.175-.17.2-.34.225-.64.075-.3-.15-1.27-.47-2.42-1.5-1-.9-1.66-2-1.87-2.3-.2-.3-.02-.47.13-.62.14-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.67-1.625-.92-2.225-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.075-.79.37-.27.3-1.04 1.02-1.04 2.487 0 1.467 1.07 2.885 1.22 3.085.15.2 2.11 3.224 5.11 4.526.71.3 1.27.48 1.7.62.71.22 1.36.19 1.87.12.57-.08 1.77-.725 2.02-1.425.25-.7.25-1.3.17-1.425-.08-.13-.3-.2-.6-.35z"/>
                          </svg>
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-[9px] font-bold text-white transition-all gap-1 cursor-pointer"
                        >
                          <svg className="size-4 fill-current text-blue-400" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Watch Live Cameroon Parliamentary Press")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold text-white transition-all gap-1 cursor-pointer"
                        >
                          <svg className="size-4 fill-current text-white/80" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          Twitter
                        </a>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1 self-start sm:self-center">
                        <QrCode className="size-3.5" /> Scan QR Code
                      </p>
                      <div className="bg-white p-2.5 rounded-xl shadow-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(shareUrl)}&color=050596`}
                          alt="QR code to watch live stream"
                          className="size-[128px] object-contain"
                        />
                      </div>
                      <span className="text-[9px] text-white/30 mt-1.5 text-center">Point your phone camera to open instantly</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {showAdmin && isAuthenticated && (
            <form onSubmit={save} className="mt-5 rounded border border-dashed border-navy/40 bg-card p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-navy mb-3">Editor controls</div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={draftId}
                  onChange={(e) => setDraftId(e.target.value)}
                  placeholder="YouTube URL, video/live ID, or 'offline'"
                  className="min-w-0 rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy"
                />
                <select
                  value={mode}
                  onChange={(e) => {
                    const next = e.target.value as "live" | "event";
                    saveMutation.mutate({ videoId: activeVideoId, mode: next });
                  }}
                  className="rounded border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="live">Live update</option>
                  <option value="event">Live event</option>
                </select>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 bg-navy text-white font-bold uppercase tracking-wider text-xs px-4 py-2 rounded hover:bg-navy/90 disabled:opacity-60"
                >
                  <Save className="size-4" /> {saved ? "Saved" : "Save"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Accepts a full YouTube URL (watch, /live/, youtu.be/, embed) or a raw video ID. Set as &quot;offline&quot; to show off-air screen.
              </p>
            </form>
          )}
        </div>

        <aside className="space-y-5">
          {recentVideos.length > 0 && currentPlatform === "youtube" && (
            <section className="rounded border border-border bg-card p-4">
              <h3 className="font-serif font-black text-navy mb-3">Recent Videos</h3>
              <ul className="space-y-3">
                {recentVideos.map((v) => (
                  <li key={v.videoId}>
                    <a
                      href={`https://www.youtube.com/watch?v=${v.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-2.5 group"
                    >
                      <div className="relative shrink-0 w-24 aspect-video rounded overflow-hidden bg-muted">
                        {v.thumbnail && <img src={v.thumbnail} alt="" className="h-full w-full object-cover group-hover:scale-105 transition" />}
                        {v.isLive && <span className="absolute top-1 left-1 bg-destructive text-white text-[9px] font-bold px-1 rounded">LIVE</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-navy line-clamp-2 group-hover:text-gold transition-colors">{v.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(v.publishedAt).toLocaleDateString()}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={getChannelUrl()}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-navy hover:text-gold"
              >
                <ExternalLink className="size-3" /> All videos on YouTube
              </a>
            </section>
          )}

          <section className="rounded border border-border bg-card p-4">
            <h3 className="font-serif font-black text-navy">Coming up</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li><span className="font-bold text-navy">Mon 09:00 —</span> Senate Plenary, finance bill</li>
              <li><span className="font-bold text-navy">Tue 14:00 —</span> Budget Committee hearing</li>
              <li><span className="font-bold text-navy">Wed 10:00 —</span> Speaker&apos;s press briefing</li>
            </ul>
          </section>
        </aside>
      </div>

      <Dialog open={showPlatformModal && !isOffline} onOpenChange={setShowPlatformModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-serif font-black text-navy">
              <Play className="size-6 text-[#FF0000]" /> Select Stream Platform
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              We are currently broadcasting live plenary sessions. Choose your preferred platform below to begin watching.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            <button
              onClick={() => selectPlatform("castr")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-[#050596] hover:bg-[#050596]/5 transition-all group gap-3 bg-card cursor-pointer"
            >
              <div className="size-16 rounded-full bg-[#050596]/10 flex items-center justify-center text-[#050596] group-hover:scale-110 transition-transform">
                <Radio className="size-8 animate-pulse text-[#050596]" />
              </div>
              <div className="text-center">
                <div className="font-bold text-navy text-base">Castr Stream</div>
                <div className="text-xs text-muted-foreground mt-0.5">Primary Live Feed</div>
              </div>
            </button>
            <button
              onClick={() => selectPlatform("youtube")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-[#FF0000] hover:bg-[#FF0000]/5 transition-all group gap-3 bg-card cursor-pointer"
            >
              <div className="size-16 rounded-full bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000] group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="size-8" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="font-bold text-navy text-base">YouTube Live</div>
                <div className="text-xs text-muted-foreground mt-0.5">YouTube Stream</div>
              </div>
            </button>
            <button
              onClick={() => selectPlatform("facebook")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all group gap-3 bg-card cursor-pointer"
            >
              <div className="size-16 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="size-8" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="font-bold text-navy text-base">Facebook Live</div>
                <div className="text-xs text-muted-foreground mt-0.5">Facebook Watch</div>
              </div>
            </button>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center sm:text-left w-full">You can change stream platform anytime using the buttons floating inside the player.</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
