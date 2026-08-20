import { useEffect, useRef, useState } from "react";
import { useBanners, useSettings } from "@/lib/api";

interface Banner {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  type: "image" | "adsense";
  adsenseClientId?: string;
  adsenseSlotId?: string;
  active: boolean;
  sortOrder: number;
}

/** Injects the Google AdSense script once, idempotently */
function useAdSenseScript(clientId: string | undefined) {
  useEffect(() => {
    if (!clientId || typeof window === "undefined") return;
    if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) return;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [clientId]);
}

/** Single slide: Banner image displayed fully across container width for maximum readability */
function ImageSlide({ banner }: { banner: Banner }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [banner.id, banner.imageUrl]);

  const Tag = banner.linkUrl ? "a" : "div";
  const linkProps = banner.linkUrl
    ? {
        href: banner.linkUrl,
        target: banner.linkUrl.startsWith("http") ? "_blank" : undefined,
        rel: banner.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined,
      }
    : {};

  const hasFailed = imgError || !banner.imageUrl;

  return (
    <Tag
      {...(linkProps as any)}
      className="block w-full h-full cursor-pointer group relative overflow-hidden bg-navy"
      aria-label={banner.title}
    >
      {banner.imageUrl && !imgError ? (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-contain object-center group-hover:scale-[1.01] transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="relative z-10 w-full h-full flex items-center justify-between px-6 sm:px-12 text-white select-none">
          <span className="font-serif font-extrabold text-sm sm:text-lg text-white tracking-wide">
            {banner.title}
          </span>
          <span className="hidden md:inline-block text-xs text-amber-300 font-semibold underline underline-offset-4 group-hover:text-white transition-colors">
            Explore Special Coverage →
          </span>
        </div>
      )}
    </Tag>
  );
}

/** Single slide: Google AdSense slot shifted to right and balanced */
function AdSenseSlide({ banner }: { banner: Banner }) {
  useAdSenseScript(banner.adsenseClientId);

  useEffect(() => {
    if (!banner.adsenseClientId || !banner.adsenseSlotId) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_) {}
  }, [banner.adsenseClientId, banner.adsenseSlotId]);

  return (
    <div className="w-full h-full bg-slate-950 text-white relative flex items-center justify-between px-4 sm:px-8 overflow-hidden">
      {/* Left side balanced label */}
      <div className="relative z-10 hidden sm:flex flex-col justify-center max-w-[40%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            SPONSORED PLACEMENT
          </span>
        </div>
        <p className="font-serif font-bold text-xs md:text-sm text-white/90 leading-tight">
          Verified National Assembly &amp; Senate Coverage Partner
        </p>
      </div>

      {/* Right-shifted Ad Container balanced with site container */}
      <div className="relative z-10 w-full sm:w-auto flex-1 max-w-[728px] h-[90px] mx-auto sm:ml-auto flex items-center justify-center bg-black/40 backdrop-blur-md rounded-lg border border-white/20 shadow-lg overflow-hidden">
        {banner.adsenseClientId && banner.adsenseSlotId ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-client={banner.adsenseClientId}
            data-ad-slot={banner.adsenseSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="text-xs text-white/80 select-none font-mono flex flex-col items-center">
            <span className="font-bold tracking-wider text-amber-300">GOOGLE AD UNIT</span>
            <span className="text-[10px] text-white/60">Waiting for ad stream response...</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Progress dots */
function Dots({ total, current, onSelect }: { total: number; current: number; onSelect: (i: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Slide ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-amber-400 shadow-md"
              : "w-2 bg-white/40 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  );
}

const ROTATE_INTERVAL_MS = 5_000;

export function BannerRotator() {
  const { data: settings } = useSettings();
  const { data: remoteBanners } = useBanners();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If ad banner is globally disabled, show nothing
  if (settings && settings.adBannerEnabled === false) return null;

  let banners: Banner[] = Array.isArray(remoteBanners) && remoteBanners.length > 0
    ? remoteBanners
    : [];

  // Fallback 1: Check custom settings banner
  if (banners.length === 0 && settings?.adBannerImageUrl) {
    banners = [
      {
        id: "setting-custom-banner",
        title: settings.siteName || "Cameroon Parliamentary Press & Analysis",
        imageUrl: settings.adBannerImageUrl,
        linkUrl: settings.adBannerLinkUrl || "#",
        type: "image",
        active: true,
        sortOrder: 0,
      },
    ];
  }

  // Fallback 2: Check Google Adsense settings
  if (banners.length === 0 && settings?.googleAdsEnabled && settings?.googleAdsenseClientId && settings?.googleAdsenseSlotId) {
    banners = [
      {
        id: "setting-google-adsense",
        title: "Google Advertisement",
        type: "adsense",
        adsenseClientId: settings.googleAdsenseClientId,
        adsenseSlotId: settings.googleAdsenseSlotId,
        active: true,
        sortOrder: 0,
      },
    ];
  }

  // If no active banners are uploaded or configured, return null
  if (banners.length === 0) return null;

  function goTo(index: number) {
    if (index === current) return;
    setCurrent(index);
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, ROTATE_INTERVAL_MS);
  }

  return (
    <div className="w-full bg-slate-950 py-3 border-b border-white/10 shadow-inner">
      {/* Matches exact website content container width max-w-7xl px-4 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <BannerRotatorInner
          banners={banners}
          current={current}
          animating={animating}
          onGoTo={goTo}
          onStartTimer={startTimer}
          timerRef={timerRef}
        />
      </div>
    </div>
  );
}

function BannerRotatorInner({
  banners,
  current,
  animating,
  onGoTo,
  onStartTimer,
  timerRef,
}: {
  banners: Banner[];
  current: number;
  animating: boolean;
  onGoTo: (i: number) => void;
  onStartTimer: () => void;
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
}) {
  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    onStartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length]);

  const slide = banners[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow-2xl border border-white/15 h-24 md:h-[120px]"
      role="region"
      aria-label="Advertisement banner"
    >
      {/* All slides container */}
      <div
        className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out flex flex-col"
        style={{ transform: `translateY(-${current * 100}%)` }}
      >
        {banners.map((slide, idx) => (
          <div key={slide.id || idx} className="w-full h-full flex-shrink-0 flex justify-center items-center">
            {slide.type === "adsense" ? (
              <AdSenseSlide banner={slide} />
            ) : (
              <ImageSlide banner={slide} />
            )}
          </div>
        ))}
      </div>

      {/* "ADVERTISEMENT" label */}
      <div className="absolute top-2.5 right-4 z-20 pointer-events-none">
        <span className="text-[9px] font-extrabold tracking-[0.25em] text-amber-300 uppercase select-none drop-shadow">
          ADVERTISEMENT
        </span>
      </div>

      {/* Navigation dots disabled as requested */}
      {/* <Dots total={banners.length} current={current} onSelect={onGoTo} /> */}
    </div>
  );
}
