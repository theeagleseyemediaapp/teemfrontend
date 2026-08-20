import { Link } from "@tanstack/react-router";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoReportsProps {
  videoStrip: any[];
}

/** Extract YouTube video ID from any YouTube URL format */
function getYouTubeThumbnail(videoUrl?: string): string | null {
  if (!videoUrl) return null;
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    const m = videoUrl.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([a-zA-Z0-9_-]{6,15})/);
    const id = m ? m[1] : null;
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

export function VideoReports({ videoStrip }: VideoReportsProps) {
  if (!videoStrip.length) return null;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we are at the end, scroll back to start, else scroll right
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one item roughly
          scrollRef.current.scrollBy({ left: clientWidth > 640 ? 340 : clientWidth * 0.85, behavior: 'smooth' });
        }
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const amount = clientWidth > 640 ? 340 : clientWidth * 0.85;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-4 relative group">
      <div className="flex items-center justify-between mb-4 hidden">
        {/* Header moved to index.tsx */}
        <h3 className="font-serif font-black text-navy text-lg flex items-center gap-2">
          <Play className="size-5 text-gold fill-current" /> Video Reports &amp; Broadcasts
        </h3>
        <Link to="/video" className="text-xs font-bold uppercase tracking-wider text-navy hover:text-gold">View all →</Link>
      </div>

      <button
        onClick={(e) => { e.preventDefault(); scroll('left'); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-white/90 shadow-md text-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        onClick={(e) => { e.preventDefault(); scroll('right'); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-white/90 shadow-md text-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
      >
        <ChevronRight className="size-5" />
      </button>

      <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {videoStrip.slice(0, 5).map((a, idx) => {
          const videoUrl = a.videoUrl || a.videoLink;
          // Priority: admin cover image → YouTube auto-thumbnail → logo fallback
          const thumbnail =
            (a.coverImage && a.coverImage !== "/logo.png" ? a.coverImage : null) ??
            getYouTubeThumbnail(videoUrl) ??
            "/logo.png";

          return (
            <Link key={a.slug + idx} to="/article/$slug" params={{ slug: a.slug }} className="flex-none w-[85%] sm:w-[320px] snap-center flex flex-col gap-3 group bg-slate-50 rounded-xl p-3 border border-border/50">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-border">
                <img
                  src={thumbnail}
                  alt={a.title || ""}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.includes("hqdefault")) {
                      img.src = "/logo.png";
                    }
                  }}
                />
                {(videoUrl || a.categorySlug === "video" || a.live || a.alert) && (
                  <div className="absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid place-items-center size-7 rounded-full bg-gold text-navy shadow">
                      <Play className="size-3 fill-current ml-0.5" />
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col">
                <div className="text-[0.65rem] uppercase tracking-widest text-gold font-bold mb-1">Broadcast</div>
                <h4 className="font-serif font-bold text-sm leading-snug group-hover:text-gold transition-colors line-clamp-2">
                  {a.title || "Untitled Video"}
                </h4>
                {a.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{a.summary}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
