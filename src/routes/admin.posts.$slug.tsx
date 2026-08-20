import { createFileRoute, Link, redirect, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useArticle, useUpdateArticle, useAiRefine } from "@/lib/api";
import { Sparkles } from "lucide-react";
import { getStoredUser } from "@/lib/auth-session";

export const Route = createFileRoute("/admin/posts/$slug")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: EditPost,
});

function EditPost() {
  const params = Route.useParams();
  const slug = params.slug;
  const articleQuery = useArticle(slug);
  const updateArticle = useUpdateArticle();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refined, setRefined] = useState<any>(null);
  const aiRefine = useAiRefine();

  const handleRefine = async () => {
    setError(null);
    try {
      const res = await aiRefine.mutateAsync({
        text: body,
        field: "body"
      });
      if (res.text) setBody(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI refine failed.");
    }
  };

  useEffect(() => {
    if (articleQuery.data) {
      setTitle(articleQuery.data.title ?? "");
      setSummary(articleQuery.data.summary ?? "");
      setBody((articleQuery.data.body ?? []).join("\n"));
      setCategorySlug(articleQuery.data.categorySlug ?? "");
      setStatus(articleQuery.data.status ?? "draft");
    }
  }, [articleQuery.data]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const currentUser = getStoredUser();
    if (!currentUser?.id || !articleQuery.data?.id) {
      setError("You must be signed in to update an article.");
      return;
    }

    try {
      await updateArticle.mutateAsync({
        id: articleQuery.data.id,
        userId: currentUser.id,
        data: {
          title,
          summary,
          body: body.split("\n").filter((line) => line.trim()),
          categorySlug,
          status,
        },
      });
      setSuccess("Article updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", slug] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update article.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-3xl text-navy">Edit Post</h1>
          <p className="text-sm text-muted-foreground">Update the article content and publish settings.</p>
        </div>
        <Link
          to="/admin/posts"
          className="inline-flex items-center gap-2 bg-muted px-4 py-2 text-sm font-bold uppercase tracking-wider rounded hover:bg-border"
        >
          Back to posts
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Article</CardTitle>
        </CardHeader>
        <CardContent>
          {articleQuery.isLoading && <p className="text-sm text-muted-foreground">Loading article…</p>}
          {articleQuery.error && <p className="text-sm text-red-500">Failed to load article.</p>}
          {articleQuery.data && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} required />
              </div>
              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categorySlug">Category Slug</Label>
                <Input id="categorySlug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={updateArticle.isPending}>
                  {updateArticle.isPending ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleRefine} disabled={aiRefine.isPending || !title.trim()}>
                  <Sparkles className="size-4 mr-1.5" />
                  {aiRefine.isPending ? "Refining…" : "Refine with AI"}
                </Button>
              </div>

              {refined && (
                <div className="mt-4 rounded-md border border-gold/40 bg-gold/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-black text-navy text-sm uppercase tracking-wider">AI suggestions</h3>
                    <button type="button" className="text-xs text-muted-foreground hover:text-navy" onClick={() => setRefined(null)}>Dismiss</button>
                  </div>
                  {refined.refinedHeadline && (
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm"><strong>Headline:</strong> {refined.refinedHeadline}</div>
                      <button type="button" className="text-xs font-bold text-navy hover:text-gold shrink-0" onClick={() => setTitle(refined.refinedHeadline)}>Apply</button>
                    </div>
                  )}
                  {refined.summary && (
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm"><strong>Summary:</strong> {refined.summary}</div>
                      <button type="button" className="text-xs font-bold text-navy hover:text-gold shrink-0" onClick={() => setSummary(refined.summary)}>Apply</button>
                    </div>
                  )}
                  {refined.seoDescription && (
                    <div className="text-sm"><strong>SEO description:</strong> {refined.seoDescription}</div>
                  )}
                  {Array.isArray(refined.suggestedTags) && refined.suggestedTags.length > 0 && (
                    <div className="text-sm"><strong>Tags:</strong> {refined.suggestedTags.join(", ")}</div>
                  )}
                  {refined.explainer && (
                    <p className="text-xs text-muted-foreground italic">{refined.explainer}</p>
                  )}
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
      <Outlet />
    </div>
  );
}
