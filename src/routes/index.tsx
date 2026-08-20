import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useArticles, useNewsletterSubscribe } from "@/lib/api";
import { toast } from "sonner";
import { StoryCard } from "@/components/site/StoryCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { LoadMoreButton } from "@/components/site/LoadMoreButton";
import { Mail, Send, Check } from "lucide-react";

// Modular Route-Scoped Home Components
import { TrendingMarquee } from "@/components/home/TrendingMarquee";
import { HeroSlider } from "@/components/home/HeroSlider";
import { LiveTvWidget } from "@/components/home/LiveTvWidget";
import { LeftRailRubrics } from "@/components/home/LeftRailRubrics";
import { ParliamentDiplomacyCard } from "@/components/home/ParliamentDiplomacyCard";
import { BillsLegislationCard } from "@/components/home/BillsLegislationCard";
import { VideoReports } from "@/components/home/VideoReports";
import { ExclusiveInterviews } from "@/components/home/ExclusiveInterviews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Eagle's Eye Media — Cameroon Parliamentary Press & Analysis" },
      { name: "description", content: "The Eagle's Eye Media is an independent, non-partisan news organization delivering comprehensive parliamentary updates, live plenary coverage, bill trackings, committee highlights, and political analysis from Cameroon's National Assembly and Senate." },
      { property: "og:title", content: "The Eagle's Eye Media — Parliamentary News & Live Broadcasts" },
      { property: "og:description", content: "Comprehensive independent reporting and live coverage from Cameroon's National Assembly, Senate, and committees." },
      { property: "og:url", content: "/" },
      { name: "keywords", content: "Cameroon Parliament, National Assembly Cameroon, Senate Cameroon, legislative news, Cameroonian bills, plenary sessions Yaoundé, political media Cameroon" }
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: rawArticles = [], isLoading } = useArticles();

  const allPublished = rawArticles
    .filter((a: any) => a.status === "published" || !a.status)
    .sort((a: any, b: any) => {
      const aTime = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  const getArticles = (predicate: (a: any) => boolean, count: number) => {
    return allPublished.filter(predicate).slice(0, count);
  };

  const isGeneralNews = (a: any) => !["opinion", "video", "interviews", "interview"].some(s => a.categorySlug?.includes(s));

  const featuredSlides = allPublished.filter((a: any) => a.featured && isGeneralNews(a));
  const nonFeaturedNews = allPublished.filter((a: any) => !a.featured && isGeneralNews(a));
  const heroSlides = [
    ...featuredSlides,
    ...nonFeaturedNews.filter((a: any) => !featuredSlides.find((f: any) => f.id === a.id)),
  ].slice(0, 5);

  const interviews = getArticles((a) => ["interviews", "interview"].some(s => a.categorySlug?.includes(s)), 3);
  const bills = getArticles((a) => a.categorySlug?.includes("bills-laws"), 4);
  const assembly = getArticles((a) => ["national-assembly", "parliament"].some(s => a.categorySlug?.includes(s)), 5);
  const matchedParliamentToday = getArticles((a) => {
    const slug = (a.categorySlug || "").toLowerCase();
    const cat = (a.category || "").toLowerCase();
    const title = (a.title || "").toLowerCase();
    return (
      ["plenaries", "committee-echoes", "parliament", "national-assembly", "senate", "parliamentary-diplomacy"].some((s) => slug.includes(s)) ||
      cat.includes("parliament") ||
      title.includes("parliament")
    );
  }, 8);
  const parliamentToday = matchedParliamentToday.length > 0 ? matchedParliamentToday : allPublished.slice(0, 8);
  const constituencyActions = getArticles((a) => ["constituency", "constituency-actions"].some(s => a.categorySlug?.includes(s)), 3);
  const diplomacy = getArticles((a) => ["diplomacy", "parliamentary-diplomacy"].some(s => a.categorySlug?.includes(s)), 3);
  const opinions = getArticles((a) => a.categorySlug?.includes("opinion"), 3);
  const videoStrip = getArticles((a) => a.videoUrl || a.categorySlug?.includes("video") || a.live, 5);

  const usedIds = new Set(heroSlides.map((h: any) => h.id));
  const latest = allPublished.filter((a: { id: any; }) => isGeneralNews(a) && !usedIds.has(a.id)).slice(0, 10);

  const [heroIndex, setHeroIndex] = useState(0);
  const [parliamentVisible, setParliamentVisible] = useState(4);
  const [assemblyVisible, setAssemblyVisible] = useState(4);
  const [homeNewsletterEmail, setHomeNewsletterEmail] = useState("");
  const [homeNewsletterDone, setHomeNewsletterDone] = useState(false);
  const homeSubscribe = useNewsletterSubscribe();

  const handleHomeNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeNewsletterEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    homeSubscribe.mutate(
      { email: homeNewsletterEmail, name: homeNewsletterEmail.split("@")[0] },
      {
        onSuccess: () => {
          setHomeNewsletterDone(true);
          toast.success("Subscribed to Executive Dispatch! Welcome aboard.");
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Subscription failed.");
        },
      }
    );
  };

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  if (isLoading) {
    return <div className="p-16 text-center text-navy font-bold">Loading news...</div>;
  }

  if (!allPublished.length) {
    return <div className="p-16 text-center text-navy font-bold">No articles found. Check your internet connection</div>;
  }

  return (
    <div>
      {/* 1. TRENDING MARQUEE */}
      <TrendingMarquee />

      {/* 2. THREE-COLUMN HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Column Rubrics */}
          <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">
            <LeftRailRubrics
              parliamentToday={parliamentToday}
              constituencyActions={constituencyActions}
              diplomacy={diplomacy}
              fallbackArticles={latest}
            />
          </div>

          {/* Center + Right Column Wrapper */}
          <div className="order-1 lg:order-2 lg:col-span-9 space-y-6">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
              {/* Hero Slider & Diplomacy */}
              <div className="lg:col-span-7 space-y-6">
                <HeroSlider
                  slides={heroSlides}
                  activeIndex={heroIndex}
                  onChangeIndex={setHeroIndex}
                />
                <ParliamentDiplomacyCard diplomacy={diplomacy} fallbackArticles={latest} />
              </div>

              {/* Live Broadcast Widget & Bills */}
              <div className="lg:col-span-5 space-y-6">
                <LiveTvWidget fallbackArticle={videoStrip[0] || parliamentToday[0] || latest[0]} />
                <BillsLegislationCard bills={bills} />
              </div>
            </div>

            {/* Multimedia Video Broadcast & Interviews */}
            <div className="rounded-xl bg-card p-5 border-0 shadow-md space-y-4 relative overflow-hidden">
              <div className="h-1 w-full flex absolute top-0 left-0">
                <div className="h-full flex-1 bg-[#007A5E]" />
                <div className="h-full flex-1 bg-[#CE1126]" />
                <div className="h-full flex-1 bg-[#FCD116]" />
              </div>

              <div className="flex items-center justify-between pt-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                  <h3 className="font-serif text-base font-black text-navy dark:text-white uppercase tracking-wider">
                    Parliament Video Reports &amp; Lawmaker Interviews
                  </h3>
                </div>
                <Link to="/video" className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider">
                  Watch All Videos →
                </Link>
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  {videoStrip.length > 0 ? (
                    <VideoReports videoStrip={videoStrip} />
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-6 text-center text-xs text-muted-foreground">
                      Parliamentary video broadcasts updating.
                    </div>
                  )}
                </div>
                <div className="lg:col-span-5">
                  {interviews.length > 0 ? (
                    <ExclusiveInterviews interviews={interviews} layout="vertical" />
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-6 text-center text-xs text-muted-foreground">
                      Exclusive Lawmaker Interviews updating.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PARLIAMENT TODAY SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionHeading title="Parliament Today" href="/parliament" label="View All Parliament Today →" />
        {parliamentToday.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {parliamentToday.slice(0, parliamentVisible).map((a: any) => <StoryCard key={a.slug} a={a} size="sm" />)}
            </div>
            <LoadMoreButton
              onClick={() => setParliamentVisible((v) => v + 4)}
              hasMore={parliamentVisible < parliamentToday.length}
              label="Load More Parliament Today"
            />
          </>
        ) : (
          <div className="rounded-lg bg-card p-6 text-center border-none shadow-sm text-xs text-muted-foreground">
            Parliamentary news updating.
          </div>
        )}
      </section>

      {/* 4. NATIONAL ASSEMBLY SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionHeading title="National Assembly" href="/national-assembly" label="View All National Assembly →" />
        {assembly.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {assembly.slice(0, assemblyVisible).map((a: any) => <StoryCard key={a.slug} a={a} size="sm" />)}
            </div>
            <LoadMoreButton
              onClick={() => setAssemblyVisible((v) => v + 4)}
              hasMore={assemblyVisible < assembly.length}
              label="Load More National Assembly"
            />
          </>
        ) : (
          <div className="rounded-lg bg-card p-6 text-center border-none shadow-sm text-xs text-muted-foreground">
            National Assembly updates updating.
          </div>
        )}
      </section>

      {/* 5. OPINION SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionHeading title="Opinion" href="/opinion" label="View All Opinion →" />
        {opinions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opinions.map((a: any) => <StoryCard key={a.slug} a={a} size="sm" />)}
          </div>
        ) : (
          <div className="rounded-lg bg-card p-6 text-center border-none shadow-sm text-xs text-muted-foreground">
            Opinion pieces updating.
          </div>
        )}
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 sm:p-10 shadow-md border-0 relative overflow-hidden text-navy dark:text-white text-center space-y-4">
          {/* Solid Cameroon Flag Accent Top Stripe */}
          <div className="h-1 w-full flex absolute top-0 left-0">
            <div className="h-full flex-1 bg-[#007A5E]" />
            <div className="h-full flex-1 bg-[#CE1126]" />
            <div className="h-full flex-1 bg-[#FCD116]" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-black text-navy dark:text-white pt-2">
            Subscribe to Parliamentary Updates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get daily verified news, plenary summaries, and bill tracking reports delivered directly to your inbox from Cameroon's National Assembly &amp; Senate.
          </p>

          <div className="pt-2 max-w-md mx-auto">
            {homeNewsletterDone ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl shadow-sm">
                <Check className="size-5" />
                <span>Subscribed! Check your inbox for confirmation.</span>
              </div>
            ) : (
              <form onSubmit={handleHomeNewsletterSubmit} className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-inner">
                <div className="relative flex-1">
                  <Mail className="size-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={homeNewsletterEmail}
                    onChange={(e) => setHomeNewsletterEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-transparent text-navy dark:text-white placeholder-slate-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={homeSubscribe.isPending}
                  className="bg-navy hover:bg-navy/90 text-white font-black text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{homeSubscribe.isPending ? "Joining..." : "Subscribe"}</span>
                  <Send className="size-3.5 text-amber-400" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
