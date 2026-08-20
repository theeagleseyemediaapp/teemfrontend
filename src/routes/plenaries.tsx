import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";
import { ParliamentaryCalendar } from "@/components/home/ParliamentaryCalendar";
import { RollCallVoteCard } from "@/components/home/RollCallVoteCard";

export const Route = createFileRoute("/plenaries")({
  head: () => ({
    meta: [
      { title: "Parliamentary Plenaries & Floor Debates — Cameroon" },
      { name: "description", content: "Complete coverage of live and recorded plenary sessions in Cameroon's Parliament. Watch and read floor arguments, ministerial question-and-answer sessions, and legislative votes from the National Assembly and Senate." },
      { name: "keywords", content: "Cameroon plenaries, séances plénières Cameroun, parliamentary floor debates Yaoundé, ministerial question time Cameroon, plenary votes National Assembly" },
      { property: "og:title", content: "Parliamentary Plenaries & Floor Debates — The Eagle's Eye Media" },
      { property: "og:description", content: "Floor sessions, roll call votes, and plenary highlights from Cameroon's Parliament." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/plenaries" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Parliamentary Plenaries" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Plenaries — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Floor sessions, votes, and plenary highlights from Cameroon's Parliament." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/plenaries" }],
  }),
  component: () => (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 space-y-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ParliamentaryCalendar />
        </div>
        <div className="lg:col-span-5">
          <RollCallVoteCard />
        </div>
      </div>

      <CategoryArticlesPage title="Plenary Floor Reports & Ministerial Question Time" intro="Floor sessions, roll call votes, and plenary highlights from Cameroon's Parliament." categorySlug="plenaries" />
    </main>
  ),
});
