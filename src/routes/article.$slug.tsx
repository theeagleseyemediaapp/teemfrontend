import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Twitter, Link2, ChevronRight, Sparkles, MessageCircle } from "lucide-react";
import { useComments, useArticles, useToggleLike, useAiExplain, useAddComment, useCommentReplies, useAddReply, articleQueryOptions, useArticle } from "@/lib/api";
import { getGuestProfileId, getStoredUser } from "@/lib/auth-session";
import { Sidebar } from "@/components/site/Sidebar";
import { ShareButtons } from "@/components/site/ShareButtons";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      return await queryClient.ensureQueryData(articleQueryOptions(params.slug));
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — The Eagle's Eye Media` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.summary },
          { property: "og:type", content: "article" },
          { property: "og:image", content: loaderData.coverImage },
          { property: "og:url", content: `/article/${loaderData.slug}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/article/${loaderData.slug}` }] : [],
  }),
  component: Article,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-serif font-bold text-3xl text-navy">Article not found</h1>
      <Link to="/" className="mt-6 inline-block bg-gold text-navy font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded">Back home</Link>
    </div>
  ),
});

function profileId() {
  return getStoredUser()?.id ?? getGuestProfileId();
}

function CommentThread({ 
  comment, 
  articleId 
}: { 
  comment: { 
    id: string; 
    authorId: string; 
    body: string; 
    createdAt: string; 
    replyCount?: number;
    authorName?: string;
    authorRole?: string;
    isSubscriber?: boolean;
  }; 
  articleId: string; 
}) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replies = useCommentReplies(open ? comment.id : "");
  const addReply = useAddReply();

  const getBadge = () => {
    const isSub = comment.isSubscriber;
    const role = comment.authorRole;
    
    if (role === "admin" || role === "super_admin" || role === "editor") {
      return (
        <span className="inline-flex items-center text-[9px] font-black text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
          Admin
        </span>
      );
    }
    if (isSub) {
      return (
        <span className="inline-flex items-center text-[9px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
          Member
        </span>
      );
    }
    return null;
  };

  const initialLetter = comment.authorName?.[0]?.toUpperCase() ?? "G";

  return (
    <li className="flex gap-3 items-start group">
      {/* Avatar */}
      <div className="size-8 sm:size-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-slate-300">
        {initialLetter}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Comment Bubble */}
        <div className="inline-block bg-slate-100 rounded-2xl px-4 py-2.5 max-w-[95%]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs sm:text-sm text-navy">{comment.authorName ?? "Guest Reader"}</span>
            {getBadge()}
          </div>
          <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
        </div>

        {/* Action buttons bar */}
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground pl-3">
          <span className="font-mono">
            {new Date(comment.createdAt).toLocaleDateString(undefined, { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
          </span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-bold text-navy hover:underline inline-flex items-center gap-1"
          >
            {open ? "Hide replies" : `Reply${comment.replyCount && comment.replyCount > 0 ? ` (${comment.replyCount})` : ""}`}
          </button>
        </div>

        {/* Nested replies block */}
        {open && (
          <div className="mt-3 ml-1 sm:ml-2 space-y-3 pl-3 border-l border-slate-300">
            {(replies.data ?? []).map((r: any) => {
              const getReplyBadge = () => {
                if (r.authorRole === "admin" || r.authorRole === "super_admin" || r.authorRole === "editor") {
                  return <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1 rounded border border-amber-100">Admin</span>;
                }
                if (r.isSubscriber) {
                  return <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">Member</span>;
                }
                return null;
              };
              const rInitial = r.authorName?.[0]?.toUpperCase() ?? "G";

              return (
                <div key={r.id} className="flex gap-2.5 items-start">
                  <div className="size-6 sm:size-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                    {rInitial}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="inline-block bg-slate-100 rounded-2xl px-3 py-2 max-w-[95%]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-navy">{r.authorName ?? "Guest Reader"}</span>
                        {getReplyBadge()}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 mt-0.5 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground pl-2 font-mono">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Reply Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                addReply.mutate({ commentId: comment.id, authorId: profileId(), body: replyText.trim(), articleId });
                setReplyText("");
              }}
              className="flex gap-2 items-center pt-1"
            >
              <div className="size-6 sm:size-7 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-xs shrink-0">
                {getStoredUser()?.displayName?.[0]?.toUpperCase() ?? "G"}
              </div>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 rounded-full border border-border bg-slate-50 px-3.5 py-1.5 text-xs outline-none focus:border-navy focus:bg-white transition-colors"
              />
              <button 
                type="submit" 
                disabled={addReply.isPending || !replyText.trim()} 
                className="bg-navy hover:bg-navy/90 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full disabled:opacity-50 transition-all shrink-0"
              >
                Reply
              </button>
            </form>
          </div>
        )}
      </div>
    </li>
  );
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([a-zA-Z0-9_-]{6,15})/);
  return m ? m[1] : null;
}

function Article() {
  const loaderData = Route.useLoaderData();
  const slug = Route.useParams().slug;
  const { data: article = loaderData } = useArticle(slug);
  const videoUrl = article.videoUrl || article.video_url;
  const [showAi, setShowAi] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount ?? 0);
  const [commentText, setCommentText] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const aiExplain = useAiExplain(slug);
  const commentsQuery = useComments(article.id);
  const articlesQuery = useArticles();
  const toggleLike = useToggleLike();
  const addComment = useAddComment();

  const comments = commentsQuery.data ?? [];
  const related = (articlesQuery.data ?? []).filter((a: { slug: string }) => a.slug !== article.slug).slice(0, 3);
  const body = article.body ?? [article.summary];

  return (
    <article className="bg-[#FAF9F6]">
      {/* Premium Compact Breadcrumb Banner */}
      <div className="relative overflow-hidden bg-[#0A1128] py-3 sm:py-4 border-b border-white/5">
        {/* Blurred Branded Background Asset */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-[3px] opacity-80 scale-[1.03] pointer-events-none"
          style={{ backgroundImage: `url('/breadcrumb_background.png')` }}
        />
        {/* Diagonal Grid Background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="40" height="40" fill="none" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-grid)" />
        </svg>

        {/* Orange Sprinkles (Blurred Glows and Particles) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#E57C23] rounded-full blur-[100px] opacity-15" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#E57C23] rounded-full blur-[120px] opacity-10" />
          
          {/* Subtle spark sprinkles */}
          <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-[#E57C23] rounded-full opacity-40 blur-[0.5px]" />
          <div className="absolute top-[65%] left-[35%] w-2 h-2 bg-[#E57C23] rounded-full opacity-30 blur-[1px]" />
          <div className="absolute top-[40%] right-[25%] w-1 h-1 bg-[#E57C23] rounded-full opacity-50" />
          <div className="absolute top-[75%] right-[10%] w-1.5 h-1.5 bg-[#E57C23] rounded-full opacity-40 blur-[0.5px]" />
          <div className="absolute top-[15%] right-[40%] w-2 h-2 bg-[#E57C23] rounded-full opacity-35 blur-[0.5px]" />
        </div>
        {/* Banner Content (Breadcrumbs and Page Title) */}
        <div className="relative mx-auto max-w-7xl px-4 z-10">
          <nav className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight className="size-3 text-slate-500" />
            <span className="text-slate-300 truncate max-w-xs">{article.title}</span>
          </nav>
          <div className="mt-3">
            <span className="inline-block text-[9px] uppercase font-extrabold tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
              {article.categorySlug ?? "News"}
            </span>
            <h1 className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-white mt-2 max-w-4xl leading-tight tracking-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>
 
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 pb-12">
          <div>
            <span className="pill-tag">{article.categorySlug ?? "News"}</span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl mt-3 leading-tight text-navy">{article.title}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
              <div className="text-xs">
                <span className="font-semibold">Editorial Desk</span>
                <span className="text-muted-foreground"> · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
              </div>
              <ShareButtons url={`/article/${article.slug}`} title={article.title} />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              {Math.max(2, Math.round((body.join(" ").split(/\s+/).length || 200) / 220))} min read
            </div>
 
            {/* Video Player or Repositioned Cover Image inside the Body */}
            {videoUrl ? (
              <div className="mt-6 overflow-hidden rounded-xl bg-black border border-slate-200/50 shadow-md aspect-[16/9] relative max-h-[500px]">
                {extractYoutubeId(videoUrl) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}?modestbranding=1&rel=0&fs=1`}
                    title="Video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    poster={article.coverImage}
                  />
                )}
              </div>
            ) : (
              article.coverImage && (
                <div className="mt-6 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/50 shadow-md aspect-[16/9] max-h-[480px]">
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover object-center hover:scale-[1.01] transition-transform duration-500" 
                  />
                </div>
              )
            )}
 
            <div className="mt-6 font-serif text-foreground/90 leading-relaxed space-y-5 text-[15px] sm:text-[16px] md:text-[17px]">
              <p className="text-base sm:text-lg leading-relaxed font-semibold text-navy/90">{article.summary}</p>
              {body.map((p: string, i: number) => {
                const isImage = p.startsWith("http") && (p.includes(".jpg") || p.includes(".png") || p.includes(".webp") || p.includes(".jpeg") || p.includes("supabase.co/storage"));
                if (isImage) {
                  return (
                    <img key={i} src={p} alt="" className="max-w-full mx-auto my-6 rounded-lg object-contain max-h-[480px] shadow-sm border border-slate-200/30 block" />
                  );
                }
                return <p key={i}>{p}</p>;
              })}
            </div>
 
            {/* Additional Images Gallery */}
            {article.additionalImages && Array.isArray(article.additionalImages) && article.additionalImages.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-serif font-black text-base text-navy mb-4">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {article.additionalImages.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => setActiveImage(img)} 
                      className="block overflow-hidden rounded-lg border border-slate-200/50 shadow-sm aspect-square relative group w-full"
                    >
                      <img 
                        src={img} 
                        alt={`Gallery image ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[9px] font-semibold bg-black/60 px-2 py-1 rounded">Preview</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Facebook-style Action Bar */}
            <div className="mt-8 border-y border-slate-200 py-1.5 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-semibold select-none">
              <button
                onClick={() => {
                  toggleLike.mutate({ articleId: article.id, profileId: profileId() }, {
                    onSuccess: (data) => setLikeCount(data.likeCount),
                  });
                }}
                disabled={toggleLike.isPending}
                className="flex-1 py-2 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60 text-navy"
              >
                <svg className="size-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
              </button>

              <div className="flex-1 py-2 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer text-slate-600">
                <MessageCircle className="size-5 text-slate-500" />
                <span>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</span>
              </div>
            </div>

            {/* Comments block */}
            <div className="mt-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-3">
                  <h3 className="font-serif font-black text-xl text-navy flex items-center gap-1.5">
                    Comments 
                    <span className="text-xs font-normal text-slate-400">({comments.length})</span>
                  </h3>
                  
                  {/* AI Explain Block Nested inside the Comments Header layout */}
                  <button 
                    onClick={() => setShowAi((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-navy rounded-full text-xs font-bold transition-all border border-amber-400/25 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[1.1rem]">psychology</span>
                    {showAi ? "Hide AI Explain" : "AI Explain Story"}
                  </button>
                </div>

                {showAi && (
                  <div className="rounded-xl border border-border bg-slate-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
                    {aiExplain.isLoading && <p className="text-sm text-muted-foreground">AI is reading this story…</p>}
                    {!aiExplain.isLoading && aiExplain.data && (
                      <div className="space-y-4">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{aiExplain.data.explanation}</p>
                        {aiExplain.data.related?.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-3">
                            {aiExplain.data.related.map((r: { slug: string; title: string; summary: string }) => (
                              <Link key={r.slug} to="/article/$slug" params={{ slug: r.slug }} className="rounded border border-border p-3 hover:border-navy transition bg-white shadow-sm">
                                <div className="font-serif font-bold text-sm text-navy leading-snug">{r.title}</div>
                                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.summary}</div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentText.trim()) return;
                    addComment.mutate({ articleId: article.id, authorId: profileId(), body: commentText.trim() });
                    setCommentText("");
                  }}
                  className="flex gap-2.5 items-center pt-2 pb-4 border-b border-slate-100"
                >
                  <div className="size-8 sm:size-9 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-sm shrink-0">
                    {getStoredUser()?.displayName?.[0]?.toUpperCase() ?? "G"}
                  </div>
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 rounded-full border border-border bg-slate-50 px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-navy focus:bg-white transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={addComment.isPending || !commentText.trim()} 
                    className="bg-navy hover:bg-navy/90 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full disabled:opacity-50 transition-all shrink-0 shadow-sm"
                  >
                    Comment
                  </button>
                </form>

                {commentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading comments…</p>}
                {comments.length === 0 && !commentsQuery.isLoading && (
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first.</p>
                )}
                <ul className="space-y-4">
                  {comments.map((c: { id: string; authorId: string; body: string; createdAt: string; replyCount?: number }) => (
                    <CommentThread key={c.id} comment={c} articleId={article.id} />
                  ))}
                </ul>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-12">
                <h2 className="section-rule text-2xl mb-5">More on this story</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {related.map((m: { slug: string; title: string; summary: string; coverImage?: string }) => (
                    <Link key={m.slug} to="/article/$slug" params={{ slug: m.slug }} className="group block">
                      <div className="relative overflow-hidden bg-muted aspect-[16/10] rounded-sm">
                        <img src={m.coverImage ?? "/logo.png"} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="pt-3">
                        <h3 className="font-serif font-bold text-base leading-snug group-hover:text-navy/80">{m.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{m.summary}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Lightbox / Modal Preview overlay */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeImage} 
              alt="Preview" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10"
            />
            <button 
              className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/80 rounded-full p-2 text-sm font-bold w-10 h-10 flex items-center justify-center transition-colors border border-white/20"
              onClick={() => setActiveImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
