import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, X, Youtube } from "lucide-react";
import { useArticles } from "@/lib/api";
import { PillTag } from "@/components/site/StoryCard";
import { LoadMoreButton } from "@/components/site/LoadMoreButton";
import { useQuery } from "@tanstack/react-query";
import { fetchChannelVideos, YTVideo } from "@/lib/youtube";

const VIDEO_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "news-politics", label: "News & Politics" },
  { id: "style-magazine", label: "Style & Magazine" },
  { id: "newspapers-editions", label: "Newspapers & Editions" },
  { id: "documentary", label: "Documentary" },
];

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "Parliamentary Video Reports & Broadcasts — Cameroon" },
      { name: "description", content: "Explore high-definition parliamentary video reports, lawmaker press conferences, committee testimonies, and documentary coverage from Cameroon's National Assembly and Senate." },
      { name: "keywords", content: "Cameroon video news, parliamentary video reports Yaoundé, lawmaker interviews video, National Assembly video Cameroon, legislative broadcast videos" },
      { property: "og:title", content: "Parliamentary Video Reports & Broadcasts — The Eagle's Eye Media" },
      { property: "og:description", content: "Watch live parliamentary sessions, lawmaker interviews, and investigative video reports from Yaoundé, Cameroon." },
      { property: "og:type", content: "video.other" },
      { property: "og:url", content: "https://theeagleseyemedia.com/video" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Parliamentary Video Reports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Video Reports — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Live parliamentary sessions, interviews, and video reporting from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/video" }],
  }),
  component: VideoPage,
});

function VideoPage() {
  const { data: rawArticles = [] } = useArticles();
  const articles = rawArticles.filter((a: any) => a.status === "published" || !a.status);
  
  // Articles with video URLs or video indicators
  const allVideoArticles = articles.filter((a: any) => a.videoLink || a.videoUrl || (a.categorySlug || "").includes("video"));

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeVideo, setActiveVideo] = useState<{ url: string; title?: string; type: "youtube" | "vimeo" | "iframe" | "native" } | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const videoArticles = allVideoArticles.filter((a: any) => 
    activeCategory === "all" || (a.categorySlug || "").includes(activeCategory)
  );

  // Fetch YouTube Videos
  const ytVideosQuery = useQuery({
    queryKey: ["yt-channel-videos"],
    queryFn: () => fetchChannelVideos({ maxResults: 12 }),
    staleTime: 5 * 60_000,
  });

  const ytVideos: YTVideo[] = ytVideosQuery.data ?? [];

  const visibleItems = videoArticles.slice(0, visibleCount);
  const hasMore = visibleCount < videoArticles.length;

  /** Detect the video URL type and return a structured object for the player */
  function resolveVideo(url: string, title?: string): { url: string; title?: string; type: "youtube" | "vimeo" | "iframe" | "native" } | null {
    if (!url) return null;

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const m = url.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([a-zA-Z0-9_-]{6,15})/);
      const id = m ? m[1] : null;
      if (!id) return null;
      return { url: `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&fs=1`, title, type: "youtube" };
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const m = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      const id = m ? m[1] : null;
      if (!id) return null;
      return { url: `https://player.vimeo.com/video/${id}?autoplay=1`, title, type: "vimeo" };
    }

    // Direct video file (.mp4, .webm, .ogg, etc.)
    if (/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)) {
      return { url, title, type: "native" };
    }

    // Fallback — try embedding in an iframe (handles Facebook, Dailymotion, etc.)
    return { url, title, type: "iframe" };
  }

  /**
   * Returns the best thumbnail URL for a video link.
   * For YouTube: uses the official thumbnail CDN (no API key needed).
   * For other URLs: returns null so the caller can use coverImage or a placeholder.
   */
  function getVideoThumbnail(videoUrl?: string): string | null {
    if (!videoUrl) return null;
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const m = videoUrl.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([a-zA-Z0-9_-]{6,15})/);
      const id = m ? m[1] : null;
      if (id) {
        // maxresdefault is 1280×720; falls back gracefully in <img> onError
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
    }
    return null;
  }

  function handlePlayVideo(url: string, title?: string) {
    const resolved = resolveVideo(url, title);
    if (resolved) setActiveVideo(resolved);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Title */}
      <h1 className="section-rule text-3xl sm:text-4xl mb-6">Video Library</h1>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {VIDEO_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setVisibleCount(6); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              activeCategory === cat.id
                ? "bg-navy text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Video Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold uppercase tracking-wider text-navy border-b pb-2 mb-6">Reports & Coverage</h2>
        {visibleItems.length === 0 ? (
          <p className="text-muted-foreground">No local video reports available yet.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((a: any, i: number) => {
                const videoUrl = a.videoUrl || a.videoLink;
                // Priority: admin-set coverImage → YouTube auto-thumbnail → placeholder
                const thumbnail =
                  (a.coverImage && a.coverImage !== "/logo.png" ? a.coverImage : null) ??
                  getVideoThumbnail(videoUrl);

                return (
                  <div key={a.slug + i} className="group cursor-pointer" onClick={() => videoUrl && handlePlayVideo(videoUrl, a.title)}>
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900 shadow-md">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={a.title || ""}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            // maxresdefault may 404 for some videos — fall back to hqdefault
                            const img = e.currentTarget;
                            if (img.src.includes("maxresdefault")) {
                              img.src = img.src.replace("maxresdefault", "hqdefault");
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-2">
                          <Youtube className="size-10 text-red-500/60" />
                          <span className="text-xs text-slate-500">No preview available</span>
                        </div>
                      )}
                      {/* Play button overlay */}
                      <div className="absolute inset-0 grid place-items-center bg-black/40 group-hover:bg-black/20 transition">
                        <span className="grid place-items-center size-14 rounded-full bg-gold text-navy shadow-lg group-hover:scale-110 transition">
                          <Play className="size-6 fill-current ml-0.5" />
                        </span>
                      </div>
                      {i === 0 && a.alert && <div className="absolute top-3 left-3"><PillTag live>Live</PillTag></div>}
                    </div>
                    {/* Title and date */}
                    <div className="mt-3">
                      <h3 className="font-serif font-bold text-base leading-snug group-hover:text-navy transition-colors line-clamp-2">
                        {a.title || "Untitled Video"}
                      </h3>
                      {a.publishedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(a.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <LoadMoreButton
              onClick={() => setVisibleCount((c) => c + 6)}
              hasMore={hasMore}
            />
          </>
        )}
      </div>

      {/* YouTube Section */}
      {ytVideos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-wider text-navy border-b pb-2 mb-6 flex items-center gap-2">
            <Youtube className="size-6 text-red-600" /> YouTube Channel Videos
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ytVideos.map((v) => (
              <div key={v.videoId} className="group cursor-pointer" onClick={() => setActiveVideo(resolveVideo(`https://www.youtube.com/watch?v=${v.videoId}`, v.title))}>
                <div className="relative aspect-video overflow-hidden rounded-sm bg-muted shadow-md">
                  <img src={v.thumbnail} alt={v.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 grid place-items-center bg-black/35 group-hover:bg-black/25 transition">
                    <span className="grid place-items-center size-14 rounded-full bg-red-600 text-white shadow-lg group-hover:scale-110 transition"><Play className="size-6 fill-current ml-0.5" /></span>
                  </div>
                  {v.isLive && (
                    <div className="absolute top-3 left-3">
                      <PillTag live>LIVE</PillTag>
                    </div>
                  )}
                </div>
                <h3 className="font-serif font-bold text-base mt-3 leading-snug group-hover:text-navy line-clamp-2 transition-colors">{v.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{new Date(v.publishedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 p-2 text-white/80 hover:text-white bg-black/50 rounded-full hover:bg-black/80 transition"
              aria-label="Close video player"
            >
              <X className="size-5" />
            </button>

            {/* Video title */}
            {activeVideo.title && (
              <div className="px-4 pt-4 pb-2 text-white font-serif font-bold text-sm line-clamp-1">
                {activeVideo.title}
              </div>
            )}

            {/* Player area */}
            <div className="relative aspect-video w-full bg-black">
              {activeVideo.type === "native" ? (
                // Direct video file — use HTML5 video tag
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                // YouTube, Vimeo, or any other embeddable URL
                <iframe
                  src={activeVideo.url}
                  title={activeVideo.title || "Video Player"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
