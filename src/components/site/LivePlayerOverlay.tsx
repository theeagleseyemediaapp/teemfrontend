import { useEffect, useState, useRef } from "react";
import { X, Maximize2, Minimize2, Share2, Copy, Check, QrCode } from "lucide-react";
import { useSettings } from "@/lib/api";
import { brandLogoUrl } from "@/lib/branding";

export function LivePlayerOverlay() {
  const { data: settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rawCastrUrl = (settings as any)?.castrEmbedUrl || "https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b";
  const castrEmbedUrl = rawCastrUrl.startsWith("http") ? rawCastrUrl : `https://player.castr.com/${rawCastrUrl}`;
  const isBlinking = (settings as any)?.castrLiveBlinking ?? true;
  const tvTickerText = (settings as any)?.tvTickerText || "EAGLE PRESS TV • LIVE PARLIAMENTARY PLENARY SESSION FROM YAOUNDÉ •";
  const tvTickerEnabled = (settings as any)?.tvTickerEnabled ?? true;
  const tvChannelName = (settings as any)?.tvChannelName || "EAGLE PRESS TV";
  const tvProgramTitle = (settings as any)?.tvProgramTitle || "LIVE PARLIAMENTARY PRESS";
  const tvShowWatermark = (settings as any)?.tvShowWatermark ?? true;

  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + "/watch-live?platform=castr"
    : "https://theeagleseyemedia.com/watch-live";

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      // Automatically attempt native browser fullscreen after opening
      setTimeout(() => {
        if (containerRef.current && !document.fullscreenElement) {
          containerRef.current.requestFullscreen?.().catch((err) => {
            console.warn("Auto-fullscreen blocked or unsupported:", err);
          });
        }
      }, 150);
    };

    window.addEventListener("open-live-player", handleOpen);
    return () => window.removeEventListener("open-live-player", handleOpen);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => {
        console.error("Failed to request fullscreen:", err);
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  const closePlayer = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setIsOpen(false);
    setShowShareModal(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center select-none animate-in fade-in duration-300"
    >
      {/* Top Overlay Bar — CNN-style minimal */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent z-[10000] flex items-center justify-between px-4 sm:px-6 pointer-events-none">
        
        {/* LIVE Badge only — clean & minimal */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded text-white">
            <span className="relative flex size-2">
              {isBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
              <span className="relative inline-flex rounded-full size-2 bg-white" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">LIVE</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <button
            onClick={() => setShowShareModal(true)}
            aria-label="Share Stream"
            className="p-2.5 sm:p-3 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md cursor-pointer flex items-center justify-center"
          >
            <Share2 className="size-4 sm:size-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-2.5 sm:p-3 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-md cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="size-4 sm:size-5" /> : <Maximize2 className="size-4 sm:size-5" />}
          </button>

          <button
            onClick={closePlayer}
            aria-label="Close Stream"
            className="p-2.5 sm:p-3 rounded-full bg-red-600 hover:bg-red-700 border border-red-500/20 text-white hover:scale-105 active:scale-95 transition-all backdrop-blur-md shadow-lg shadow-red-900/20 cursor-pointer font-bold"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>
      </div>

      {/* Main Video Section */}
      <div className="w-full h-full flex items-center justify-center bg-black relative">
        {/* Channel Watermark - Logo only, floating top-right */}
        {tvShowWatermark && (
          <div className="absolute top-20 sm:top-24 right-3 sm:right-5 z-20 bg-black/60 border border-white/10 p-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all pointer-events-none">
            <img src={brandLogoUrl} alt="Logo" className="size-5 sm:size-6 rounded-full object-cover bg-white" />
            <span className="flex size-1.5 relative shrink-0">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isBlinking ? "bg-red-500 animate-ping" : "bg-red-500"}`} />
              <span className="relative inline-flex rounded-full size-1.5 bg-red-500" />
            </span>
          </div>
        )}

        <iframe
          src={castrEmbedUrl}
          width="100%"
          height="100%"
          className="w-full h-full border-0 absolute inset-0"
          scrolling="no"
          allow="autoplay; fullscreen"
          allowFullScreen
        />

        {/* TV NEWS TICKER CRAWLER OVERLAY (BOTTOM) */}
        {tvTickerEnabled && (
          <div className="absolute bottom-0 left-0 right-0 z-[10001] bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-2 px-4 flex items-center border-t border-red-500/50 shadow-2xl overflow-hidden pointer-events-none">
            <div className="shrink-0 bg-slate-950 text-amber-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md mr-3 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500 animate-ping" />
              BREAKING
            </div>
            <div className="overflow-hidden flex-1 relative">
              <div className="whitespace-nowrap font-serif font-bold text-xs sm:text-sm tracking-wide text-white animate-marquee">
                {tvTickerText} &nbsp;&bull;&nbsp; {tvTickerText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-[10005] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 text-white relative shadow-2xl animate-in scale-in duration-200">
            {/* Close share dialog */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <h3 className="font-serif font-black text-lg text-white mb-1 flex items-center gap-2">
              <Share2 className="size-5 text-amber-400" /> Share Live Stream
            </h3>
            <p className="text-xs text-white/60 mb-4">Invite others to watch the live parliamentary session.</p>

            <div className="space-y-4">
              {/* Link Input & Copy */}
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-white/90 outline-none flex-1 overflow-hidden text-ellipsis"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-amber-400 hover:bg-amber-500 text-navy text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="size-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Watch Live Cameroon Parliamentary Press on The Eagle's Eye: " + shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-[10px] font-bold text-white transition-all gap-1 cursor-pointer"
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
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-[10px] font-bold text-white transition-all gap-1 cursor-pointer"
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
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-white/5 text-[10px] font-bold text-white transition-all gap-1 cursor-pointer"
                >
                  <svg className="size-4 fill-current text-white/90" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter / X
                </a>
              </div>

              {/* QR Code Section */}
              <div className="border-t border-white/10 pt-4 flex flex-col items-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1">
                  <QrCode className="size-3.5" /> Scan QR Code
                </div>
                <div className="bg-white p-3 rounded-xl shadow-lg border border-white/10">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}&color=050596`}
                    alt="Scan to watch live stream"
                    className="size-[160px] object-contain"
                  />
                </div>
                <span className="text-[9px] text-white/40 mt-2">Scan with any smartphone camera to watch instantly</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom overlay text instruction for mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 border border-white/5 rounded-full px-4 py-1.5 text-[10px] text-white/50 backdrop-blur-sm sm:hidden pointer-events-none">
        Tap player for play/mute controls
      </div>
    </div>
  );
}
