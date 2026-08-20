import { Link } from "@tanstack/react-router";

interface ParliamentDiplomacyCardProps {
  diplomacy: any[];
  fallbackArticles: any[];
}

export function ParliamentDiplomacyCard({ diplomacy, fallbackArticles }: ParliamentDiplomacyCardProps) {
  const items = diplomacy.length > 0 ? diplomacy.slice(0, 2) : fallbackArticles.slice(4, 6);

  return (
    <div className="rounded-xl bg-card p-5 border-0 shadow-md space-y-4 relative overflow-hidden">
      {/* Solid Cameroon Flag Accent Top Stripe */}
      <div className="h-1 w-full flex absolute top-0 left-0">
        <div className="h-full flex-1 bg-[#007A5E]" />
        <div className="h-full flex-1 bg-[#CE1126]" />
        <div className="h-full flex-1 bg-[#FCD116]" />
      </div>

      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="font-serif text-base font-black text-navy dark:text-white uppercase tracking-wider">
            Parliamentary Diplomacy &amp; Missions
          </h3>
        </div>
        <Link
          to="/parliamentary-diplomacy"
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 uppercase tracking-wider"
        >
          View All Missions →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((a: any) => (
          <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group flex flex-col space-y-2">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 shadow-sm">
              <img
                src={a.coverImage || a.imageUrl || "/logo.png"}
                alt={a.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
              />
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-navy bg-amber-400 px-2 py-0.5 rounded-full w-fit">
              Diplomatic Mission
            </span>
            <h4 className="font-serif font-bold text-sm text-navy dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
              {a.title}
            </h4>
            {a.summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {a.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
