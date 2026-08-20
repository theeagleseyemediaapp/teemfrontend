import { useState, useEffect } from "react";
import { X, Crown, Check, ShieldCheck, CreditCard, Smartphone } from "lucide-react";
import { usePremiumPlans, usePremiumCheckout } from "@/lib/api";
import { toast } from "sonner";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string | null;
  onPaymentInitiated?: (details: { orderId: string; provider: string; phone: string; amount: number }) => void;
}

function priceFmt(xaf: number) {
  return new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(xaf);
}

export function SubscribeModal({ isOpen, onClose, selectedPlanId, onPaymentInitiated }: SubscribeModalProps) {
  const plans = usePremiumPlans();
  const checkout = usePremiumCheckout();
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [provider, setProvider] = useState<"momo" | "orange">("momo");
  const [phone, setPhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_momo_phone") ?? "";
    }
    return "";
  });

  useEffect(() => {
    if (selectedPlanId) {
      setActivePlanId(selectedPlanId);
    } else if (plans.data?.plans && plans.data.plans.length > 0) {
      const firstPaid = plans.data.plans.find((p) => p.code !== "instant") || plans.data.plans[0];
      if (firstPaid) setActivePlanId(firstPaid.id);
    }
  }, [selectedPlanId, plans.data]);

  if (!isOpen) return null;

  const currentPlan = plans.data?.plans?.find((p) => p.id === activePlanId);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanId || !currentPlan) {
      toast.error("Please select a subscription plan.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your Mobile Money phone number.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("last_momo_phone", phone);
    }

    checkout.mutate(
      { kind: "plan", id: activePlanId, phone },
      {
        onSuccess: (data) => {
          onClose();
          if (data?.status === "paid") {
            toast.success("Payment successful! Your premium subscription is now active.");
          } else if (data?.status === "pending" && data?.orderId) {
            onPaymentInitiated?.({
              orderId: data.orderId,
              provider: provider === "orange" ? "orange" : "mtn",
              phone,
              amount: currentPlan.priceXaf,
            });
          }
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Checkout failed. Please check your network connection.");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-navy text-white rounded-xl shadow-2xl max-w-lg w-full border border-amber-400/20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-navy">
          <div className="flex items-center gap-2.5">
            <Crown className="size-5 text-amber-400" />
            <h3 className="font-serif font-black text-lg text-white">Executive Subscription Checkout</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="p-6 space-y-5">
          {/* Plan Selector */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">
              Select Subscription Plan
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.isLoading && <p className="text-xs text-white/50 col-span-2 py-4 text-center">Loading available plans...</p>}
              {plans.data?.plans?.filter(p => p.code !== "instant").map((p) => {
                const isSelected = p.id === activePlanId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlanId(p.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all relative ${
                      isSelected
                        ? "bg-white/10 border-amber-400 shadow-md ring-1 ring-amber-400"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm text-white">{p.name}</span>
                      {isSelected && <Check className="size-4 text-amber-400" />}
                    </div>
                    <div className="text-base font-black text-amber-400">{priceFmt(p.priceXaf)}</div>
                    <div className="text-[10px] text-white/60 mt-0.5">
                      {p.periodDays === 30 ? "Billed Monthly" : "Billed Annually"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">
              Payment Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider("momo")}
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  provider === "momo"
                    ? "bg-amber-400 text-slate-950 border-amber-400 shadow"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <Smartphone className="size-4" /> MTN Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setProvider("orange")}
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  provider === "orange"
                    ? "bg-orange-500 text-white border-orange-500 shadow"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <Smartphone className="size-4" /> Orange Money
              </button>
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1.5">
              Mobile Money Account Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 670000000 or 237670000000"
              className="w-full rounded-lg border border-white/20 bg-navy/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-white/50 mt-1">
              You will receive an instant USSD authorization prompt on your phone.
            </p>
          </div>

          {/* Summary Footer & Action */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase text-white/50 block font-bold">Total Amount Due</span>
              <span className="text-xl font-black text-amber-400">
                {currentPlan ? priceFmt(currentPlan.priceXaf) : "—"}
              </span>
            </div>
            <button
              type="submit"
              disabled={checkout.isPending || !phone.trim()}
              className="px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {checkout.isPending ? "Initiating Checkout..." : "Proceed to Payment →"}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-1">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>256-Bit Encrypted Secure Parliamentary Press Gateway</span>
          </div>
        </form>
      </div>
    </div>
  );
}
