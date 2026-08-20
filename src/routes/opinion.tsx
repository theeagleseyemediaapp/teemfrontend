import { createFileRoute } from "@tanstack/react-router";
import { CategoryArticlesPage } from "@/components/site/CategoryArticlesPage";
import { OpinionAnalysisShowcase } from "@/components/home/OpinionAnalysisShowcase";
import { useArticles } from "@/lib/api";

export const Route = createFileRoute("/opinion")({
  head: () => ({
    meta: [
      { title: "Op-Eds, Editorials & Thought Leadership — Cameroon Politics" },
      { name: "description", content: "Thought-provoking opinion columns, guest essays, and editorial perspectives on legislative reform, governance, and democratic accountability in Cameroon." },
      { name: "keywords", content: "Cameroon op-eds, political opinion Cameroon, editorial columns Yaoundé, democratic governance commentary, legal opinions Cameroon" },
      { property: "og:title", content: "Op-Eds & Thought Leadership — The Eagle's Eye Media" },
      { property: "og:description", content: "Thought-provoking commentary and editorial viewpoints on Cameroon's political and parliamentary landscape." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/opinion" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Opinion & Editorials" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Opinion & Editorials — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Analysis, op-eds, and commentary on parliamentary affairs from Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/opinion" }],
  }),
  component: () => {
    const { data: rawArticles = [] } = useArticles();
    const published = rawArticles.filter((a: any) => a.status === "published" || !a.status);

    const opinions = published.filter((a: any) =>
      a.categorySlug?.includes("opinion") || a.category?.toLowerCase().includes("opinion")
    );
    const analysis = published.filter((a: any) =>
      a.categorySlug?.includes("analysis") || a.category?.toLowerCase().includes("analysis")
    );

    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-4">
          <OpinionAnalysisShowcase
            opinions={opinions}
            analysis={analysis}
            fallbackArticles={published}
          />
        </div>
        <CategoryArticlesPage
          title="All Op-Eds & Editorial Perspectives"
          intro="Analysis, guest columns, and expert commentary on parliamentary affairs and legal reform."
          categorySlug="opinion"
        />
      </main>
    );
  },
});
