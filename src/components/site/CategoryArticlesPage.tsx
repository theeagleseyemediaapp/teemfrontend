import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useArticlesByCategory } from "@/lib/api";
import { CategoryPage } from "./CategoryPage";

export function CategoryArticlesPage({
  title,
  intro,
  categorySlug,
}: {
  title: string;
  intro: string;
  categorySlug: string;
}) {
  const { data, isLoading } = useArticlesByCategory(categorySlug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Loading stories…
      </div>
    );
  }

  return <CategoryPage title={title} intro={intro} items={data ?? []} />;
}
