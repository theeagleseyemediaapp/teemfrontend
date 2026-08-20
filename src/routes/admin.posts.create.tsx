import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Sparkles, ImagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthState } from "@/components/auth/useAuthState";
import { useCreateArticle, useAiRefine } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useQueryClient } from "@tanstack/react-query";
import { compressAndUploadImage } from "../lib/image-upload";
import { playEagleHasLanded } from "../lib/audio-alerts";

const DRAFT_KEY = "eagles:create-post-draft:v1";

type DraftShape = {
  title: string;
  summary: string;
  body: string;
  categorySlugs: string[];
  featureImages: string[];
  additionalImages: string[];
  videoLink: string;
  featured: boolean;
  alert: boolean;
  postFormat: "article" | "video" | "audio";
};

export const Route = createFileRoute("/admin/posts/create")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: CreatePost,
});

function loadDraft(): Partial<DraftShape> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftShape) : {};
  } catch {
    return {};
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function CreatePost() {
  const router = useRouter();
  const initial = useRef<Partial<DraftShape>>(loadDraft());
  const [title, setTitle] = useState(initial.current.title ?? "");
  const [summary, setSummary] = useState(initial.current.summary ?? "");
  const [body, setBody] = useState(initial.current.body ?? "");
  const [categorySlugs, setCategorySlugs] = useState<string[]>(initial.current.categorySlugs ?? []);
  const [error, setError] = useState<string | null>(null);
  const [featureImages, setFeatureImages] = useState<string[]>(initial.current.featureImages ?? []);
  const [additionalImages, setAdditionalImages] = useState<string[]>(initial.current.additionalImages ?? []);
  const [videoLink, setVideoLink] = useState(initial.current.videoLink ?? "");
  const [postFormat, setPostFormat] = useState<"article" | "video" | "audio">(initial.current.postFormat ?? "article");
  const [featured, setFeatured] = useState(initial.current.featured ?? false);
  const [alert, setAlert] = useState(initial.current.alert ?? false);
  const [isUploading, setIsUploading] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState<boolean>(
    () => Boolean(initial.current.title || initial.current.body || initial.current.summary)
  );

  const { user } = useAuthState();
  const queryClient = useQueryClient();
  const createArticle = useCreateArticle();
  const aiRefine = useAiRefine();
  const [refiningField, setRefiningField] = useState<'title' | 'summary' | 'body' | null>(null);

  // Autosave to localStorage so a refresh does not lose written content
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: DraftShape = { title, summary, body, categorySlugs, featureImages, additionalImages, videoLink, featured, alert, postFormat };
    const t = setTimeout(() => {
      try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch { /* quota */ }
    }, 400);
    return () => clearTimeout(t);
  }, [title, summary, body, categorySlugs, featureImages, additionalImages, videoLink, featured, alert, postFormat]);

  const clearDraft = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY);
  };


  const handleRefine = async (field: 'title' | 'summary' | 'body') => {
    const currentText = field === 'title' ? title : field === 'summary' ? summary : body;
    if (!currentText.trim() || refiningField !== null) return;
    setRefiningField(field);
    try {
      const res = await aiRefine.mutateAsync({
        text: currentText,
        field,
      });
      if (field === 'title' && res.text) setTitle(res.text);
      if (field === 'summary' && res.text) setSummary(res.text);
      if (field === 'body' && res.text) setBody(res.text);
    } catch (e: any) {
      setError("AI Refine failed: " + e.message);
    } finally {
      setRefiningField(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'feature' | 'additional') => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    
    setIsUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const res = await compressAndUploadImage(file, "media");
          return res.url;
        })
      );

      if (type === 'feature') {
        setFeatureImages(urls);
      } else {
        setAdditionalImages((prev) => [...prev, ...urls]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to compress and upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (slug: string) => {
    setCategorySlugs(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = (status: "published" | "draft") => {
    setError(null);

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      setError("You must be signed in to create articles.");
      return;
    }

    const generatedSlug = slugify(title) || `article-${Date.now()}`;

    createArticle.mutate(
      {
        data: {
          title,
          slug: generatedSlug,
          summary,
          body: body.split("\n").filter((p) => p.trim()),
          categorySlug: [
            ...categorySlugs,
            ...(postFormat === "video" ? ["video"] : []),
            ...(postFormat === "audio" ? ["audio", "podcast"] : []),
          ].filter(Boolean).join(",") || "parliament",
          authorId: currentUser.id,
          status,
          featured,
          alert,
          coverImage: featureImages[0] ?? "/logo.png",
          additionalImages,
          videoLink,
        },
        userId: currentUser.id,
      },
      {
        onError: (err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to create article");
        },
        onSuccess: () => {
          playEagleHasLanded();
          clearDraft();
          queryClient.invalidateQueries({ queryKey: ["articles"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
          router.navigate({ to: "/admin/posts" });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-black text-3xl text-navy">Create Post</h1>
        <Button variant="outline" onClick={() => router.history.back()}>Cancel</Button>
      </div>

      {restoredNotice && (
        <div className="flex items-center justify-between gap-3 rounded border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-navy">
          <span>We restored your unsaved draft from this browser.</span>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setTitle(""); setSummary(""); setBody("");
              setCategorySlugs([]); setFeatureImages([]); setAdditionalImages([]); setVideoLink("");
              setFeatured(false); setAlert(false);
              setRestoredNotice(false);
            }}
            className="text-xs font-semibold uppercase tracking-wider text-navy/80 hover:text-navy"
          >
            Discard
          </button>
        </div>
      )}


      <Card>
        <CardHeader>
          <CardTitle>New Article</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="postFormat">Post Format</Label>
              <select
                id="postFormat"
                value={postFormat}
                onChange={(e) => setPostFormat(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="article">Standard Article</option>
                <option value="video">Video Report</option>
                <option value="audio">Audio / Podcast</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Title</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRefine('title')} disabled={!title || refiningField !== null} className="h-8 text-xs text-gold">
                  <Sparkles className="size-3 mr-1" /> {refiningField === 'title' ? 'Refining…' : 'AI Refine'}
                </Button>
              </div>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">Summary</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRefine('summary')} disabled={!summary || refiningField !== null} className="h-8 text-xs text-gold">
                  <Sparkles className="size-3 mr-1" /> {refiningField === 'summary' ? 'Refining…' : 'AI Refine'}
                </Button>
              </div>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary..." rows={3} required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Body</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRefine('body')} disabled={!body || refiningField !== null} className="h-8 text-xs text-gold">
                  <Sparkles className="size-3 mr-1" /> {refiningField === 'body' ? 'Refining…' : 'AI Refine'}
                </Button>
              </div>
              <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Article content... (one paragraph per line)" rows={10} required />
            </div>

            <div className="space-y-3">
              <Label>{postFormat === 'video' ? 'Video Categories' : postFormat === 'audio' ? 'Audio Categories' : 'Article Categories'}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(() => {
                  if (postFormat === "video") {
                    return [
                      { slug: "news-politics", name: "News & Politics" },
                      { slug: "style-magazine", name: "Style & Magazine" },
                      { slug: "newspapers-editions", name: "Newspapers & Editions" },
                      { slug: "documentary", name: "Documentary" },
                    ];
                  }
                  if (postFormat === "audio") {
                    return [
                      { slug: "news-politics", name: "News & Politics" },
                      { slug: "style-magazine", name: "Style & Magazine" },
                      { slug: "newspapers-editions", name: "Newspapers & Editions" },
                      { slug: "radio-news", name: "Radio News" },
                    ];
                  }
                  // Standard Article — all parliamentary categories
                  return [
                    { slug: "parliament",               name: "Parliament" },
                    { slug: "national-assembly",        name: "National Assembly" },
                    { slug: "senate",                   name: "Senate" },
                    { slug: "plenaries",                name: "Plenaries" },
                    { slug: "committee-echoes",         name: "Committee Echoes" },
                    { slug: "networking",               name: "Networking" },
                    { slug: "parliamentary-diplomacy",  name: "Parliamentary Diplomacy" },
                    { slug: "parliamentary-missions",   name: "Parliamentary Missions" },
                    { slug: "constituency-actions",     name: "Constituency Actions" },
                    { slug: "interviews",               name: "Interviews" },
                    { slug: "bills-laws",               name: "Bills/Laws" },
                    { slug: "opinions",                 name: "Opinions" },
                    { slug: "opinion",                  name: "Opinion" },
                    { slug: "politics",                 name: "Politics" },
                    { slug: "government",               name: "Government" },
                    { slug: "economy",                  name: "Economy" },
                    { slug: "video",                    name: "Video" },
                  ];
                })().map((cat: { slug: string; name: string }) => (
                  <label key={cat.slug} className="flex items-center space-x-1.5 cursor-pointer border p-1.5 rounded hover:bg-muted transition-colors">
                    <input 
                      type="checkbox" 
                      checked={categorySlugs.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                      className="size-3.5 rounded border-gray-300 text-gold focus:ring-gold"
                    />
                    <span className="text-xs">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-xs font-bold text-navy uppercase tracking-wider">Post Options</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer border p-2 rounded hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="size-3.5 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="text-xs font-medium">Featured (Home Carousel)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer border p-2 rounded hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={alert}
                    onChange={(e) => setAlert(e.target.checked)}
                    className="size-3.5 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="text-xs font-medium">Alert (Breaking Ticker)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer border p-2 rounded hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={categorySlugs.includes("awards")}
                    onChange={() => toggleCategory("awards")}
                    className="size-3.5 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="text-xs font-medium">Award (Awards Section)</span>
                </label>
              </div>
            </div>

            {postFormat === "article" && (
              <div className="space-y-4">
                <div>
                  <Label>Feature Image</Label>
                  <p className="text-xs text-muted-foreground mb-2">This image will appear on the homepage and at the top of the article.</p>
                  <div className="flex items-start gap-4">
                    {featureImages.length > 0 ? (
                      <div className="relative group">
                        <img src={featureImages[0]} alt="Feature" className="h-32 w-auto object-cover rounded border" />
                        <button type="button" onClick={() => setFeatureImages([])} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 w-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                        <ImagePlus className="size-6 text-muted-foreground mb-2" />
                        <span className="text-xs font-medium">Upload Feature Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'feature')} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Additional Images</Label>
                  <p className="text-xs text-muted-foreground mb-2">Add more images to create a gallery within the article.</p>
                  <div className="flex flex-wrap items-start gap-4">
                    {additionalImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="Additional" className="h-24 w-auto object-cover rounded border" />
                        <button type="button" onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          &times;
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <ImagePlus className="size-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] font-medium text-center px-2">Add More</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, 'additional')} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {(postFormat === "video" || postFormat === "audio" || postFormat === "article") && (
              <div className="space-y-2">
                <Label htmlFor="videoLink">{postFormat === "audio" ? "Audio/Podcast Link (YouTube, Spotify, etc.)" : "Video Link (YouTube, Vimeo, etc.)"}</Label>
                <Input id="videoLink" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="https://..." />
              </div>
            )}

            {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
            
            <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
              <Button type="button" onClick={() => handleSubmit("published")} disabled={createArticle.isPending} className="flex-1 sm:flex-none bg-navy hover:bg-navy/90 text-white">
                {createArticle.isPending ? "Publishing..." : "Publish Article"}
              </Button>
              <Button type="button" onClick={() => handleSubmit("draft")} disabled={createArticle.isPending} variant="outline" className="flex-1 sm:flex-none">
                Save as Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
