import { useEffect, useRef, useState } from "react";
import { X, Crown, ArrowRight, FileText } from "lucide-react";
import { useSettings } from "@/lib/api";

export function WelcomeToast() {
  const hasPlayed = useRef(false);
  const [visible, setVisible] = useState(false);
  const [showSubscriptionPromo, setShowSubscriptionPromo] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const settings = useSettings();

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    // We trigger the subscription promo popup after 5 seconds for new sessions
    const t = setTimeout(() => {
      // Check session storage to see if they've dismissed this promo in the current session
      const hasDismissedPromo = sessionStorage.getItem("eem.dismissed-promo.v1");
      if (!hasDismissedPromo) {
        setShowSubscriptionPromo(true);
        setVisible(true);
      }
    }, 5000);

    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("eem.dismissed-promo.v1", "true");
    } catch { /* ignore */ }
  };

  const handleProceedToSubscribe = () => {
    handleDismiss();
    // Dispatch custom event to trigger Subscribe Modal or go to premium page
    if (typeof window !== "undefined") {
      window.location.hash = "#subscribe"; // Navigation helper or modal launcher
      const event = new CustomEvent("open-subscription-checkout");
      window.dispatchEvent(event);
    }
  };

  // If notices noticeEnabled is turned off globally by admin settings, we don't pop up the promo
  const promoEnabled = settings.data?.noticeEnabled !== false;

  if (!visible || dismissed || !promoEnabled) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[60] w-[310px] max-w-[calc(100vw-32px)]">
      <div 
        className="rounded-2xl border border-amber-400/20 bg-navy text-white shadow-2xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        {/* Decorative elements conforming to website brand */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-400 text-navy rounded-lg">
              <Crown className="size-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Journal PDF Offer
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="font-serif font-black text-sm text-white leading-snug">
              Get the Digital Journal PDF
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Subscribe to the Executive Edition to download the full triweekly parliamentary news journal in high-fidelity PDF.
            </p>
          </div>

          <div className="pt-1 flex gap-2">
            <button
              onClick={handleProceedToSubscribe}
              className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-md"
            >
              Subscribe <ArrowRight className="size-3" />
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase transition-colors border border-white/10"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
