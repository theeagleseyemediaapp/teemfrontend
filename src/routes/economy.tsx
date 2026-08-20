import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/economy")({
  head: () => ({
    meta: [
      { title: "Economy — The Eagle's Eye Media" },
      { name: "description", content: "Budget, finance, and economic policy coverage from Cameroon." },
      { property: "og:title", content: "Economy — The Eagle's Eye Media" },
      { property: "og:description", content: "Budget, finance, and economic policy coverage from Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/economy" },
      { property: "og:image", content: "/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Media logo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Economy — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Budget, finance, and economic policy coverage from Cameroon." },
      { name: "twitter:image", content: "/logo.png" },
      { name: "twitter:image:alt", content: "The Eagle's Eye Media logo" },
    ],
    links: [{ rel: "canonical", href: "/economy" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Economy" intro="Budget, finance, and economic policy coverage." categorySlug="economy" />
  ),
});
