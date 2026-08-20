import { Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";

interface ExclusiveInterviewsProps {
  interviews: any[];
  layout?: "horizontal" | "vertical";
}

export function ExclusiveInterviews({ interviews, layout = "horizontal" }: ExclusiveInterviewsProps) {
  if (!interviews.length) return null;

  const isVertical = layout === "vertical";

  return (
    <div className={isVertical ? "space-y-4" : "mt-8 border-t border-border pt-6"}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
        <h3 className="font-serif font-black text-navy text-base flex items-center gap-2">
          <Mic className="size-4 text-gold" /> Exclusive Interviews
        </h3>
        <Link to="/" search={{ q: "interview" }} className="text-[10px] font-bold uppercase tracking-wider text-navy hover:text-gold">View all →</Link>
      </div>

      {isVertical ? (
        <div className="space-y-3">
          {interviews.slice(0, 4).map((a, idx) => (
            <Link key={a.slug + idx} to="/article/$slug" params={{ slug: a.slug }} className="group block border-b border-border/30 last:border-0 pb-3 last:pb-0">
              <div className="flex gap-3">
                <div className="relative w-24 aspect-[4/3] shrink-0 overflow-hidden rounded bg-navy/10 border border-border">
                  <img src={a.coverImage || a.image || "/logo.png"} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 grid place-items-center bg-black/15 group-hover:bg-black/5 transition">
                    <span className="grid place-items-center size-6 rounded-full bg-gold text-navy shadow-sm"><Mic className="size-3 fill-current" /></span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.6rem] uppercase tracking-widest text-gold font-bold line-clamp-1">{a.author || "Guest"}</div>
                  <h4 className="font-serif font-bold text-xs mt-0.5 leading-snug group-hover:text-gold line-clamp-3">{a.title}</h4>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {interviews.slice(0, 3).map((a, idx) => (
            <Link key={a.slug + idx} to="/article/$slug" params={{ slug: a.slug }} className="group">
              <div className="relative aspect-video overflow-hidden rounded bg-navy/10 shadow-sm border border-border">
                <img src={a.coverImage || a.image || "/logo.png"} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 grid place-items-center bg-black/10 group-hover:bg-black/5 transition">
                  <span className="grid place-items-center size-9 rounded-full bg-gold text-navy shadow-lg"><Mic className="size-4 fill-current" /></span>
                </div>
              </div>
              <div className="text-[0.65rem] uppercase tracking-widest text-gold font-bold mt-2">{a.author || "Guest"}</div>
              <h4 className="font-serif font-bold text-xs mt-1 leading-snug group-hover:text-gold line-clamp-2">{a.title}</h4>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
