import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export function PillTag({ children, live }: { children: React.ReactNode; live?: boolean }) {
  if (live) return (
    <span className="inline-flex items-center gap-1.5 bg-destructive text-white text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
      <span className="live-dot bg-white" /> Live
    </span>
  );
  return <span className="pill-tag">{children}</span>;
}

function getYouTubeThumbnail(videoUrl?: string): string | null {
  if (!videoUrl) return null;
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    const m = videoUrl.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([a-zA-Z0-9_-]{6,15})/);
    const id = m ? m[1] : null;
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

export function StoryCard({ a, size = "md" }: { a: any; size?: "lg" | "md" | "sm" | "row" }) {
  const videoUrl = a.videoUrl || a.videoLink;
  const image =
    (a.coverImage && a.coverImage !== "/logo.png" ? a.coverImage : null) ??
    (a.imageUrl && a.imageUrl !== "/logo.png" ? a.imageUrl : null) ??
    getYouTubeThumbnail(videoUrl) ??
    "/logo.png";
  const category = a.categorySlug || a.category || "News";
  const time = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : a.timeAgo;
  const isLive = a.live || a.alert;

  if (size === "row") {
    return (
      <Link to="/article/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-4 border-b border-border last:border-0">
        <div className="aspect-[4/3] overflow-hidden rounded bg-muted">
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="min-w-0">
          <PillTag live={isLive}>{category}</PillTag>
          <h3 className="font-serif font-bold text-base sm:text-lg mt-1.5 leading-snug group-hover:text-navy/80">{a.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.summary}</p>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><Clock className="size-3" /> {time} · {a.author || "Newsroom"}</div>
        </div>
      </Link>
    );
  }
  return (
    <Link to="/article/$slug" params={{ slug: a.slug }} className="group block">
      <div className={`relative overflow-hidden bg-muted ${size === "lg" ? "aspect-[16/10]" : "aspect-[16/10]"} rounded-sm`}>
        <img src={image} alt="" loading={size === "lg" ? undefined : "lazy"} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {isLive && (
          <div className="absolute top-3 left-3"><PillTag live>Live</PillTag></div>
        )}
      </div>
      <div className="pt-3">
        {!isLive && <PillTag>{category}</PillTag>}
        <h3 className={`font-serif font-bold leading-snug mt-1.5 group-hover:underline ${size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-base" : "text-lg"}`}>{a.title}</h3>
        {size !== "sm" && <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{a.summary}</p>}
        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><Clock className="size-3" /> {time}{size === "lg" && ` · ${a.author || "Newsroom"}`}</div>
      </div>
    </Link>
  );
}
