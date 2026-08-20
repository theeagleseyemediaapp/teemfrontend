import { Link } from "@tanstack/react-router";
import { StoryCard } from "@/components/site/StoryCard";

interface BillsLegislationCardProps {
  bills: any[];
}

export function BillsLegislationCard({ bills }: BillsLegislationCardProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card p-4 border-0 shadow-md relative overflow-hidden">
        {/* Solid Cameroon Flag Accent Top Stripe */}
        <div className="h-1 w-full flex absolute top-0 left-0">
          <div className="h-full flex-1 bg-[#007A5E]" />
          <div className="h-full flex-1 bg-[#CE1126]" />
          <div className="h-full flex-1 bg-[#FCD116]" />
        </div>

        <h3 className="font-serif text-sm font-black text-navy dark:text-white mb-3 pt-1 flex items-center justify-between">
          <span>Bills &amp; Legislation</span>
          <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
        </h3>
        <div className="space-y-4">
          {bills.length > 0 ? (
            <>
              <StoryCard a={bills[0]} size="sm" />
              {bills.slice(1).map((a: any) => (
                <div key={a.slug} className="pt-3 border-0">
                  <span className="text-[10px] font-black tracking-widest text-navy bg-amber-400 px-2 py-0.5 uppercase mb-1 inline-block rounded-full">Parliament Press</span>
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="block font-serif font-bold text-sm leading-snug hover:text-amber-500 transition-colors">
                    {a.title}
                  </Link>
                </div>
              ))}
            </>
          ) : (
             <p className="text-xs text-muted-foreground">Legislative bills updates processing.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-navy text-white p-4 text-center border-0 shadow-md">
        <span className="text-[9px] font-extrabold tracking-wider text-amber-400 uppercase block mb-2 select-none">PARLIAMENT PRESS DISPATCH</span>
        <div className="w-full bg-slate-900/80 rounded-lg p-4 flex flex-col items-center justify-center text-xs">
          <div className="font-serif font-bold text-sm text-white">Subscribe to Daily Journal</div>
          <p className="text-[11px] text-slate-300 mt-1">Get verified National Assembly &amp; Senate updates delivered daily.</p>
          <Link to="/premium" className="mt-3 inline-block bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full hover:bg-amber-300 transition-all shadow-sm">Subscribe Now</Link>
        </div>
      </div>
    </div>
  );
}
