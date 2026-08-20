import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/government")({
  head: () => ({
    meta: [
      { title: "Government of Cameroon — Cabinet Decrees, Executive Policy & Ministries" },
      { name: "description", content: "Coverage of Cameroon's executive government, Prime Minister cabinet councils, presidential decrees, ministerial policy directives, and public sector reforms." },
      { name: "keywords", content: "Cameroon government news, Prime Minister Cameroon, presidential decrees Yaoundé, cabinet meetings Cameroon, ministerial policy Cameroon" },
      { property: "og:title", content: "Government & Executive Action — Cameroon" },
      { property: "og:description", content: "Executive decisions, presidential decrees, and policy announcements from Yaoundé, Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/government" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Government & Executive Policy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Government — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Executive decisions and policy announcements from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/government" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Government" intro="Executive decisions and policy announcements." categorySlug="government" />
  ),
});
