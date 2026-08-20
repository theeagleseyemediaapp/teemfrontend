import { createFileRoute } from "@tanstack/react-router";
import { useArticles } from "@/lib/api";
import { CategoryPage } from "@/components/site/CategoryPage";

export const Route = createFileRoute("/parliament")({
  head: () => ({
    meta: [
      { title: "Cameroon Parliament Hub — National Assembly & Senate Coverage" },
      { name: "description", content: "Rolling coverage, legislative votes, and committee work in both chambers of Cameroon's Parliament. Follow parliamentary plenaries, executive bills, and senatorial reviews from Yaoundé." },
      { name: "keywords", content: "Cameroon Parliament, Parlement du Cameroun, National Assembly Yaoundé, Senate Yaoundé, Cameroon lawmakers, legislative sessions Cameroon" },
      { property: "og:title", content: "Cameroon Parliament Hub — The Eagle's Eye Media" },
      { property: "og:description", content: "Rolling coverage of debates, votes, and committee work in Cameroon's National Assembly and Senate." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/parliament" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Parliament Hub" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cameroon Parliament Hub — The Eagle's Eye Media" },
      { name: "twitter:description", content: "All parliamentary coverage from Cameroon's National Assembly and Senate." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/parliament" }],
  }),
  component: () => {
    const { data: articles = [] } = useArticles();
    const published = articles.filter((a: any) => a.status === "published" || !a.status);
    const parliamentItems = published.filter((a: any) => {
      const slug = (a.categorySlug || "").toLowerCase();
      const cat = (a.category || "").toLowerCase();
      const title = (a.title || "").toLowerCase();
      return (
        ["parliament", "national-assembly", "senate", "plenaries", "committee-echoes", "parliamentary-diplomacy", "parliamentary-missions", "bills-laws", "constituency-actions"].includes(slug) ||
        slug.includes("parliament") ||
        slug.includes("assembly") ||
        slug.includes("senate") ||
        slug.includes("plenary") ||
        slug.includes("committee") ||
        cat.includes("parliament") ||
        cat.includes("assembly") ||
        cat.includes("senate") ||
        cat.includes("plenary") ||
        cat.includes("committee") ||
        title.includes("parliament") ||
        title.includes("assembly") ||
        title.includes("senate")
      );
    });

    const displayItems = parliamentItems.length > 0 ? parliamentItems : published;

    return (
      <CategoryPage
        title="Parliament"
        intro="Rolling coverage of debates, votes and committee work in both chambers of Cameroon's Parliament."
        items={displayItems}
      />
    );
  },
});
