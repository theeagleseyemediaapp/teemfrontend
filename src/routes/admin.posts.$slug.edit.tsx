import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useArticle, useUpdateArticle, useAiRefine } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { Sparkles, ImagePlus, Loader2 } from "lucide-react";
import { compressAndUploadImage } from "../lib/image-upload";
import { playEagleHasLanded } from "../lib/audio-alerts";

export const Route = createFileRoute("/admin/posts/$slug/edit")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: EditPost,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function EditPost() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const { data: article, isLoading } = useArticle(slug);
  const updateArticle = useUpdateArticle();
  const aiRefine = useAiRefine();
  const user = getStoredUser();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [featureImages, setFeatureImages] = useState<string[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState("");
  const [postFormat, setPostFormat] = useState<"article" | "video" | "audio">("article");
  const [featured, setFeatured] = useState(false);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refiningField, setRefiningField] = useState<'title' | 'summary' | 'body' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title ?? "");
      setSummary(article.summary ?? "");
      setBody((article.body ?? []).join("\n"));
      const slugs = (article.categorySlug ?? "").split(",").filter(Boolean);
      setCategorySlugs(slugs);
      
      if (slugs.includes("video")) setPostFormat("video");
      else if (slugs.includes("audio") || slugs.includes("podcast")) setPostFormat("audio");
      else setPostFormat("article");

      if (article.coverImage) {
        setFeatureImages([article.coverImage]);
      }
      if (article.additionalImages) {
        setAdditionalImages(article.additionalImages);
      }
      setVideoLink(article.videoLink ?? "");
      setFeatured(article.featured ?? false);
      setAlert(article.alert ?? false);
    }
  }, [article]);

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

    if (!user?.id) {
      setError("You must be signed in to edit articles.");
      return;
    }

    updateArticle.mutate(
      {
        id: article!.id,
        data: {
          title,
          summary,
          body: body.split("\n").filter((p) => p.trim()),
          categorySlug: [
            ...categorySlugs,
            ...(postFormat === "video" ? ["video"] : []),
            ...(postFormat === "audio" ? ["audio", "podcast"] : []),
          ].filter(Boolean).join(",") || "parliament",
          status,
          featured,
          alert,
          coverImage: featureImages[0] ?? "/logo.png",
          additionalImages,
          videoLink,
        },
        userId: user.id,
      },
      {
        onError: (err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to update article");
        },
        onSuccess: () => {
          playEagleHasLanded();
          setError(null);
          router.navigate({ to: "/admin/posts" });
        },
      }
    );
  };

  if (isLoading) return <p className="text-muted-foreground p-8">Loading article...</p>;
  if (!article) return <p className="text-muted-foreground p-8">Article not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-serif font-black text-3xl text-navy">Edit Post</h1>
        </div>
        <Button variant="outline" onClick={() => router.history.back()}>Cancel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Article</CardTitle>
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

            {isUploading && <p className="text-xs text-amber-600 animate-pulse mb-3">Uploading and compressing images...</p>}
            {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
            
            <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
              <Button type="button" onClick={() => handleSubmit("published")} disabled={updateArticle.isPending || isUploading} className="flex-1 sm:flex-none bg-navy hover:bg-navy/90 text-white">
                {updateArticle.isPending ? "Saving..." : "Save & Publish"}
              </Button>
              <Button type="button" onClick={() => handleSubmit("draft")} disabled={updateArticle.isPending || isUploading} variant="outline" className="flex-1 sm:flex-none">
                Save as Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
