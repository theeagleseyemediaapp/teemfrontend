import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/politics")({
  head: () => ({
    meta: [
      { title: "Politics & Governance in Cameroon — The Eagle's Eye Media" },
      { name: "description", content: "Authoritative political reporting, electoral updates, institutional governance, cabinet decisions, and power shifts across Cameroon." },
      { name: "keywords", content: "Cameroon politics, political news Cameroon, elections Cameroon, governance Yaoundé, political parties Cameroon, government policy Cameroon" },
      { property: "og:title", content: "Politics & Governance — The Eagle's Eye Media" },
      { property: "og:description", content: "Authoritative political reporting, election updates, and institutional governance across Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/politics" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Politics & Governance" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Politics & Governance — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Governance, elections, and power shifts across Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/politics" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Politics" intro="Governance, elections, and power shifts across Cameroon." categorySlug="politics" />
  ),
});
