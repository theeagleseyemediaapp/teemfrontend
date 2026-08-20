import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: BannersPage,
});

interface Banner {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  type: "image" | "adsense";
  adsenseClientId?: string;
  adsenseSlotId?: string;
  active: boolean;
  sortOrder: number;
}

type BannerForm = Omit<Banner, "id">;

const EMPTY_FORM: BannerForm = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  type: "image",
  adsenseClientId: "",
  adsenseSlotId: "",
  active: true,
  sortOrder: 0,
};

function BannersPage() {
  const { data: banners = [], isLoading, refetch } = useAdminBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(b: Banner) {
    setForm({
      title: b.title,
      imageUrl: b.imageUrl ?? "",
      linkUrl: b.linkUrl ?? "",
      type: b.type,
      adsenseClientId: b.adsenseClientId ?? "",
      adsenseSlotId: b.adsenseSlotId ?? "",
      active: b.active,
      sortOrder: b.sortOrder,
    });
    setEditingId(b.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      imageUrl: form.imageUrl || undefined,
      linkUrl: form.linkUrl || undefined,
      type: form.type,
      adsenseClientId: form.adsenseClientId || undefined,
      adsenseSlotId: form.adsenseSlotId || undefined,
      active: form.active,
      sortOrder: form.sortOrder,
    };

    try {
      if (editingId) {
        await updateBanner.mutateAsync({ id: editingId, data: payload });
        toast.success("Banner updated successfully");
      } else {
        await createBanner.mutateAsync(payload);
        toast.success("Banner created successfully");
      }
      cancelForm();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save banner");
    }
  }

  async function handleToggleActive(b: Banner) {
    try {
      await updateBanner.mutateAsync({ id: b.id, data: { active: !b.active } });
      toast.success(b.active ? "Banner deactivated" : "Banner activated");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update banner");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this banner permanently?")) return;
    try {
      await deleteBanner.mutateAsync(id);
      toast.success("Banner deleted");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete banner");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-black text-3xl text-navy">Banner Rotator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the auto-rotating banner strip shown above the navigation. Slides auto-advance every 30 seconds.
          </p>
        </div>
        <Button onClick={openCreate} id="add-banner-btn">
          + Add Banner
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="border-navy/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit Banner" : "New Banner"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="banner-title">Title *</Label>
                  <Input
                    id="banner-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Sponsor Banner – Parliament Week"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="banner-type">Type *</Label>
                  <select
                    id="banner-type"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "image" | "adsense" }))}
                  >
                    <option value="image">Image Banner</option>
                    <option value="adsense">Google AdSense</option>
                  </select>
                </div>
              </div>

              {form.type === "image" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="banner-image-url">Image URL or Upload *</Label>
                    <div className="space-y-2">
                      <Input
                        id="banner-image-url"
                        value={form.imageUrl}
                        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                        placeholder="https://... or click Upload below"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          id="banner-file-upload"
                          className="text-xs cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/80"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const base64 = evt.target?.result as string;
                                setForm((f) => ({ ...f, imageUrl: base64 }));
                                toast.success("Banner image loaded successfully!");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recommended resolution: 970×90px or 1200×300px banner</p>
                  </div>
                  <div>
                    <Label htmlFor="banner-link-url">Click-through URL</Label>
                    <Input
                      id="banner-link-url"
                      value={form.linkUrl}
                      onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                      placeholder="https://advertiser.com or /about"
                    />
                  </div>
                </div>
              )}

              {form.type === "adsense" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="banner-client-id">AdSense Client ID</Label>
                    <Input
                      id="banner-client-id"
                      value={form.adsenseClientId}
                      onChange={(e) => setForm((f) => ({ ...f, adsenseClientId: e.target.value }))}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="banner-slot-id">AdSense Slot ID</Label>
                    <Input
                      id="banner-slot-id"
                      value={form.adsenseSlotId}
                      onChange={(e) => setForm((f) => ({ ...f, adsenseSlotId: e.target.value }))}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="banner-sort">Sort Order</Label>
                  <Input
                    id="banner-sort"
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Switch
                    id="banner-active"
                    checked={form.active}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                  />
                  <Label htmlFor="banner-active">Active (visible on site)</Label>
                </div>
              </div>

              {/* Preview */}
              {form.type === "image" && form.imageUrl && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-1 w-full rounded overflow-hidden border border-border h-[90px] bg-muted/20">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={createBanner.isPending || updateBanner.isPending}>
                  {editingId ? "Save Changes" : "Create Banner"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Banner list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading banners...</p>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No banners yet. Click <strong>+ Add Banner</strong> to create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(banners as Banner[])
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((b) => (
              <Card key={b.id} className={`transition-opacity ${!b.active ? "opacity-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-28 h-16 bg-muted/30 rounded overflow-hidden border border-border/50">
                      {b.type === "image" && b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground/60 font-mono">
                          {b.type === "adsense" ? "AdSense" : "No Image"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{b.title}</span>
                        <Badge variant={b.type === "adsense" ? "secondary" : "outline"} className="text-xs shrink-0">
                          {b.type === "adsense" ? "AdSense" : "Image"}
                        </Badge>
                        <Badge variant={b.active ? "default" : "secondary"} className="text-xs shrink-0">
                          {b.active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-muted-foreground shrink-0">Order: {b.sortOrder}</span>
                      </div>
                      {b.linkUrl && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.linkUrl}</p>
                      )}
                      {b.type === "adsense" && b.adsenseClientId && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                          {b.adsenseClientId} / {b.adsenseSlotId}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={b.active}
                        onCheckedChange={() => handleToggleActive(b)}
                        aria-label={`Toggle ${b.title}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(b)}
                        id={`edit-banner-${b.id}`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(b.id)}
                        id={`delete-banner-${b.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4 text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <p className="font-semibold">💡 How it works</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Active banners rotate automatically every <strong>30 seconds</strong> on the site.</li>
            <li>Visitors see navigation dots to switch slides manually.</li>
            <li>Use <strong>Sort Order</strong> to control which banner appears first.</li>
            <li>For <strong>AdSense</strong>, enter your Publisher ID (ca-pub-…) and Slot ID from your Google Ads account.</li>
            <li>Recommended image size: <strong>970 × 90 px</strong> (leaderboard) or <strong>970 × 250 px</strong> (billboard).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
