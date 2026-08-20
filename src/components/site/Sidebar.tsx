import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, BookOpen, FileText } from "lucide-react";
import { useArticles, useNewsletterSubscribe, usePremiumProducts } from "@/lib/api";
import { brandLogoUrl } from "@/lib/branding";
import { useState } from "react";
import { toast } from "sonner";

export function Sidebar() {
  const articles = useArticles();
  const products = usePremiumProducts();
  const subscribe = useNewsletterSubscribe();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  const mostRead = [...(articles.data ?? [])]
    .sort((a: { likeCount?: number }, b: { likeCount?: number }) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    .slice(0, 5);

  const latestPublications = (products.data?.products ?? []).slice(0, 3);

  return (
    <aside className="space-y-8">
      {/* Published Magazine Repository Spotlight */}
      {latestPublications.length > 0 && (
        <section className="bg-slate-900 text-white p-5 rounded-xl border border-amber-400/30 shadow-md">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-amber-400" />
              <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider">Magazine</h3>
            </div>
            <Link to="/premium" className="text-[10px] text-amber-400 hover:underline font-bold uppercase tracking-wider">
              View All →
            </Link>
          </div>
          <ul className="space-y-3">
            {latestPublications.map((p) => (
              <li key={p.id} className="border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                <Link to="/premium" className="group block">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {p.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span className="capitalize font-semibold text-amber-400/90">{p.kind === "magazine" ? "Official Magazine" : p.kind.replace("_", " ")}</span>
                    <span className="font-bold text-white bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                      {p.priceXaf.toLocaleString()} XAF
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="section-rule mb-4 text-xl">Most Read</h3>
        <ol className="space-y-3">
          {mostRead.map((a: { slug: string; title: string; publishedAt?: string }, i: number) => (
            <li key={a.slug} className="flex gap-3 border-b border-border pb-3 last:border-0">
              <span className="font-serif text-3xl font-black text-gold leading-none w-7">{i + 1}</span>
              <div>
                <Link to="/article/$slug" params={{ slug: a.slug }} className="font-serif font-bold leading-snug hover:underline">
                  {a.title}
                </Link>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="section-rule mb-4 text-xl">Follow The Eagle's Eye Media</h3>
        <div className="flex gap-2">
          <a href="https://www.facebook.com/p/The-Eagles-Eye-MEDIA-100063910274137/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid place-items-center size-10 rounded bg-navy text-white hover:bg-gold hover:text-navy transition-colors"><Facebook className="size-4" /></a>
          <a href="https://x.com/TheEaglesEM" target="_blank" rel="noreferrer" aria-label="Twitter/X" className="grid place-items-center size-10 rounded bg-navy text-white hover:bg-gold hover:text-navy transition-colors"><Twitter className="size-4" /></a>
          <a href="https://www.instagram.com/theeaglesmedia?igsh=MTJlem95YzBpN2ppNw==" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid place-items-center size-10 rounded bg-navy text-white hover:bg-gold hover:text-navy transition-colors"><Instagram className="size-4" /></a>
        </div>
      </section>

      <section className="bg-card border border-border p-5 rounded">
        <div className="flex items-center gap-3 mb-2">
          <img src={brandLogoUrl} alt="The Eagle's Eye Media" className="size-12 rounded-full" width={48} height={48} />
          <div className="font-serif font-black text-navy leading-tight">About The Eagle's Eye Media</div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Cameroon's exclusive parliamentary news outlet — your Eye of the Parliament.
        </p>
        <Link to="/about" className="inline-block bg-gold text-navy text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-gold-dark transition-colors">Learn More</Link>
      </section>

      <section className="bg-navy text-white p-5 rounded">
        <h3 className="font-serif font-black text-lg mb-2">Subscribe to the Newsletter</h3>
        <p className="text-xs text-white/70 mb-3">Daily parliamentary updates, straight to your inbox.</p>
        {done ? (
          <p className="text-sm text-gold">You're subscribed. Thank you!</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) {
                toast.error("Please enter your email address.");
                return;
              }
              subscribe.mutate(
                { email, name: name || email.split("@")[0] },
                {
                  onSuccess: () => {
                    setDone(true);
                    toast.success("Subscribed successfully! Check your inbox for a welcome email.");
                  },
                  onError: (err: unknown) => {
                    toast.error(err instanceof Error ? err.message : "Subscription failed. Please try again.");
                  },
                }
              );
            }}
            className="space-y-2"
          >
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm placeholder:text-white/40 outline-none focus:border-gold" />
            <div className="flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm placeholder:text-white/40 outline-none focus:border-gold" />
              <button type="submit" disabled={subscribe.isPending} className="shrink-0 bg-gold text-navy text-[0.65rem] font-bold uppercase tracking-wider px-2.5 rounded hover:bg-gold-dark disabled:opacity-60">Subscribe</button>
            </div>
          </form>
        )}
      </section>
    </aside>
  );
}
