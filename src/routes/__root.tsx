import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useContentProtection } from "../hooks/useContentProtection";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/error-reporting";
import { brandLogoUrl } from "../lib/branding";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { BreakingTicker } from "../components/site/BreakingTicker";
import { NoticeNotifications } from "../components/site/NoticeNotifications";
import { BannerRotator } from "../components/site/BannerRotator";
import { Toaster } from "../components/ui/sonner";
import { LivePlayerOverlay } from "../components/site/LivePlayerOverlay";
import { ChatWidget } from "../components/site/ChatWidget";
import { SiteLoader } from "../components/site/SiteLoader";
import { CookieConsent } from "../components/site/CookieConsent";
import { SubscribeModal } from "../components/site/SubscribeModal";
import { useArticles } from "../lib/api";

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-navy">404 - Page Not Found</h1>
        <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}

/** Full-viewport diagonal watermark — appears in every screenshot */
function WatermarkOverlay() {
  // 600 tiles: ~18 cols × 27 rows = 486 needed for a 300%×300% container
  // at 1440px wide. 600 gives comfortable headroom for large screens.
  const tiles = useMemo(() => Array.from({ length: 600 }, (_, i) => i), []);
  return (
    <div className="content-watermark" aria-hidden="true">
      <div className="content-watermark-inner">
        {tiles.map((i) => (
          <span key={i} className="content-watermark-tile">
            <img
              src="/logo.png"
              alt=""
              className="content-watermark-logo"
              draggable={false}
            />
            <span className="content-watermark-label">
              T.E.E.Media<br />theeagleseyemedia.com
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}


/** Blurs page content when window loses focus (e.g. OS screenshot tool) */
function BlurShield() {
  return <div className="content-blur-shield" aria-hidden="true" />;
}

function AppShell({ hidePublic, isStreaming }: { hidePublic: boolean; isStreaming: boolean }) {
  const { isLoading: isArticlesLoading } = useArticles();
  const [subOpen, setSubOpen] = useState(false);

  // Content protection — disabled on admin/auth routes.
  // On the streaming page we pass exemptStreaming so volume/seek keys work.
  useContentProtection(!hidePublic, isStreaming);

  // Blur content when window loses focus (OS snip tool steals focus).
  // Skipped on the streaming page because the iframe regularly captures focus,
  // which would constantly trigger the blur and break playback controls.
  useEffect(() => {
    if (hidePublic || isStreaming || typeof window === "undefined") return;

    // Skip on mobile devices since window focus is unreliable and screenshots cannot be blocked via JS anyway
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return;

    const blur  = () => {
      // Do not blur if the focus shifted to an iframe (like the video player)
      if (document.activeElement?.tagName === "IFRAME") return;
      document.body.classList.add("is-blurred");
    };
    const focus = () => document.body.classList.remove("is-blurred");
    window.addEventListener("blur",  blur);
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener("blur",  blur);
      window.removeEventListener("focus", focus);
      document.body.classList.remove("is-blurred");
    };
  }, [hidePublic, isStreaming]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpenSub = () => setSubOpen(true);
    window.addEventListener("open-subscription-checkout", handleOpenSub);
    return () => window.removeEventListener("open-subscription-checkout", handleOpenSub);
  }, []);

  return (
    <div className="min-h-screen flex flex-col no-select">
      {/* Watermark + blur shield — always present on public pages */}
      {!hidePublic && <WatermarkOverlay />}
      {!hidePublic && <BlurShield />}
      {!hidePublic && <SiteLoader isLoading={isArticlesLoading} />}
      <Toaster position="top-center" richColors />
      <LivePlayerOverlay />
      {!hidePublic && <BreakingTicker />}
      {!hidePublic && <BannerRotator />}
      {!hidePublic && <NoticeNotifications />}
      {!hidePublic && <Header />}
      <main className="flex-1"><Outlet /></main>
      {!hidePublic && <Footer />}
      {!hidePublic && <ChatWidget />}
      <CookieConsent />
      <SubscribeModal isOpen={subOpen} onClose={() => setSubOpen(false)} />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hidePublic = pathname.startsWith("/admin") || pathname.startsWith("/legal") || pathname === "/sign-in" || pathname === "/reset-password";
  // Streaming page gets relaxed protections so the video player's
  // volume, seek, and keyboard shortcuts work without interference.
  const isStreaming = pathname === "/watch-live";

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell hidePublic={hidePublic} isStreaming={isStreaming} />
    </QueryClientProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
    
    // Auto-reload on chunk load errors (common after redeployments with new hash names)
    const isChunkError = 
      /failed to fetch dynamically imported module/i.test(error.message) ||
      /loading chunk/i.test(error.message) ||
      /load chunk/i.test(error.message) ||
      /loading css chunk/i.test(error.message);
      
    if (isChunkError && typeof window !== "undefined") {
      console.warn("[Router] Chunk load error detected, reloading page...");
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif font-bold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p>
        <button onClick={() => reset()} className="mt-6 bg-navy text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "T.E.E.Media — Parliamentary News from Cameroon" },
      { name: "description", content: "The Eagle's Eye Media delivers parliamentary news, political analysis, and breaking coverage from the National Assembly, Senate, and government in Cameroon." },
      { name: "author", content: "The Eagle's Eye Media" },
      { name: "application-name", content: "T.E.E.Media" },
      { name: "generator", content: "TanStack Start" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { name: "keywords", content: "Cameroon news, parliamentary news, National Assembly, Senate, politics, government, economy, opinion, The Eagle's Eye Media, T.E.E.Media" },
      { property: "og:site_name", content: "The Eagle's Eye Media" },
      { property: "og:title", content: "The Eagle's Eye Media — Parliamentary News from Cameroon" },
      { property: "og:description", content: "Breaking parliamentary coverage, political reporting, and analysis from Yaoundé, Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Media logo" },
      { property: "og:locale", content: "en_CM" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "T.E.E.Media — Parliamentary News from Cameroon" },
      { name: "twitter:description", content: "Breaking parliamentary coverage and analysis from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
      { name: "twitter:image:alt", content: "The Eagle's Eye Media logo" },
      { name: "theme-color", content: "#050596" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "https://theeagleseyemedia.com/favicon.png" },
      { rel: "apple-touch-icon", type: "image/png", href: "https://theeagleseyemedia.com/favicon.png" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geom:ital,wght@0,300..900;1,300..900&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
