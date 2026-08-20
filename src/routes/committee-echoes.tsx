import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";
import { StandingCommitteesHub } from "@/components/home/StandingCommitteesHub";

export const Route = createFileRoute("/committee-echoes")({
  head: () => ({
    meta: [
      { title: "Parliamentary Committee Hearings & Scrutinies — Cameroon" },
      { name: "description", content: "Inside reporting from standing and special committees of Cameroon's Parliament. Constitutional laws, finance, foreign affairs, production, and cultural committee inquiries." },
      { name: "keywords", content: "Cameroon committee echoes, commissions parlementaires Cameroun, finance committee Yaoundé, constitutional laws committee Cameroon" },
      { property: "og:title", content: "Committee Echoes & Inquiries — Cameroon Parliament" },
      { property: "og:description", content: "Committee hearings, legislative scrutinies, and closed-door deliberations from Cameroon's Parliament." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/committee-echoes" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Parliamentary Committee Echoes" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Committee Echoes — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Committee hearings and legislative scrutinies from Cameroon's Parliament." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/committee-echoes" }],
  }),
  component: () => (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-4">
        <StandingCommitteesHub />
      </div>
      <CategoryArticlesPage title="Committee Press & Inquiries" intro="Committee reports, closed-door scrutiny highlights, and parliamentary inquiries." categorySlug="committee-echoes" />
    </main>
  ),
});
