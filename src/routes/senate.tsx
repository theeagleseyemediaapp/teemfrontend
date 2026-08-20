import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";

export const Route = createFileRoute("/senate")({
  head: () => ({
    meta: [
      { title: "Senate of Cameroon — Floor Debates, Reviews & Senatorial Action" },
      { name: "description", content: "Dedicated coverage of Cameroon's Senate. Follow senatorial reviews of legislation, constitutional debates, committee scrutinies, and regional representative activities in the upper chamber." },
      { name: "keywords", content: "Cameroon Senate, Sénat du Cameroun, Cameroonian Senators, upper house Cameroon, senatorial debates Yaoundé, Senate president Cameroon" },
      { property: "og:title", content: "Senate of Cameroon — The Eagle's Eye Media" },
      { property: "og:description", content: "Confirmations, reviews, and floor debates from the Senate of Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/senate" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Senate Floor Debates" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Senate of Cameroon — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Confirmations, legislative reviews, and floor debates from Cameroon's upper chamber." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/senate" }],
  }),
  component: () => (
    <CategoryArticlesPage title="Senate" intro="Confirmations, reviews and floor debates from the Senate." categorySlug="senate" />
  ),
});
