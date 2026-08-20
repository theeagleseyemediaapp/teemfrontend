import { Link } from "@tanstack/react-router";

export function TrendingMarquee() {
  return (
    <div className="bg-amber-400 text-navy py-2 overflow-x-auto no-scrollbar border-0">
      <div className="mx-auto max-w-7xl px-4 flex items-center min-w-max gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest shrink-0 text-navy bg-white px-2.5 py-0.5 rounded-full shadow-sm">
          Trending Now
        </span>
        <div className="flex gap-4 text-xs font-bold whitespace-nowrap">
          <Link to="/" search={{ q: "budget" }} className="hover:underline">
            #Budget2026 Debates Begin
          </Link>
          <span className="text-navy/50">•</span>
          <Link to="/" search={{ q: "health" }} className="hover:underline">
            Presidential Decree on Health Sector
          </Link>
          <span className="text-navy/50">•</span>
          <Link to="/" search={{ q: "corruption" }} className="hover:underline">
            Anti-Corruption Commission Report
          </Link>
          <span className="text-navy/50">•</span>
          <Link to="/senate" className="hover:underline">
            Senate Suspends Plenary
          </Link>
          <span className="text-navy/50">•</span>
          <Link to="/" search={{ q: "youth" }} className="hover:underline">
            Youth Employment Charter
          </Link>
        </div>
      </div>
    </div>
  );
}
