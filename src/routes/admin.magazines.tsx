import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { BookOpen, Upload, Trash2, Loader2, Eye, FileText, Pencil, Check, X, CheckCircle2 } from "lucide-react";
import {
  usePremiumProducts,
  useAdminCreatePremiumProduct,
  useAdminUpdatePremiumProduct,
  useAdminDeletePremiumProduct,
  type PremiumProduct,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/magazines")({
  component: AdminMagazines,
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      resolve(result.split(",")[1] || result);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/**
 * Extracts the first page of a PDF using pdf-lib and returns:
 *  - a Blob of the single-page PDF (for upload)
 *  - an object URL (for the <iframe> preview)
 */
async function extractFirstPage(
  file: File,
): Promise<{ blob: Blob; url: string; filename: string }> {
  // Dynamic import so it only loads when needed
  const { PDFDocument } = await import("pdf-lib");

  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes);

  const previewDoc = await PDFDocument.create();
  const [page] = await previewDoc.copyPages(srcDoc, [0]);
  previewDoc.addPage(page);

  const previewBytes = await previewDoc.save();
  const blob = new Blob([previewBytes as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const filename = `preview_${file.name}`;
  return { blob, url, filename };
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      resolve(result.split(",")[1] || result);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ── component ─────────────────────────────────────────────────────────────────

function AdminMagazines() {
  const products = usePremiumProducts();
  const create = useAdminCreatePremiumProduct();
  const update = useAdminUpdatePremiumProduct();
  const del = useAdminDeletePremiumProduct();
  const user = getStoredUser();

  // magazine-only products
  const magazines = (products.data?.products ?? []).filter(
    (p) => p.kind === "magazine",
  );

  const [form, setForm] = useState({
    title: "",
    summary: "",
    priceXaf: 2500,
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<PremiumProduct | null>(null);
  const [editForm, setEditForm] = useState({ title: "", summary: "", priceXaf: 2500 });

  const prevObjectUrl = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (f: File | null) => {
    // revoke old object url
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
    setPreviewFilename(null);
    setFile(f);
    if (!f) return;

    setExtracting(true);
    try {
      const { blob, url, filename } = await extractFirstPage(f);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setPreviewFilename(filename);
      prevObjectUrl.current = url;
    } catch {
      // pdf-lib extraction failed — still allow upload without preview
    } finally {
      setExtracting(false);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a PDF magazine file to upload.");
      return;
    }

    try {
      setUploadSuccessMsg(null);
      const pdfBase64 = await fileToBase64(file);
      const payload: Parameters<typeof create.mutateAsync>[0] = {
        kind: "magazine",
        title: form.title,
        summary: form.summary,
        priceXaf: form.priceXaf,
        pdfFilename: file.name,
        pdfBase64,
      };

      if (previewBlob && previewFilename) {
        payload.previewBase64 = await blobToBase64(previewBlob);
        payload.previewFilename = previewFilename;
      }

      await create.mutateAsync(payload);

      toast.success(`Magazine "${form.title}" published successfully!`);
      setUploadSuccessMsg(`Successfully published "${form.title}"! Users can now purchase and view it in the digital repository.`);

      // reset
      setForm({ title: "", summary: "", priceXaf: 2500 });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (prevObjectUrl.current) {
        URL.revokeObjectURL(prevObjectUrl.current);
        prevObjectUrl.current = null;
      }
      setPreviewUrl(null);
      setPreviewBlob(null);
      setPreviewFilename(null);
    } catch (err: any) {
      toast.error(err?.message || "Magazine upload failed. Please try again.");
    }
  }

  const openEditModal = (p: PremiumProduct) => {
    setEditingItem(p);
    setEditForm({
      title: p.title,
      summary: p.summary ?? "",
      priceXaf: p.priceXaf,
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await update.mutateAsync({
        id: editingItem.id,
        body: {
          title: editForm.title,
          summary: editForm.summary,
          priceXaf: editForm.priceXaf,
        },
      });
      toast.success(`Updated "${editForm.title}" details & price successfully!`);
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update magazine details.");
    }
  };

  const handleDelete = (p: PremiumProduct) => {
    if (!window.confirm(`Delete magazine "${p.title}"?`)) return;
    del.mutate(
      { id: p.id, userId: user?.id ?? "" },
      {
        onSuccess: () => toast.success(`Deleted magazine "${p.title}"`),
        onError: (err: any) => toast.error(err?.message || "Failed to delete magazine"),
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3">
        <BookOpen className="text-gold size-7" />
        <div>
          <h1 className="font-serif text-2xl font-bold">Magazines &amp; E-Papers</h1>
          <p className="text-sm text-muted-foreground">
            Upload official magazines — readers see page 1 for free preview, full access after purchase.
          </p>
        </div>
      </header>

      {/* Upload Success Banner */}
      {uploadSuccessMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {uploadSuccessMsg}
          </div>
          <button
            onClick={() => setUploadSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload form */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Upload className="size-4" /> Publish a Magazine
        </h2>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          {/* Title */}
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Magazine title (e.g. Issue #42: National Budget 2026 Special)"
            className="md:col-span-2 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />

          {/* Description */}
          <textarea
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            placeholder="Executive summary / description for readers (optional)"
            rows={3}
            className="md:col-span-2 rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy"
          />

          {/* Price */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
              XAF
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={form.priceXaf}
              onChange={(e) =>
                setForm((f) => ({ ...f, priceXaf: Number(e.target.value) }))
              }
              placeholder="Price (XAF)"
              className="w-full rounded-md border px-3 py-2 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          {/* File picker */}
          <label className="flex items-center gap-3 rounded-md border-2 border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            {extracting ? (
              <Loader2 className="size-5 text-muted-foreground animate-spin" />
            ) : (
              <FileText className="size-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {file ? file.name : extracting ? "Generating 1st page preview…" : "Choose PDF magazine"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>

          {/* First-page iframe preview */}
          {previewUrl && (
            <div className="md:col-span-2 rounded-lg overflow-hidden border bg-muted">
              <div className="flex items-center gap-2 px-3 py-2 border-b bg-white text-xs text-muted-foreground font-medium">
                <Eye className="size-3.5" />
                First-page preview (what free readers will see)
              </div>
              <iframe
                src={previewUrl}
                title="Magazine first-page preview"
                className="w-full h-[450px]"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={create.isPending || !file || extracting}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-navy text-white px-5 py-2.5 font-bold text-sm hover:bg-navy/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {create.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Publishing Magazine...
              </>
            ) : (
              <>
                <Upload className="size-4" /> Publish Magazine
              </>
            )}
          </button>

          {create.isError && (
            <p className="md:col-span-2 text-sm text-red-600 font-semibold">
              {(create.error as Error)?.message ?? "Upload failed"}
            </p>
          )}
        </form>
      </section>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-card border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-navy flex items-center gap-2">
                <Pencil className="size-4 text-amber-500" /> Modify Magazine Details &amp; Price
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Title
                </label>
                <input
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Price (XAF)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={editForm.priceXaf}
                  onChange={(e) => setEditForm((f) => ({ ...f, priceXaf: Number(e.target.value) }))}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Summary / Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm((f) => ({ ...f, summary: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-bold rounded-md border border-slate-300 hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={update.isPending}
                  className="px-4 py-2 text-xs font-bold rounded-md bg-navy text-white hover:bg-navy/90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {update.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Library */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="size-4" /> Published Magazines ({magazines.length})
        </h2>

        {magazines.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No magazines published yet. Upload one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-3">Title</th>
                  <th className="pr-3">Price</th>
                  <th className="pr-3">Downloads</th>
                  <th className="pr-3">Preview</th>
                  <th className="py-2">Published</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {magazines.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 pr-3 font-medium text-navy">{p.title}</td>
                    <td className="pr-3 font-bold text-slate-800">{p.priceXaf.toLocaleString()} XAF</td>
                    <td className="pr-3 text-muted-foreground">{p.downloadsCount} downloads</td>
                    <td className="pr-3">
                      {p.previewPath ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <Eye className="size-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </td>
                    <td className="pr-3 text-muted-foreground text-xs">
                      {new Date(p.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="text-right space-x-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-navy hover:text-navy/80 inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Pencil className="size-3.5 text-amber-500" /> Modify Price / Info
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={del.isPending}
                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
