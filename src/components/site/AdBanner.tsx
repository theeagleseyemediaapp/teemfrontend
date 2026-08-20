import { useEffect, useState } from "react";
import { useSettings } from "@/lib/api";

export function AdBanner() {
  const { data: settings, isLoading } = useSettings();
  const [imgError, setImgError] = useState(false);

  if (isLoading || !settings) return null;

  const {
    adBannerImageUrl,
    adBannerLinkUrl,
    adBannerEnabled,
    googleAdsEnabled,
    googleAdsenseClientId,
    googleAdsenseSlotId,
  } = settings;

  // If the banner is globally disabled, do not render anything
  // If image errored and no Google Ads, do not render banner fallback box
  if (imgError && !googleAdsEnabled) return null;
  if (!adBannerImageUrl && !googleAdsEnabled) return null;

  return (
    <div className="w-full bg-slate-950 py-3 border-b border-white/10 shadow-inner">
      {/* Matches exact website content container width max-w-7xl px-4 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div
          className="w-full relative overflow-hidden rounded-lg border border-white/15 shadow-2xl flex items-center justify-between bg-navy"
          style={{ height: "clamp(140px, 20vw, 240px)" }}
        >
          {/* Top Label for Advertisement */}
          <span className="absolute top-2.5 right-4 z-20 text-[9px] font-extrabold tracking-[0.25em] text-amber-300 uppercase select-none drop-shadow">
            ADVERTISEMENT
          </span>

          {/* Ad Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-between">
            {googleAdsEnabled && googleAdsenseClientId && googleAdsenseSlotId ? (
              <div className="w-full h-full flex items-center justify-between gap-4 px-4 sm:px-8">
                {/* Left Column Info */}
                <div className="hidden sm:flex flex-col justify-center max-w-[40%] text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    PARLIAMENT MEDIA AD
                  </span>
                  <p className="font-serif font-bold text-xs sm:text-sm leading-tight">
                    Google Ad Stream Unit
                  </p>
                </div>
                {/* Right-shifted Ad Unit */}
                <div className="w-full sm:w-auto flex-1 max-w-[728px] h-[90px] ml-auto bg-black/40 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center relative overflow-hidden shadow-lg">
                  <ins
                    className="adsbygoogle"
                    style={{ display: "block", width: "100%", height: "100%" }}
                    data-ad-client={googleAdsenseClientId}
                    data-ad-slot={googleAdsenseSlotId}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-white/60 text-xs">
                    <div className="font-mono text-[10px] tracking-wider uppercase mb-1 text-amber-300">Google Ad Slot</div>
                    <div className="text-[9px] opacity-75">{googleAdsenseClientId} / {googleAdsenseSlotId}</div>
                  </div>
                </div>
              </div>
            ) : adBannerImageUrl && !imgError ? (
              <a
                href={adBannerLinkUrl || "#"}
                target={adBannerLinkUrl?.startsWith("http") ? "_blank" : undefined}
                rel={adBannerLinkUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-full h-full block group relative overflow-hidden"
              >
                <img
                  src={adBannerImageUrl}
                  alt="Advertisement Banner"
                  className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
                  onError={() => setImgError(true)}
                />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
