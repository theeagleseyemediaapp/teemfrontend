import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Crown, Upload, Trash2, Loader2, Pencil, Check, X, CheckCircle2, FileText } from "lucide-react";
import {
  usePremiumProducts,
  useAdminCreatePremiumProduct,
  useAdminUpdatePremiumProduct,
  useAdminDeletePremiumProduct,
  useAdminPremiumOrders,
  useAdminPremiumSubscribers,
  type PremiumProduct,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/premium")({
  component: AdminPremium,
});

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

function AdminPremium() {
  const products = usePremiumProducts();
  const orders = useAdminPremiumOrders();
  const subs = useAdminPremiumSubscribers();
  const create = useAdminCreatePremiumProduct();
  const update = useAdminUpdatePremiumProduct();
  const del = useAdminDeletePremiumProduct();
  const user = getStoredUser();

  const [form, setForm] = useState({
    kind: "speech_pdf" as "speech_pdf" | "insider_pdf" | "research_pdf" | "magazine",
    title: "",
    summary: "",
    priceXaf: 2500,
    coverUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<PremiumProduct | null>(null);
  const [editForm, setEditForm] = useState({ title: "", summary: "", priceXaf: 2500, coverUrl: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a PDF document file to upload.");
      return;
    }
    try {
      setUploadSuccessMsg(null);
      const pdfBase64 = await fileToBase64(file);
      await create.mutateAsync({
        ...form,
        pdfFilename: file.name,
        pdfBase64,
      });

      toast.success(`Document "${form.title}" published successfully!`);
      setUploadSuccessMsg(`Successfully published "${form.title}"! Users can now view and download it.`);

      setForm({ kind: "speech_pdf", title: "", summary: "", priceXaf: 2500, coverUrl: "" });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish document.");
    }
  }

  const openEditModal = (p: PremiumProduct) => {
    setEditingItem(p);
    setEditForm({
      title: p.title,
      summary: p.summary ?? "",
      priceXaf: p.priceXaf,
      coverUrl: p.coverUrl ?? "",
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
          coverUrl: editForm.coverUrl,
        },
      });
      toast.success(`Updated "${editForm.title}" details & price successfully!`);
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update document details.");
    }
  };

  const handleDelete = (p: PremiumProduct) => {
    if (!window.confirm(`Delete document "${p.title}"?`)) return;
    del.mutate(
      { id: p.id, userId: user?.id ?? "" },
      {
        onSuccess: () => toast.success(`Deleted document "${p.title}"`),
        onError: (err: any) => toast.error(err?.message || "Failed to delete document"),
      }
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <Crown className="text-gold size-7" />
        <div>
          <h1 className="font-serif text-2xl font-bold">Premium &amp; Official PDF Documents</h1>
          <p className="text-sm text-muted-foreground">Upload PDFs, modify prices &amp; details, manage subscriptions and orders.</p>
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

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-bold mb-3 flex items-center gap-2 text-lg">
          <Upload className="size-4" /> Upload a Premium PDF Document
        </h2>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <select
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as typeof form.kind }))}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="speech_pdf">Speech PDF</option>
            <option value="insider_pdf">Insider Brief</option>
            <option value="research_pdf">Research Paper</option>
            <option value="magazine">Magazine / E-Paper</option>
          </select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
              XAF
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={form.priceXaf}
              onChange={(e) => setForm((f) => ({ ...f, priceXaf: Number(e.target.value) }))}
              placeholder="Price (XAF)"
              className="w-full rounded-md border px-3 py-2 pl-12 text-sm"
            />
          </div>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Document Title"
            className="md:col-span-2 rounded-md border px-3 py-2 text-sm"
          />
          <textarea
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            placeholder="Summary / Description (optional)"
            className="md:col-span-2 rounded-md border px-3 py-2 text-sm min-h-20 resize-none"
          />
          <input
            value={form.coverUrl}
            onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
            placeholder="Cover image URL (optional)"
            className="md:col-span-2 rounded-md border px-3 py-2 text-sm"
          />
          <label className="md:col-span-2 flex items-center gap-3 rounded-md border-2 border-dashed p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-sm">{file ? file.name : "Click to choose PDF document file"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            disabled={create.isPending || !file}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-navy text-white px-4 py-2.5 font-bold text-sm hover:bg-navy/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {create.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Publishing Document...
              </>
            ) : (
              <>
                <Upload className="size-4" /> Publish Document
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
                <Pencil className="size-4 text-amber-500" /> Modify Document Price &amp; Details
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
                  Cover Image URL
                </label>
                <input
                  value={editForm.coverUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, coverUrl: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy"
                  placeholder="https://..."
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
        <h2 className="font-bold mb-3 text-lg flex items-center gap-2">
          <FileText className="size-4" /> Published Document Library ({products.data?.products?.length ?? 0})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr>
                <th className="py-2 pr-3">Title</th>
                <th className="pr-3">Kind</th>
                <th className="pr-3">Price</th>
                <th className="pr-3">Downloads</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.data?.products?.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 pr-3 font-medium text-navy">{p.title}</td>
                  <td className="pr-3 text-xs uppercase font-semibold text-muted-foreground">{p.kind.replace("_", " ")}</td>
                  <td className="pr-3 font-bold text-slate-800">{p.priceXaf.toLocaleString()} XAF</td>
                  <td className="pr-3 text-muted-foreground">{p.downloadsCount} downloads</td>
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
              {!products.data?.products?.length && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No documents published yet. Upload one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-bold mb-3">Recent Orders</h2>
          <ul className="text-sm divide-y">
            {(orders.data?.orders ?? []).slice(0, 20).map((o: any) => (
              <li key={o.id} className="py-2 flex justify-between items-center">
                <span className="truncate flex-1">{o.id.slice(0, 8)} · {o.kind} · {o.provider ?? "—"}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase ${o.status === "paid" ? "text-emerald-600" : o.status === "failed" ? "text-red-600" : "text-amber-600"}`}>{o.status}</span>
                  {o.status === "paid" && (
                    <a
                      href={`/api/v1/premium/orders/${o.id}/receipt?token=${localStorage.getItem("eagle_token") ?? ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-navy hover:underline font-semibold"
                    >
                      Receipt
                    </a>
                  )}
                </div>
              </li>
            ))}
            {!orders.data?.orders?.length && <li className="py-4 text-muted-foreground">No orders yet.</li>}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-bold mb-3">Active Subscribers ({subs.data?.subscribers?.length ?? 0})</h2>
          <ul className="text-sm divide-y">
            {(subs.data?.subscribers ?? []).slice(0, 20).map((s: any) => (
              <li key={s.id} className="py-2 flex justify-between">
                <span>{s.userEmail ?? s.userId?.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground">until {new Date(s.currentPeriodEnd).toLocaleDateString()}</span>
              </li>
            ))}
            {!subs.data?.subscribers?.length && <li className="py-4 text-muted-foreground">No active subscribers.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
