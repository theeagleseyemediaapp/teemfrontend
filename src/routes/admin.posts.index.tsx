import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminArticles, useAdminArticleMetrics, useDeleteArticle, useUpdateArticleStatus } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/posts/")({
  validateSearch: (s: Record<string, unknown>): { status?: string } => ({
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: PostsList,
});

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "draft" | "published" | "scheduled" | "archived";
  categorySlug: string;
  featured: boolean;
  alert: boolean;
  publishedAt?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

function PostsList() {
  const articles = useAdminArticles();
  const metrics = useAdminArticleMetrics();
  const user = getStoredUser();
  const deleteArticle = useDeleteArticle();
  const updateStatus = useUpdateArticleStatus();
  const routeSearch = Route.useSearch();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(routeSearch.status ?? "all");

  useEffect(() => {
    setStatusFilter(routeSearch.status ?? "all");
  }, [routeSearch.status]);

  const rows: ArticleRow[] = (articles.data ?? []).filter((a: ArticleRow) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (!user?.id) return;
    if (!confirm("Delete this article? This cannot be undone.")) return;
    deleteArticle.mutate({ id, userId: user.id });
  };

  const handleStatusChange = (id: string, status: "draft" | "published" | "archived") => {
    if (!user?.id) return;
    updateStatus.mutate({ id, status, userId: user.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-serif font-black text-3xl text-navy">Posts</h1>
        <Link to="/admin/posts/create" className="inline-flex items-center gap-2 bg-gold text-navy text-sm font-bold uppercase tracking-wider px-4 py-2 rounded hover:bg-gold-dark transition-colors">
          + New Post
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {articles.isLoading && <p className="text-sm text-muted-foreground">Loading articles...</p>}

          {!articles.isLoading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No articles found.</p>
          )}

          <div className="divide-y divide-border">
            {rows.map((a) => (
              <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                  <a href={`/article/${a.slug}`} className="font-serif font-bold text-navy hover:text-gold transition-colors">
                    {a.title}
                  </a>
                    {a.featured && <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-gold/20 text-navy px-2 py-0.5 rounded">Featured</span>}
                    {a.alert && <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">Alert</span>}
                    <span className="text-xs text-muted-foreground">{a.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {a.categorySlug} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "Unpublished"} · {a.likeCount} likes · {a.commentCount} comments
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value as "draft" | "published" | "archived")}
                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <a href={`/article/${a.slug}`} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-navy" title="View">
                    <Eye className="size-4" />
                  </a>
                  <a href={`/admin/posts/${a.slug}/edit`} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-navy" title="Edit">
                    <Pencil className="size-4" />
                  </a>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600" title="Delete">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
