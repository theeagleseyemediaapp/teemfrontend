import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Crown, Lock, FileText, ChevronLeft, ShieldCheck, CreditCard, Sparkles, Loader2 } from "lucide-react";
import {
  usePremiumProducts,
  usePremiumCheckout,
  useMyEntitlements,
  useAuthMe,
} from "@/lib/api";
import { useAuthState } from "@/components/auth/useAuthState";
import { toast } from "sonner";

export const Route = createFileRoute("/premium-preview/$id")({
  head: () => ({
    meta: [
      { title: "Document Preview — The Eagle's Eye Media" },
      { name: "description", content: "Secure first-page teaser of premium parliamentary dispatch journals." },
    ],
  }),
  component: PremiumPreviewPage,
});

function priceFmt(xaf: number) {
  return new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(xaf);
}

function PremiumPreviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const products = usePremiumProducts();
  const authState = useAuthState();
  const ent = useMyEntitlements();
  const authMe = useAuthMe();
  
  const product = products.data?.products?.find((p: any) => p.id === id) as any;
  const isSub = authMe.data?.user?.role === "admin" || authMe.data?.user?.role === "editor" || ent.data?.tier === "subscriber";
  const owned = isSub || product?.isOwned;

  const [phone, setPhone] = useState("");
  const [previewData, setPreviewData] = useState<{ url: string; type: "pdf" | "image" } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const checkout = usePremiumCheckout();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("last_momo_phone");
      if (saved) setPhone(saved);
    }
  }, []);

  // Fetch signed preview URL from the backend
  useEffect(() => {
    if (!id) return;
    setLoadingPreview(true);
    const apiBase = import.meta.env.VITE_API_URL ?? "/api/v1";
    fetch(`${apiBase}/premium/preview/${id}`, {
      headers: { Authorization: localStorage.getItem("eagle_token") ? `Bearer ${localStorage.getItem("eagle_token")}` : "" },
    })
      .then((r) => r.json())
      .then((data: { url?: string; type?: "pdf" | "image" }) => {
        if (data.url) {
          setPreviewData({ url: data.url, type: data.type || "pdf" });
        } else if (product?.coverUrl) {
          setPreviewData({ url: product.coverUrl, type: "image" });
        }
        setLoadingPreview(false);
      })
      .catch(() => {
        if (product?.coverUrl) {
          setPreviewData({ url: product.coverUrl, type: "image" });
        }
        setLoadingPreview(false);
      });
  }, [id, product]);

  // If user paid/owns it, redirect back to premium list or trigger direct full view
  useEffect(() => {
    if (owned) {
      toast.success(`You have full access to "${product?.title || 'this document'}".`);
      navigate({ to: "/premium" });
    }
  }, [owned, product, navigate]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-slate-50">
        <Loader2 className="size-8 animate-spin text-navy mb-2" />
        <p className="text-sm font-semibold text-slate-500">Loading document details...</p>
      </div>
    );
  }

  function handleBuy() {
    if (!phone.trim()) {
      toast.error("Please enter a Mobile Money phone number.");
      return;
    }
    if (typeof window !== "undefined") localStorage.setItem("last_momo_phone", phone);
    checkout.mutate(
      { kind: "product", id: product.id, phone },
      {
        onSuccess: (data) => {
          if (data?.status === "paid") {
            toast.success(`Payment successful! Full publication unlocked.`);
            navigate({ to: "/premium" });
          } else if (data?.status === "pending" && data?.orderId) {
            toast.info("Payment pending. Please confirm on your mobile phone.");
          }
        },
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-navy pb-16">
      {/* Upper Navigation Bar */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/premium"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy transition-colors"
          >
            <ChevronLeft className="size-4" /> Back to Library
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Page 1 Secure Teaser
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_400px] gap-8 items-start animate-in fade-in duration-300">
        {/* Left Column: Secure Teaser File Renderer */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden aspect-[3/4] w-full relative shadow-md flex items-center justify-center border border-slate-200">
            {loadingPreview ? (
              <div className="text-center space-y-2">
                <Loader2 className="size-10 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading secure teaser preview...</p>
              </div>
            ) : previewData?.url && previewData.type === "pdf" ? (
              <iframe
                src={`${previewData.url}#toolbar=0&navpanes=0`}
                title="Page 1 Teaser Preview"
                className="w-full h-full border-0"
              />
            ) : previewData?.url ? (
              <img
                src={previewData.url}
                alt={product.title}
                className="w-full h-full object-contain bg-slate-100"
              />
            ) : (
              <div className="p-8 text-center space-y-4 text-slate-500 max-w-sm">
                <FileText className="size-16 mx-auto text-amber-500" />
                <p className="font-serif font-bold text-base text-navy">{product.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No preview file is currently stored. Page 1 visual render is locked inside the Vault database.
                </p>
              </div>
            )}

            {/* Premium Protective Watermark Overlay */}
            <div className="absolute inset-0 bg-navy/5 pointer-events-none select-none flex items-center justify-center">
              <div className="rotate-[-28deg] border-4 border-slate-400/20 text-slate-400/35 font-black text-3xl uppercase tracking-widest px-8 py-3 rounded-2xl">
                Eagle Press Secure Preview
              </div>
            </div>

            {/* Blurred Visual Teaser Overlay at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-6">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200">
                  <Lock className="size-3.5 text-amber-500" /> Remaining Pages Locked in Secure Vault
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & MOMO Gatekeeper Payment Panel */}
        <div className="space-y-6">
          {/* Document Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              {product.kind === "magazine" ? "Official Magazine" : product.kind.replace("_", " ")}
            </span>
            <h1 className="font-serif font-black text-xl sm:text-2xl text-navy leading-snug">
              {product.title}
            </h1>
            {product.summary && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.summary}
              </p>
            )}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>Two-File Rule digital asset security active.</span>
            </div>
          </div>

          {/* Payment Gatekeeper Panel */}
          <div className="bg-white rounded-2xl p-6 border border-amber-300 shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 tracking-wider uppercase">
                <Crown className="size-3 text-amber-500" /> Premium Access
              </div>
              <h3 className="font-serif font-black text-lg text-navy">Unlock Document Vault</h3>
              <p className="text-xs text-slate-500">
                Unlock full multi-page PDF access, secure online reading, and offline downloads.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-semibold">Single Document Price</span>
                <span className="text-2xl font-black text-navy">{priceFmt(product.priceXaf)}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block font-semibold">
                  Mobile Money Phone Number (MoMo / Orange)
                </label>
                <div className="relative">
                  <CreditCard className="size-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 670000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy placeholder-slate-400 outline-none focus:border-navy"
                  />
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={!phone.trim() || checkout.isPending}
                className="w-full py-3 bg-navy hover:bg-navy/95 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{checkout.isPending ? "Contacting Operator..." : "Unlock Full Document"}</span>
                <Sparkles className="size-3.5 text-amber-400" />
              </button>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                Security notice: Unlocking authorizes a one-time charge. Full pages are released to your device instantly upon payment validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
