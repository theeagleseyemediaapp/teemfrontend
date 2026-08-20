import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/interviews")({
  head: () => ({
    meta: [
      { title: "Exclusive Lawmaker & Minister Interviews — Cameroon Parliament" },
      { name: "description", content: "In-depth one-on-one interviews with Members of Parliament, senators, cabinet ministers, party leaders, and constitutional experts shaping Cameroon's legislative agenda." },
      { name: "keywords", content: "Cameroon lawmaker interviews, MP interviews Yaoundé, minister interview Cameroon, parliamentary conversations, political leadership Cameroon" },
      { property: "og:title", content: "Exclusive Lawmaker & Policy Interviews — Cameroon" },
      { property: "og:description", content: "Exclusive one-on-one interviews with lawmakers and key policy makers across Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/interviews" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Lawmaker Interviews" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lawmaker Interviews — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Exclusive interviews with lawmakers and policy makers in Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/interviews" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Interviews" intro="Exclusive interviews with lawmakers and policy makers." categorySlug="interviews" />
  ),
});
