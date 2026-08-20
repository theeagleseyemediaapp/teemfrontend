import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/networking")({
  head: () => ({
    meta: [
      { title: "Networking — The Eagle's Eye Media" },
      { name: "description", content: "Parliamentary networking and stakeholder engagement in Cameroon." },
      { property: "og:title", content: "Networking — The Eagle's Eye Media" },
      { property: "og:description", content: "Parliamentary networking and stakeholder engagement in Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/networking" },
      { property: "og:image", content: "/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Media logo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Networking — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Parliamentary networking and stakeholder engagement in Cameroon." },
      { name: "twitter:image", content: "/logo.png" },
      { name: "twitter:image:alt", content: "The Eagle's Eye Media logo" },
    ],
    links: [{ rel: "canonical", href: "/networking" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Networking" intro="Parliamentary networking and stakeholder engagement." categorySlug="networking" />
  ),
});
