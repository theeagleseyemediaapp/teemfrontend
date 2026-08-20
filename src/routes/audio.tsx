import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Headphones, Play, Podcast } from "lucide-react";
import { useArticles } from "@/lib/api";
import { LoadMoreButton } from "@/components/site/LoadMoreButton";

const AUDIO_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "news-politics", label: "News & Politics" },
  { id: "style-magazine", label: "Style & Magazine" },
  { id: "newspapers-editions", label: "Newspapers & Editions" },
  { id: "radio-news", label: "Radio News" },
];

export const Route = createFileRoute("/audio")({
  head: () => ({
    meta: [
      { title: "Parliamentary Podcasts, Radio Reports & Audio News — Cameroon" },
      { name: "description", content: "Listen to Cameroon's parliamentary news, radio bulletins, lawmaker interview recordings, and political analysis podcasts on the go." },
      { name: "keywords", content: "Cameroon audio news, parliamentary podcasts Yaoundé, Cameroon political radio, audio reports Cameroon, lawmaker voice interviews" },
      { property: "og:title", content: "Parliamentary Audio & Podcasts — The Eagle's Eye Media" },
      { property: "og:description", content: "Listen to parliamentary sessions, radio news broadcasts, and legislative podcasts from Yaoundé, Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/audio" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Audio & Podcasts Hub" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Audio & Podcasts — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Parliamentary sessions, radio news, and investigative podcasts from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/audio" }],
  }),
  component: AudioPage,
});

function AudioPage() {
  const { data: rawArticles = [] } = useArticles();
  const articles = rawArticles.filter((a: any) => a.status === "published" || !a.status);
  
  // Articles with audio/podcast indicators
  const allAudioArticles = articles.filter((a: any) => (a.categorySlug || "").includes("audio") || (a.categorySlug || "").includes("podcast"));

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const audioArticles = allAudioArticles.filter((a: any) => 
    activeCategory === "all" || (a.categorySlug || "").includes(activeCategory)
  );

  const visibleItems = audioArticles.slice(0, visibleCount);
  const hasMore = visibleCount < audioArticles.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 min-h-[60vh]">
      {/* Title */}
      <h1 className="section-rule text-3xl sm:text-4xl mb-6">Podcasts & Audios</h1>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {AUDIO_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setVisibleCount(6); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              activeCategory === cat.id
                ? "bg-navy text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Audio Section */}
      <div className="mb-12">
        {visibleItems.length === 0 ? (
          <p className="text-muted-foreground">No audio reports available yet.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((a: any, i: number) => {
                return (
                  <Link key={a.slug + i} to="/article/$slug" params={{ slug: a.slug }} className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted shadow-md flex items-center justify-center">
                      {a.coverImage && a.coverImage !== "/logo.png" ? (
                        <img src={a.coverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                          <Podcast className="size-16 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition"></div>
                      <div className="z-10 grid place-items-center size-14 rounded-full bg-gold text-navy shadow-lg group-hover:scale-110 transition">
                        <Headphones className="size-6" />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-lg mt-3 leading-snug group-hover:text-navy transition-colors">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}</p>
                  </Link>
                );
              })}
            </div>
            <LoadMoreButton
              onClick={() => setVisibleCount((c) => c + 6)}
              hasMore={hasMore}
            />
          </>
        )}
      </div>
    </div>
  );
}
