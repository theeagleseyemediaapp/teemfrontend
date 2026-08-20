import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/national-assembly")({
  head: () => ({
    meta: [
      { title: "National Assembly of Cameroon — Plenary Debates, Bills & Lawmakers" },
      { name: "description", content: "Comprehensive reporting from the National Assembly of Cameroon (Assemblée Nationale). Plenary debates, committee hearings, roll call votes, legislative bills, and constituency initiatives from Yaoundé." },
      { name: "keywords", content: "National Assembly Cameroon, Assemblée Nationale Cameroun, Cavaye Yeguie Djibril, Cameroon deputies, plenary sessions Yaoundé, legislative votes Cameroon" },
      { property: "og:title", content: "National Assembly of Cameroon — The Eagle's Eye Media" },
      { property: "og:description", content: "Plenary debates, committee hearings, roll call votes, and legislative action from Cameroon's lower house." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/national-assembly" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "National Assembly of Cameroon" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "National Assembly of Cameroon — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Lower house coverage, floor debates, and parliamentary votes from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/national-assembly" }],
  }),
  component: () => (
    <CategoryArticlesPage title="National Assembly" intro="Lower house coverage, votes, and debates." categorySlug="national-assembly" />
  ),
});
