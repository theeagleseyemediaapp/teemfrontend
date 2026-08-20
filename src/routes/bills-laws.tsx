import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";
import { BillTrackingPipeline } from "@/components/home/BillTrackingPipeline";

export const Route = createFileRoute("/bills-laws")({
  head: () => ({
    meta: [
      { title: "Cameroon Bills & Laws Tracker — Legislation from Draft to Promulgation" },
      { name: "description", content: "Track legislative bills and promulgated laws in Cameroon's Parliament. Real-time updates on executive draft deposits, committee amendments, plenary debates, and presidential enactments in the 10th Legislature." },
      { name: "keywords", content: "Cameroon bills and laws, legislative tracker Cameroon, lois du Cameroun, projet de loi Cameroun, promulgation laws Cameroon, finance bill Yaoundé" },
      { property: "og:title", content: "Bills & Laws Tracker — Cameroon Parliament" },
      { property: "og:description", content: "Real-time step-by-step progress tracking for government and private member bills in Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/bills-laws" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Legislative Bills & Laws Tracker" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Bills & Laws Tracker — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Legislation tracking from draft deposit to presidential promulgation." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/bills-laws" }],
  }),
  component: () => (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-4">
        <BillTrackingPipeline />
      </div>
      <CategoryArticlesPage title="Bills & Laws News & Reports" intro="Published reporting, floor debate coverage, and promulgation notices." categorySlug="bills-laws" />
    </main>
  ),
});
