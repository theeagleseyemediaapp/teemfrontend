import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Parliamentary & Policy Analysis — Cameroon In-Depth Insights" },
      { name: "description", content: "Expert analytical deep-dives, legislative impact assessments, policy evaluations, and geopolitical breakdowns from seasoned Cameroonian political analysts and legal scholars." },
      { name: "keywords", content: "Cameroon political analysis, parliamentary policy analysis Yaoundé, legal analysis Cameroon, legislative impact Cameroon, economic policy insights Cameroon" },
      { property: "og:title", content: "Parliamentary & Policy Analysis — The Eagle's Eye Media" },
      { property: "og:description", content: "Expert analytical deep-dives and legislative impact assessments from Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/analysis" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Policy Analysis" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Policy Analysis — The Eagle's Eye Media" },
      { name: "twitter:description", content: "In-depth legislative and political analysis from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/analysis" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Analysis" intro="In-depth analysis and reports." categorySlug="analysis" />
  ),
});
