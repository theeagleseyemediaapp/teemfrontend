import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/constituency-actions")({
  head: () => ({
    meta: [
      { title: "Constituency Actions & Community Development — Cameroon Lawmakers" },
      { name: "description", content: "Grassroots reports on constituency initiatives, micro-development projects, constituency offices, and community outreach by Cameroon's MPs and Senators across all 10 regions." },
      { name: "keywords", content: "Cameroon constituency actions, MP micro projects Cameroon, lawmaker community outreach, constituency offices Cameroon" },
      { property: "og:title", content: "Constituency Actions & Community Initiatives — Cameroon" },
      { property: "og:description", content: "Grassroots development, community projects, and lawmaker outreach across Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/constituency-actions" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Constituency Actions" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Constituency Actions — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Grassroots projects and community outreach by Cameroon's lawmakers." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/constituency-actions" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Constituency Actions" intro="MP constituency work and grassroots engagement." categorySlug="constituency-actions" />
  ),
});
