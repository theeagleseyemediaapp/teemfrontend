import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Facebook, ShieldCheck, Landmark, BookOpen, AlertCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import { brandLogoUrl } from "@/lib/branding";
import { useSubmitSupportMessage } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us & Editorial Standards — The Eagle's Eye Media" },
      { name: "description", content: "The Eagle's Eye Media is Cameroon's leading independent parliamentary news platform and triweekly journal publication, headquartered in Yaoundé. Learn about our editorial board, investigative mission, and non-partisan coverage of the National Assembly and Senate." },
      { name: "keywords", content: "About The Eagle's Eye Media, Cameroon newsroom, parliamentary press Yaoundé, Cameroon investigative journalism, editorial standards Cameroon, National Assembly press corps" },
      { property: "og:title", content: "About Us — The Eagle's Eye Media" },
      { property: "og:description", content: "Cameroon's premier daily parliamentary press and triweekly journal publication, based in Yaoundé." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/about" },
      { property: "og:image", content: brandLogoUrl },
      { property: "og:image:alt", content: "The Eagle's Eye Media Newsroom & Editorial Bureau" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Us & Editorial Standards — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Independent reporting, parliamentary transparency, and newsroom excellence from Cameroon." },
      { name: "twitter:image", content: brandLogoUrl },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMsg = useSubmitSupportMessage();

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill out all fields of the form.");
      return;
    }

    submitMsg.mutate(
      {
        name,
        email,
        subject: "Press Tip from About Page",
        message,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Thank you! Your news tip has been sent to our newsroom.");
          setName("");
          setEmail("");
          setMessage("");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to submit tip. Please try again.");
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 space-y-20">
      {/* Header Banner */}
      <section className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <img src={brandLogoUrl} alt="The Eagle's Eye Media" className="size-36 rounded-full ring-4 ring-gold bg-white shadow-xl" width={144} height={144} />
          <div className="absolute -bottom-1 -right-1 bg-gold text-navy p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-950">
            <ShieldCheck className="size-5" />
          </div>
        </div>
        <div className="max-w-2xl">
          <h1 className="font-serif font-black text-4xl sm:text-6xl text-navy dark:text-white leading-tight">The Eagle's Eye Media</h1>
          <p className="text-gold uppercase tracking-[0.3em] text-xs sm:text-sm font-bold mt-3">Eye of the Parliament</p>
          <div className="h-1 w-20 bg-gold mx-auto mt-6" />
        </div>
      </section>

      {/* Main Intro & Editorial Pillars */}
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6 text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-base">
          <p className="text-xl font-serif text-navy dark:text-slate-100 font-semibold leading-normal">
            The Eagle's Eye Media (T.E.E.Media) stands as Cameroon's premium, exclusive legislative news outlet. Based in Yaoundé, we operate right from the heartbeat of the nation's decision-making chambers.
          </p>
          <p>
            Unlike generalist news outlets, T.E.E.Media is focused on legislative affairs. Our journalists sit inside committee hearing rooms, review budget bills line-by-line, and report directly from the corridors of the National Assembly and the Senate. We bridge the gap between complex governmental debates and the public, delivering clear, neutral, and actionable insights.
          </p>
          <p>
            We publish news digitally every day to keep the nation updated in real-time. In addition, our physical print journals are published triweekly and distributed directly on the floor of both houses, providing in-depth policy analyses, special reports, and parliamentary commentary to lawmakers and citizens alike.
          </p>

          <div className="pt-4">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-black text-navy dark:text-white text-lg">The Eagle's Eye Awards 2025</h3>
                <p className="text-slate-500 text-xs mt-1">Discover outstanding parliamentary networks, legislative committees, and leaders of the year.</p>
              </div>
              <RouterLink
                to="/awards"
                className="inline-flex items-center gap-2 bg-navy hover:bg-gold text-white hover:text-navy px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm shrink-0"
              >
                View Laureates
              </RouterLink>
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="bg-navy text-white rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="font-serif font-bold text-lg border-b border-white/10 pb-3">Quick Facts</h3>
          <ul className="space-y-4 text-xs text-slate-200">
            <li className="flex items-start gap-3">
              <Landmark className="size-4.5 text-gold shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider text-[10px]">Registry</div>
                <div className="mt-0.5">Official Parliamentary News Outlet & Press Agency</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BookOpen className="size-4.5 text-gold shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider text-[10px]">Frequency</div>
                <div className="mt-0.5">Digital News published Daily. Print Journal published Triweekly.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="size-4.5 text-gold shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider text-[10px]">Headquarters</div>
                <div className="mt-0.5">Obobogo, Yaoundé, Center Region, Cameroon</div>
              </div>
            </li>
          </ul>
          <div className="pt-2">
            <RouterLink to="/contact">
              <Button className="w-full bg-gold hover:bg-white text-navy font-bold uppercase text-xs tracking-wider py-2.5 rounded-lg transition-colors">
                Contact Newsroom
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* Code of Ethics / Values */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-serif font-black text-3xl text-navy dark:text-white">Our Editorial Values</h2>
          <p className="text-sm text-slate-500">How we maintain credibility, neutral reporting, and parliamentary trust.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-xl space-y-3">
            <div className="size-10 rounded-full bg-navy/10 dark:bg-slate-800 flex items-center justify-center text-gold">
              <ShieldCheck className="size-5" />
            </div>
            <h4 className="font-bold text-navy dark:text-white text-base">Uncompromising Integrity</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We operate independent of lobby groups, parties, and corporate pressure. Our stories are factual, research-backed, and direct from source.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-xl space-y-3">
            <div className="size-10 rounded-full bg-navy/10 dark:bg-slate-800 flex items-center justify-center text-gold">
              <Landmark className="size-5" />
            </div>
            <h4 className="font-bold text-navy dark:text-white text-base">Balanced Representation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cameroon's parliament houses a diverse range of voices. We provide clean coverage of both majority debates and opposition proposals without bias.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-xl space-y-3">
            <div className="size-10 rounded-full bg-navy/10 dark:bg-slate-800 flex items-center justify-center text-gold">
              <BookOpen className="size-5" />
            </div>
            <h4 className="font-bold text-navy dark:text-white text-base">Clear Legislative Context</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We translate dense bill language, constitutional codes, and budget summaries into clear analyses, explaining exactly how decisions impact citizens.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Contact Info */}
      <section className="grid sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-16">
        <RouterLink to="/contact" className="bg-card border border-border p-5 rounded-xl hover:border-gold transition">
          <Mail className="size-6 text-gold mb-2" />
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Email Desk</div>
          <div className="font-semibold text-sm mt-1 text-navy dark:text-white break-all">contact@theeagleseyemedia.com</div>
        </RouterLink>
        <a href="tel:+237679112602" className="bg-card border border-border p-5 rounded-xl hover:border-gold transition">
          <Phone className="size-6 text-gold mb-2" />
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Hotlines</div>
          <div className="font-semibold text-sm mt-1 text-navy dark:text-white leading-tight">
            +237 679 112 602<br/>+237 682 336 736
          </div>
        </a>
        <div className="bg-card border border-border p-5 rounded-xl">
          <MapPin className="size-6 text-gold mb-2" />
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Yaoundé HQ</div>
          <div className="font-semibold text-sm mt-1 text-navy dark:text-white">
            Obobogo, Yaoundé,<br/>Center Region, Cameroon
          </div>
        </div>
      </section>

      {/* Interactive News tips Section */}
      <section className="bg-navy text-white rounded-2xl p-8 sm:p-10 relative overflow-hidden shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
          <Landmark className="size-96" />
        </div>

        <div className="max-w-xl space-y-4">
          <h2 className="font-serif font-black text-2xl sm:text-3xl">Send us a news tip</h2>
          <p className="text-slate-200 text-sm leading-relaxed">
            Do you have insights from a committee meeting, a leaked draft, or an invitation for our reporters to cover legislative actions? Send it directly to our secure editorial desk.
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex items-center gap-3 text-emerald-400 max-w-xl">
            <CheckCircle2 className="size-6 shrink-0" />
            <div>
              <div className="font-bold text-sm">Message Sent Successfully!</div>
              <div className="text-xs text-slate-300 mt-0.5">Our editorial desk will review the info. Thank you.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleTipSubmit} className="grid gap-3.5 max-w-xl mt-8 text-left">
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name" 
                className="bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 placeholder:text-white/40 text-sm outline-none focus:border-gold focus:bg-white/15 transition-all text-white" 
              />
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" 
                className="bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 placeholder:text-white/40 text-sm outline-none focus:border-gold focus:bg-white/15 transition-all text-white" 
              />
            </div>
            <textarea 
              required
              rows={4} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide details of your tip, document leaks, or comments..." 
              className="bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 placeholder:text-white/40 text-sm outline-none focus:border-gold focus:bg-white/15 transition-all text-white resize-none" 
            />
            <button 
              type="submit"
              disabled={submitMsg.isPending}
              className="bg-gold hover:bg-white text-navy font-bold uppercase tracking-wider text-xs py-3 px-6 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 self-start cursor-pointer disabled:opacity-50"
            >
              {submitMsg.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Sending Tip…
                </>
              ) : (
                <>
                  <Send className="size-3.5" /> Submit Tip
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-300">
          <span>Yaoundé, Cameroon</span>
          <a href="https://www.facebook.com/p/The-Eagles-Eye-MEDIA-100063910274137/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gold hover:underline">
            <Facebook className="size-4" /> Follow our Facebook page
          </a>
        </div>
      </section>
    </div>
  );
}
