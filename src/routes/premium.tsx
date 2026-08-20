import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Crown, Download, FileText, Loader2, Lock, X, Check, Mail, Eye, BookOpen, ShieldCheck, Send, Share2 } from "lucide-react";
import {
  usePremiumPlans,
  usePremiumProducts,
  usePremiumCheckout,
  usePremiumDownload,
  useMyEntitlements,
  useAuthMe,
  useNewsletterSubscribe,
  type PremiumProduct,
} from "@/lib/api";
import { useAuthState } from "@/components/auth/useAuthState";
import { useQueryClient } from "@tanstack/react-query";
import { SubscribeModal } from "@/components/site/SubscribeModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { PaymentModal } from "@/components/site/PaymentModal";
import { ShareButtons } from "@/components/site/ShareButtons";
import { brandLogoUrl } from "@/lib/branding";
import { toast } from "sonner";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Premium Subscriptions & Digital E-Journal — The Eagle's Eye Media" },
      { name: "description", content: "Subscribe to Cameroon's official parliamentary journal and research dossier service. Instant PDF downloads, plenary transcript briefings, legislative deep-dives, and exclusive lawmaker interviews directly to your library." },
      { name: "keywords", content: "Cameroon parliamentary journal, e-journal Cameroon, legislative PDF download, Cameroon political research, parliamentary subscription Yaoundé, MoMo payment journal Cameroon" },
      { property: "og:title", content: "Premium Subscriptions & E-Journal — The Eagle's Eye Media" },
      { property: "og:description", content: "Access official Cameroonian parliamentary speeches, insider research, bill trackings, and executive e-journals." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/premium" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Media Premium E-Journal & Subscriptions" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Premium Subscriptions & E-Journal — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Parliamentary speeches, insider briefs & research PDFs directly to your device." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/premium" }],
  }),
  component: PremiumPage,
});

const PLAN_HINTS: Record<string, string> = {
  instant: "1 PDF",
  monthly: "Unlimited Access",
  yearly: "Unlimited Access",
};

function priceFmt(xaf: number) {
  return new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(xaf);
}

function PremiumPage() {
  const plans = usePremiumPlans();
  const products = usePremiumProducts();
  const qc = useQueryClient();
  const authState = useAuthState();
  const ent = useMyEntitlements();
  const authMe = useAuthMe();
  const newsletterSubscribe = useNewsletterSubscribe();
  const isSub = authMe.data?.user?.role === "admin" || authMe.data?.user?.role === "editor" || ent.data?.tier === "subscriber";

  const userPlan: UserPlan = isSub ? "subscriber" : "none";
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"subscribe" | "premium" | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [filter, setFilter] = useState<"all" | "magazine" | "document">("all");
  const [pendingPayment, setPendingPayment] = useState<{
    orderId: string;
    provider: string;
    phone: string;
    amount: number;
  } | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    if (!authState.user) {
      setPendingAction("subscribe");
      setAuthModalOpen(true);
    } else {
      setSubscribeModalOpen(true);
    }
  };

  const handleAuthSuccess = (data?: { user?: { role?: string } }) => {
    setAuthModalOpen(false);
    const role = data?.user?.role;
    if (role === "admin" || role === "editor" || role === "super_admin") {
      window.location.href = "/admin";
    } else if (pendingAction === "subscribe") {
      setSubscribeModalOpen(true);
    } else if (pendingAction === "premium") {
      window.location.href = "/premium";
    }
    setPendingAction(null);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    newsletterSubscribe.mutate(
      { email: newsletterEmail, name: newsletterEmail.split("@")[0] },
      {
        onSuccess: () => {
          setNewsletterSubscribed(true);
          toast.success("Subscribed to Executive Dispatch! Welcome aboard.");
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Subscription failed.");
        },
      }
    );
  };

  const handlePaymentInitiated = (details: { orderId: string; provider: string; phone: string; amount: number }) => {
    setPendingPayment(details);
  };

  const handlePaymentPaid = () => {
    setPendingPayment(null);
    qc.invalidateQueries({ queryKey: ["premium"] });
    qc.invalidateQueries({ queryKey: ["auth", "me"] });
  };

  return (
    <main className="bg-slate-50 text-navy pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white border-b border-white/10 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-4">
            <Crown className="size-3.5" /> OFFICIAL PRESS SUBSCRIPTION
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
            Parliamentary Speeches, Insider Briefs &amp; E-Journals
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Get instant access to official National Assembly and Senate PDF publications, legislative research, and plenary archives.
          </p>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">
            FLEXIBLE ACCESS TIERS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-navy">
            Choose Your Press Subscription Plan
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.isLoading && <div className="col-span-3 text-center text-slate-500 py-8">Loading subscription tiers...</div>}
          {plans.data?.plans?.filter(p => p.code !== "instant").map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              active={isSub && ent.data?.planCode === p.code}
              onSelect={() => handlePlanSelect(p.id)}
            />
          ))}
        </div>
      </section>

      {/* PDF Library & E-Journals */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-navy bg-amber-400 px-2 py-0.5 rounded-sm inline-block mb-1">
              DIGITAL REPOSITORY
            </span>
            <h2 className="font-serif text-2xl font-black text-navy">PDF Library &amp; Press Magazines</h2>
          </div>
          <div className="flex items-center gap-2">
            {(["all", "magazine", "document"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filter === f
                    ? "bg-navy text-white shadow"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {f === "magazine" ? "Official Magazines" : f === "document" ? "Legislative Briefs" : "All Publications"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.isLoading && <div className="col-span-3 text-center text-slate-500 py-8">Loading PDF publications...</div>}
          {products.data?.products
            ?.filter((pr) => {
              if (filter === "magazine") return pr.kind === "magazine";
              if (filter === "document") return pr.kind !== "magazine";
              return true;
            })
            .map((pr) => (
              <ProductCard
                key={pr.id}
                product={pr}
                ownedViaSub={isSub}
                userPlan={userPlan}
                onPaymentInitiated={handlePaymentInitiated}
                onPaymentPaid={handlePaymentPaid}
              />
            ))}
        </div>
      </section>

      {/* EXECUTIVE DISPATCH BRANDED NEWSLETTER SECTION */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="rounded-2xl bg-gradient-to-br from-navy via-navy/95 to-navy/90 text-white p-8 sm:p-12 border border-amber-400/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-3">
                <img src={brandLogoUrl} alt="The Eagle's Eye Media" className="size-10 rounded-full ring-2 ring-amber-400 bg-white" />
                <span className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-sm">
                  THE EAGLE'S EYE EXECUTIVE DISPATCH
                </span>
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-white leading-snug">
                Verified Parliamentary Intelligence Direct To Your Inbox
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Join parliamentarians, legal analysts, and civic leaders across Cameroon. Receive daily plenary briefs, bill tracking notifications, and presidential decrees.
              </p>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
              {newsletterSubscribed ? (
                <div className="text-center py-4 space-y-2">
                  <span className="size-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="size-6" />
                  </span>
                  <h4 className="font-serif font-bold text-lg text-white">Subscription Verified</h4>
                  <p className="text-xs text-slate-300">You are registered for Executive Dispatch briefs.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="lawmaker@parliament.cm or user@domain.com"
                        className="w-full bg-navy/80 border border-white/20 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-300 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterSubscribe.isPending}
                    className="w-full py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="size-3.5" /> Join Executive Dispatch
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Zero spam. Unsubscribe anytime with one click.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <SubscribeModal
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        selectedPlanId={selectedPlanId}
        onPaymentInitiated={handlePaymentInitiated}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setPendingAction(null); }}
        onSuccess={handleAuthSuccess}
        initialMode={pendingAction === "subscribe" ? "sign-up" : "sign-in"}
      />

      <PaymentModal
        isOpen={!!pendingPayment}
        onClose={() => setPendingPayment(null)}
        provider={pendingPayment?.provider ?? ""}
        phone={pendingPayment?.phone ?? ""}
        orderId={pendingPayment?.orderId ?? ""}
        amount={pendingPayment?.amount ?? 0}
        onPaid={handlePaymentPaid}
      />
    </main>
  );
}

function PlanCard({ plan, active, onSelect }: { plan: any; active: boolean; onSelect: () => void }) {
  const hint = PLAN_HINTS[plan.code] ?? "";

  return (
    <div className={`rounded-xl border bg-white p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${active ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-200"}`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-lg font-black text-navy">{plan.name}</h3>
          {hint && (
            <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-600 text-[9px] font-black uppercase tracking-wider">
              {hint}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-4 min-h-[36px] leading-relaxed">{plan.description}</p>
        <div className="mb-4">
          <span className="text-3xl font-black text-navy">{priceFmt(plan.priceXaf)}</span>
          <span className="text-xs font-semibold text-slate-400 ml-1">
            / {plan.periodDays === 30 ? "Monthly" : "Annually"}
          </span>
        </div>
        <ul className="space-y-2 text-xs text-slate-700 mb-6 border-t border-slate-100 pt-4">
          <li className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600 shrink-0" />
            <span>Full PDF Speeches &amp; E-Paper Downloads</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600 shrink-0" />
            <span>Plenary Votes &amp; Committee Hearing Briefs</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600 shrink-0" />
            <span>Daily Executive Dispatch Newsletter</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onSelect}
        className="w-full py-3 rounded-lg bg-navy hover:bg-navy/90 text-white font-black text-xs uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-2"
      >
        <Crown className="size-4 text-amber-400" /> Select Plan →
      </button>
    </div>
  );
}

type UserPlan = "instant" | "subscriber" | "none";

function ProductCard({ product, ownedViaSub, userPlan, onPaymentInitiated, onPaymentPaid }: { product: PremiumProduct & { isOwned?: boolean }; ownedViaSub: boolean; userPlan: UserPlan; onPaymentInitiated: (details: { orderId: string; provider: string; phone: string; amount: number }) => void; onPaymentPaid: () => void }) {
  const checkout = usePremiumCheckout();
  const download = usePremiumDownload();
  const [phone, setPhone] = useState("");
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("last_momo_phone");
      if (saved) setPhone(saved);
    }
  }, []);
  const isMagazine = product.kind === "magazine";

  const owned = ownedViaSub || product.isOwned;

  function handleBuy() {
    if (!phone.trim()) {
      toast.error("Please enter a Mobile Money phone number.");
      return;
    }
    if (typeof window !== "undefined") localStorage.setItem("last_momo_phone", phone);
    checkout.mutate({ kind: "product", id: product.id, phone }, {
      onSuccess: (data) => {
        if (data?.status === "paid") {
          toast.success(`Payment successful! Access granted to "${product.title}".`);
          onPaymentPaid();
        } else if (data?.status === "pending" && data?.orderId) {
          onPaymentInitiated({ orderId: data.orderId, provider: data.provider ?? "mesomb", phone, amount: product.priceXaf });
        }
      },
    });
  }

  async function handleDownload() {
    const r = await download.mutateAsync(product.id);
    if (r?.url) window.open(r.url, "_blank");
  }


  function handleNativeShare() {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/premium#doc-${product.id}` : `/premium#doc-${product.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: product.title,
        text: product.summary || `Read ${product.title} on The Eagle's Eye Media`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      setShowShare((s) => !s);
    }
  }

  const getMediaUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    const apiBase = import.meta.env.VITE_API_URL ?? "/api/v1";
    const origin = apiBase.replace("/api/v1", "");
    return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <article id={`doc-${product.id}`} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow relative">
      {owned ? (
        <div className="aspect-[3/4] bg-slate-50 relative border-b border-slate-100 flex items-center justify-center">
          {product.coverUrl ? (
            <img src={getMediaUrl(product.coverUrl)} alt="" className="w-full h-full object-contain" />
          ) : (
            <FileText className="size-16 text-slate-400" />
          )}
          <span className="absolute top-2 left-2 rounded bg-navy/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white z-10 shadow-sm">
            {isMagazine ? "Official Magazine" : product.kind.replace("_", " ")}
          </span>
          <button
            onClick={handleNativeShare}
            className="absolute top-2 right-2 rounded-full bg-slate-900/80 hover:bg-navy text-amber-400 p-1.5 shadow-md z-10 transition-all hover:scale-110 border border-amber-400/30"
            title="Share Document"
          >
            <Share2 className="size-3.5" />
          </button>
          <span className="absolute bottom-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white z-10 shadow-sm">
            Unlocked Access
          </span>
        </div>
      ) : (
        <Link to="/premium-preview/$id" params={{ id: product.id }} className="block group border-b border-slate-100">
          <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden flex items-center justify-center">
            {product.coverUrl ? (
              <img src={getMediaUrl(product.coverUrl)} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <FileText className="size-16 text-slate-400" />
            )}
            <span className="absolute top-2 left-2 rounded bg-navy/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white z-10 shadow-sm">
              {isMagazine ? "Official Magazine" : product.kind.replace("_", " ")}
            </span>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-amber-400 text-navy text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                <Eye className="size-3.5" /> Open Preview
              </div>
            </div>
          </div>
        </Link>
      )}
      
      <div className="p-4 flex flex-col flex-1">
        {owned ? (
          <h3 className="font-serif text-base font-bold leading-snug text-navy">{product.title}</h3>
        ) : (
          <Link to="/premium-preview/$id" params={{ id: product.id }} className="hover:text-amber-500 transition-colors block">
            <h3 className="font-serif text-base font-bold leading-snug text-navy hover:text-amber-600 transition-colors">{product.title}</h3>
          </Link>
        )}
        
        {product.summary && <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.summary}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-black text-xl text-navy">{priceFmt(product.priceXaf)}</span>
          <button
            onClick={() => setShowShare((s) => !s)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-navy transition-colors bg-slate-100 px-2 py-1 rounded"
          >
            <Share2 className="size-3.5 text-amber-600" /> Share
          </button>
        </div>

        {/* Expandable Share Buttons */}
        {showShare && (
          <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg">
            <ShareButtons url={`/premium#doc-${product.id}`} title={product.title} />
          </div>
        )}

        <div className="mt-auto pt-4 space-y-2">
          {owned ? (
            <button
              onClick={handleDownload}
              disabled={download.isPending}
              className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 font-bold text-white text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {download.isPending ? "Downloading..." : isMagazine ? "Download Full Magazine" : "Download PDF Document"}
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone for MoMo (e.g. 670000000)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-navy"
              />
              <button
                onClick={handleBuy}
                disabled={!phone.trim() || checkout.isPending}
                className="w-full rounded-xl bg-navy px-3 py-2.5 font-black text-white text-xs hover:bg-navy/90 disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                {checkout.isPending ? "Initiating Order..." : `Buy Publication — ${priceFmt(product.priceXaf)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
