import { useState } from "react";
import { StoryCard } from "./StoryCard";
import { Sidebar } from "./Sidebar";
import { SectionHeading } from "./SectionHeading";
import { LoadMoreButton } from "./LoadMoreButton";

const INITIAL_BATCH = 5;
const LOAD_MORE_BATCH = 5;

export function CategoryPage({
  title,
  intro,
  items,
  initialBatch = INITIAL_BATCH,
  loadMoreBatch = LOAD_MORE_BATCH,
}: {
  title: string;
  intro: string;
  items: Array<{ slug: string; title: string; summary: string; coverImage?: string; categorySlug?: string; publishedAt?: string; likeCount?: number }>;
  initialBatch?: number;
  loadMoreBatch?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const [loading, setLoading] = useState(false);
  const [lead, ...rest] = items.length ? items : [];
  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + loadMoreBatch);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="border-b border-border pb-4 mb-8">
        <h1 className="section-rule text-3xl sm:text-4xl">{title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{intro}</p>
      </div>
      {!lead ? (
        <p className="text-muted-foreground">No stories yet.</p>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <StoryCard a={lead} size="lg" />
            <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {visible.slice(0, 4).map((a) => <StoryCard key={a.slug} a={a} />)}
            </div>
            {visible.length > 4 && (
              <>
                <SectionHeading title="More stories" />
                <div className="divide-y divide-border">
                  {visible.slice(4).map((a) => <StoryCard key={a.slug} a={a} size="row" />)}
                </div>
                <LoadMoreButton
                  onClick={handleLoadMore}
                  loading={loading}
                  hasMore={hasMore}
                  label="Load More Stories"
                />
              </>
            )}
            {visible.length <= 4 && hasMore && (
              <LoadMoreButton
                onClick={handleLoadMore}
                loading={loading}
                hasMore={hasMore}
                label="Load More Stories"
              />
            )}
          </div>
          <Sidebar />
        </div>
      )}
    </div>
  );
}
