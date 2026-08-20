import { Link } from "@tanstack/react-router";

interface RecentNewsRailProps {
  slides: any[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  allArticles: any[];
}

export function RecentNewsRail({ slides, activeIndex, onSelectIndex, allArticles }: RecentNewsRailProps) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <h2 className="font-serif text-lg font-black text-navy">Recent News</h2>
      <div className="space-y-3 mt-3">
        {slides.map((slide, index) => (
          <button
            key={slide.slug}
            type="button"
            onClick={() => onSelectIndex(index)}
            className={`flex w-full items-start gap-3 rounded p-2 text-left transition ${index === activeIndex ? "bg-navy text-white" : "hover:bg-muted"}`}
          >
            <span className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold ${index === activeIndex ? "bg-gold text-navy" : "bg-gold/15 text-navy"}`}>
              {index + 1}
            </span>
            <div>
              <div className="font-serif text-sm font-bold leading-snug">{slide.title}</div>
              <div className={`mt-1 text-[0.7rem] uppercase tracking-[0.18em] ${index === activeIndex ? "text-white/65" : "text-muted-foreground"}`}>
                {slide.category || slide.categorySlug} · {slide.publishedAt ? new Date(slide.publishedAt).toLocaleDateString() : slide.timeAgo}
              </div>
            </div>
          </button>
        ))}
        {allArticles.length > slides.length && (
          <div className="pt-3 mt-2 border-t border-border">
            <div className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-2">Trending now</div>
            <div className="space-y-2">
              {allArticles.slice(slides.length, slides.length + 3).map((a) => (
                <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="block text-sm font-serif font-bold leading-snug hover:text-gold transition-colors line-clamp-2">
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
