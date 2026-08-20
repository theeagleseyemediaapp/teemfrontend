import { Link } from "@tanstack/react-router";

interface Article {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  imageUrl?: string;
  categorySlug?: string;
  publishedAt?: string;
  timeAgo?: string;
  author?: string;
}

interface LeftRailRubricsProps {
  parliamentToday: Article[];
  constituencyActions: Article[];
  diplomacy: Article[];
  fallbackArticles: Article[];
}

export function LeftRailRubrics({
  parliamentToday,
  constituencyActions,
  diplomacy,
  fallbackArticles,
}: LeftRailRubricsProps) {
  const getSectionArticles = (sectionList: Article[], fallbackOffset: number, count = 3) => {
    if (sectionList.length >= count) return sectionList.slice(0, count);
    const combined = [...sectionList];
    const fallbackSlice = fallbackArticles.slice(fallbackOffset, fallbackOffset + (count - sectionList.length));
    return [...combined, ...fallbackSlice].slice(0, count);
  };

  const committeeItems = getSectionArticles(parliamentToday, 0, 3);
  const constituencyItems = getSectionArticles(constituencyActions, 3, 3);

  // Awards & Honors items using reliable database/fallback articles
  const awardItems = getSectionArticles([], 6, 3);

  return (
    <div className="space-y-6">
      {/* RUBRIC 1: COMMITTEE ECHOES & PLENARIES */}
      <div className="rounded-lg bg-card p-4 border-0 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
          <Link
            to="/committee-echoes"
            className="font-serif text-sm font-black text-navy uppercase tracking-wider hover:text-amber-500 transition-colors"
          >
            Committee Echoes
          </Link>
          <span className="text-[9px] font-extrabold text-red-600 uppercase bg-red-600/10 px-2 py-0.5 rounded">
            Plenary
          </span>
        </div>

        <div className="space-y-3">
          {committeeItems.map((a, idx) => {
            const img = a.coverImage || a.imageUrl || "/logo.png";
            if (idx === 0) {
              return (
                <div key={a.slug} className="group border-b border-border/10 pb-3">
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="block mb-2 overflow-hidden rounded-md aspect-[16/9] bg-slate-100">
                    <img
                      src={img}
                      alt={a.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                    />
                  </Link>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-navy bg-amber-400 px-1.5 py-0.5 rounded-sm inline-block mb-1">
                    {a.categorySlug ? a.categorySlug.replace("-", " ") : "Committee Echoes"}
                  </span>
                  <Link
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="block font-serif font-bold text-xs leading-snug text-navy group-hover:text-amber-500 transition-colors line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : a.timeAgo || "Active Hearing"}
                  </div>
                </div>
              );
            }
            return (
              <div key={a.slug} className="group flex gap-2.5 items-center border-b border-border/10 pb-2.5 last:border-none last:pb-0">
                <Link to="/article/$slug" params={{ slug: a.slug }} className="shrink-0 w-16 h-12 overflow-hidden rounded bg-slate-100">
                  <img
                    src={img}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="block font-serif font-bold text-[11px] leading-snug text-navy group-hover:text-amber-500 transition-colors line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : a.timeAgo || "Plenary Update"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border/10 text-right">
          <Link
            to="/committee-echoes"
            className="text-[10px] font-extrabold uppercase tracking-wider text-navy hover:text-amber-500 transition-colors inline-flex items-center gap-1"
          >
            View All Committee Echoes →
          </Link>
        </div>
      </div>

      {/* RUBRIC 2: CONSTITUENCY ACTIONS */}
      <div className="rounded-lg bg-card p-4 border-0 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
          <Link
            to="/constituency-actions"
            className="font-serif text-sm font-black text-navy uppercase tracking-wider hover:text-amber-500 transition-colors"
          >
            Constituency Actions
          </Link>
          <span className="text-[9px] font-extrabold text-blue-600 uppercase bg-blue-600/10 px-2 py-0.5 rounded">
            Field Reports
          </span>
        </div>

        <div className="space-y-3">
          {constituencyItems.map((a, idx) => {
            const img = a.coverImage || a.imageUrl || "/logo.png";
            if (idx === 0) {
              return (
                <div key={a.slug} className="group border-b border-border/10 pb-3">
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="block mb-2 overflow-hidden rounded-md aspect-[16/9] bg-slate-100">
                    <img
                      src={img}
                      alt={a.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                    />
                  </Link>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-navy bg-amber-400 px-1.5 py-0.5 rounded-sm inline-block mb-1">
                    Constituency Report
                  </span>
                  <Link
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="block font-serif font-bold text-xs leading-snug text-navy group-hover:text-amber-500 transition-colors line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : a.timeAgo || "Field Update"}
                  </div>
                </div>
              );
            }
            return (
              <div key={a.slug} className="group flex gap-2.5 items-center border-b border-border/10 pb-2.5 last:border-none last:pb-0">
                <Link to="/article/$slug" params={{ slug: a.slug }} className="shrink-0 w-16 h-12 overflow-hidden rounded bg-slate-100">
                  <img
                    src={img}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="block font-serif font-bold text-[11px] leading-snug text-navy group-hover:text-amber-500 transition-colors line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : a.timeAgo || "MP Action"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border/10 text-right">
          <Link
            to="/constituency-actions"
            className="text-[10px] font-extrabold uppercase tracking-wider text-navy hover:text-amber-500 transition-colors inline-flex items-center gap-1"
          >
            View All Constituency Reports →
          </Link>
        </div>
      </div>

      {/* RUBRIC 3: EAGLE'S EYE AWARDS & HONORS */}
      <div className="rounded-lg bg-card p-4 border-0 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
          <Link
            to="/awards"
            className="font-serif text-sm font-black text-navy uppercase tracking-wider hover:text-amber-500 transition-colors"
          >
            Eagle's Eye Awards
          </Link>
          <span className="text-[9px] font-extrabold text-amber-600 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
            Honors
          </span>
        </div>

        <div className="space-y-3">
          {awardItems.map((a, idx) => {
            const img = a.coverImage || a.imageUrl || "/logo.png";
            if (idx === 0) {
              return (
                <div key={a.slug} className="group border-b border-border/10 pb-3">
                  <Link to="/awards" className="block mb-2 overflow-hidden rounded-md aspect-[16/9] bg-slate-100">
                    <img
                      src={img}
                      alt={a.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                    />
                  </Link>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-navy bg-amber-400 px-1.5 py-0.5 rounded-sm inline-block mb-1">
                    Legislative Award
                  </span>
                  <Link
                    to="/awards"
                    className="block font-serif font-bold text-xs leading-snug text-navy group-hover:text-amber-500 transition-colors line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Honors 2025
                  </div>
                </div>
              );
            }
            return (
              <div key={a.slug} className="group flex gap-2.5 items-center border-b border-border/10 pb-2.5 last:border-none last:pb-0">
                <Link to="/awards" className="shrink-0 w-16 h-12 overflow-hidden rounded bg-slate-100">
                  <img
                    src={img}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/awards"
                    className="block font-serif font-bold text-[11px] leading-snug text-navy group-hover:text-amber-500 transition-colors line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    Award Winner
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border/10 text-right">
          <Link
            to="/awards"
            className="text-[10px] font-extrabold uppercase tracking-wider text-navy hover:text-amber-500 transition-colors inline-flex items-center gap-1"
          >
            View All Awards &amp; Honors →
          </Link>
        </div>
      </div>
    </div>
  );
}
