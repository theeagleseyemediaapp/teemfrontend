import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

export function AppToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("app_toast_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2500); // Premium delay entrance
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    sessionStorage.setItem("app_toast_dismissed", "true");
  };

  if (!visible) return null;

  return (
    <Link
      to="/app"
      className="fixed top-[140px] left-4 z-[45] flex items-center transition-transform hover:scale-[1.03] active:scale-[0.98] drop-shadow-2xl animate-in fade-in slide-in-from-left-5"
      aria-label="Get it on Google Play"
    >
      <img
        src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
        alt="Get it on Google Play"
        width="160"
        height="60"
        className="h-[52px] w-auto"
      />
      <button
        onClick={handleDismiss}
        className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-800 text-white shadow-md border border-white/20 hover:bg-slate-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>
    </Link>
  );
}
