import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { playSound } from "@/hooks/use-click-sound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToggleLike, useComments, useArticle } from "@/lib/api";

interface Comment {
  id: string;
  author: string;
  body: string;
  at: string;
}

export function LikeBlock({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const articleQuery = useArticle(slug);
  const commentsQuery = useComments(slug);
  const toggleLike = useToggleLike();

  const article = articleQuery.data;
  const likes = article?.likeCount ?? 0;
  const liked = false; // Would need user auth to track per-user liked state

  function handleToggleLike() {
    if (!article?.id) return;
    toggleLike.mutate(
      { articleId: article.id, profileId: "guest" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["article", slug] });
          queryClient.invalidateQueries({ queryKey: ["articles"] });
          playSound("like");
        },
      },
    );
  }

  function postComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const next: Comment[] = [
      { id: crypto.randomUUID(), author: "Reader", body, at: "Just now" },
      ...(commentsQuery.data ?? []),
    ];
    queryClient.setQueryData(["comments", slug], next);
    setDraft("");
    playSound("post");
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleToggleLike}
          aria-pressed={liked}
          disabled={toggleLike.isPending}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
            liked
              ? "bg-destructive/10 border-destructive text-destructive"
              : "border-border hover:border-navy hover:text-navy"
          }`}
        >
          <Heart className={`size-4 ${liked ? "fill-current" : ""}`} /> {likes} {likes === 1 ? "Like" : "Likes"}
        </button>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
          <MessageCircle className="size-4" /> {commentsQuery.data?.length ?? 0} {(commentsQuery.data?.length ?? 0) === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      <form onSubmit={postComment} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add your comment…"
          className="flex-1 min-w-0 rounded border border-border bg-background px-4 py-3 text-sm outline-none focus:border-navy"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-navy text-white font-bold uppercase tracking-wider text-xs px-5 py-3 rounded hover:bg-navy/90"
        >
          <Send className="size-4" /> Post
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {(!commentsQuery.data || commentsQuery.data.length === 0) && (
          <li className="text-sm text-muted-foreground">Be the first to share your thoughts on this story.</li>
        )}
        {commentsQuery.data?.map((c: Comment) => (
          <li key={c.id} className="rounded border border-border p-4">
            <div className="text-xs text-muted-foreground font-semibold">{c.author} · {c.at}</div>
            <p className="mt-1 text-sm">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
