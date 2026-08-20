import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaAssets, useAddMedia, useDeleteMedia } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useState } from "react";

export const Route = createFileRoute("/admin/media")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: Media,
});

function Media() {
  const assets = useMediaAssets();
  const addMedia = useAddMedia();
  const deleteMedia = useDeleteMedia();
  const user = getStoredUser();
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [mimeType, setMimeType] = useState("image/png");
  const [altText, setAltText] = useState("");

  const handleAdd = () => {
    if (!user?.id || !fileName.trim() || !url.trim()) return;
    addMedia.mutate({ fileName: fileName.trim(), url: url.trim(), mimeType, altText });
    setFileName(""); setUrl(""); setAltText("");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif font-black text-3xl text-navy">Media</h1>

      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>File Name</Label>
              <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="image.png" />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>MIME Type</Label>
              <Input value={mimeType} onChange={(e) => setMimeType(e.target.value)} placeholder="image/png" />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Description" />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={addMedia.isPending}>Add Media</Button>

          {assets.isLoading && <p className="text-sm text-muted-foreground">Loading media...</p>}

          {!assets.isLoading && (assets.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No media assets uploaded yet.</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {(assets.data ?? []).map((m: { id: string; fileName: string; url: string; mimeType: string; altText: string; createdAt: string }) => (
              <div key={m.id} className="rounded border border-border overflow-hidden group">
                {m.mimeType.startsWith("image/") ? (
                  <img src={m.url} alt={m.altText} className="w-full h-32 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center text-xs text-muted-foreground">{m.mimeType}</div>
                )}
                <div className="p-3">
                  <div className="text-sm font-semibold truncate">{m.fileName}</div>
                  <div className="text-xs text-muted-foreground">{m.altText}</div>
                  <div className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</div>
                  <button onClick={() => { if (confirm("Delete this media?")) deleteMedia.mutate({ id: m.id, userId: user?.id ?? "" }); }} className="mt-2 text-xs text-red-500 font-bold hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
