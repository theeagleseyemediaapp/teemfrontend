import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/parliamentary-missions")({
  head: () => ({
    meta: [
      { title: "Parliamentary Missions & Fact-Finding Delegations — Cameroon" },
      { name: "description", content: "Reports from official parliamentary investigative missions, fact-finding tours across Cameroon's 10 regions, and overseas legislative delegations." },
      { name: "keywords", content: "Cameroon parliamentary missions, legislative fact finding Yaoundé, MP field missions Cameroon, Senate oversight tours" },
      { property: "og:title", content: "Parliamentary Missions & Delegations — Cameroon" },
      { property: "og:description", content: "Official fact-finding delegations and regional oversight missions by Cameroon's lawmakers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/parliamentary-missions" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Parliamentary Missions" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Parliamentary Missions — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Official delegations and fact-finding missions from Cameroon's Parliament." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/parliamentary-missions" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Parliamentary Missions" intro="Field missions and oversight visits by MPs." categorySlug="parliamentary-missions" />
  ),
});
