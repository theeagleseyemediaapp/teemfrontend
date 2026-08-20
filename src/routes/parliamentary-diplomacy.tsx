import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/parliamentary-diplomacy")({
  head: () => ({
    meta: [
      { title: "Parliamentary Diplomacy & International Relations — Cameroon" },
      { name: "description", content: "Cameroon's legislative foreign relations, bilateral parliamentary friendship groups, inter-parliamentary unions (IPU, PAP, APF), and international treaties." },
      { name: "keywords", content: "Cameroon parliamentary diplomacy, IPU Cameroon, Pan-African Parliament Cameroon, bilateral friendship groups Yaoundé, international relations Cameroon parliament" },
      { property: "og:title", content: "Parliamentary Diplomacy & Foreign Relations — Cameroon" },
      { property: "og:description", content: "International delegations, bilateral cooperation, and diplomatic engagements from Cameroon's Parliament." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/parliamentary-diplomacy" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Parliamentary Diplomacy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Parliamentary Diplomacy — The Eagle's Eye Media" },
      { name: "twitter:description", content: "International delegations and diplomatic engagements from Cameroon's Parliament." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/parliamentary-diplomacy" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Parliamentary Diplomacy" intro="International delegations and diplomatic engagements." categorySlug="parliamentary-diplomacy" />
  ),
});
