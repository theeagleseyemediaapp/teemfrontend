import { Link } from "@tanstack/react-router";
import { MessageSquareQuote, FileSearch, ArrowRight } from "lucide-react";

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

interface OpinionAnalysisShowcaseProps {
  opinions: Article[];
  analysis: Article[];
  fallbackArticles: Article[];
}

export function OpinionAnalysisShowcase({
  opinions,
  analysis,
  fallbackArticles,
}: OpinionAnalysisShowcaseProps) {
  const opinionItems = opinions.length > 0 ? opinions.slice(0, 3) : fallbackArticles.slice(0, 3);
  const analysisItems = analysis.length > 0 ? analysis.slice(0, 3) : fallbackArticles.slice(3, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-xl bg-gradient-to-br from-navy via-navy/95 to-navy/90 text-white p-6 sm:p-10 border border-amber-400/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6 mb-8 relative z-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
            Opinion &amp; Policy Analysis
          </h2>
          <div className="flex items-center gap-3">
            <Link
              to="/opinion"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-md border border-white/10 transition-all"
            >
              All Opinion <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-Column Grid: Left Opinion, Right Analysis */}
        <div className="grid gap-10 lg:grid-cols-2 relative z-10">
          {/* LEFT: OPINION & COLUMNS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <MessageSquareQuote className="size-5 text-amber-400" />
              <h3 className="font-serif font-extrabold text-lg text-white uppercase tracking-wider">
                Columns &amp; Commentary
              </h3>
            </div>

            <div className="space-y-5">
              {opinionItems.map((a) => {
                const img = a.coverImage || a.imageUrl || "/logo.png";
                return (
                  <Link
                    key={a.slug}
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="group block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="size-12 rounded-full object-cover ring-2 ring-amber-400 shrink-0 bg-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                            {a.author || "Senior Columnist"}
                          </span>
                          <span className="text-[10px] text-white/50">
                            {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : a.timeAgo || "Opinion"}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-2 mt-1 leading-snug">
                          &ldquo;{a.title}&rdquo;
                        </h4>
                        {a.summary && (
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                            {a.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: IN-DEPTH POLICY ANALYSIS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <FileSearch className="size-5 text-blue-400" />
              <h3 className="font-serif font-extrabold text-lg text-white uppercase tracking-wider">
                In-Depth Policy Analysis
              </h3>
            </div>

            <div className="space-y-5">
              {analysisItems.map((a, idx) => {
                const img = a.coverImage || a.imageUrl || "/logo.png";
                if (idx === 0) {
                  return (
                    <Link
                      key={a.slug}
                      to="/article/$slug"
                      params={{ slug: a.slug }}
                      className="group block rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 overflow-hidden transition-all duration-300 p-4"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden rounded-md bg-black/40 mb-3 relative">
                        <img
                          src={img}
                          alt={a.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                          SPECIAL ANALYSIS
                        </span>
                      </div>
                      <h4 className="font-serif font-black text-lg text-white group-hover:text-amber-300 transition-colors leading-tight">
                        {a.title}
                      </h4>
                      {a.summary && (
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                          {a.summary}
                        </p>
                      )}
                      <div className="mt-2.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>By {a.author || "Legislative Research Desk"}</span>
                        <span className="text-white/60">Read Special Brief →</span>
                      </div>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={a.slug}
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="group flex gap-3.5 items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                  >
                    <div className="shrink-0 w-20 h-14 overflow-hidden rounded-md bg-black/40">
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider block">
                        Policy Report
                      </span>
                      <h4 className="font-serif font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
          <Link
            to="/opinion"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-2.5 rounded-full font-black uppercase text-xs tracking-wider transition-all shadow-md"
          >
            Explore All Opinion Columns &amp; Legislative Analysis →
          </Link>
        </div>
      </div>
    </section>
  );
}
