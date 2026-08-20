import { createFileRoute, Link } from "@tanstack/react-router";
import { usePublicEmployee } from "@/lib/api";
import { 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  Building2, 
  ArrowLeft, 
  Loader2,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { brandLogoUrl } from "@/lib/branding";

export const Route = createFileRoute("/verify-employee/$id")({
  head: () => ({
    meta: [
      { title: "Press Credential & Staff Verification — The Eagle's Eye Media" },
      { name: "description", content: "Official live press credential and employee identification verification system for journalists, correspondents, and staff of The Eagle's Eye Media LLC." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Press Credential Verification — The Eagle's Eye Media" },
      { property: "og:description", content: "Official tamper-proof press badge and journalist verification portal." },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
  }),
  component: VerifyEmployeePage,
});

function VerifyEmployeePage() {
  const { id } = Route.useParams() as { id: string };
  const { data: employee, isLoading, error } = usePublicEmployee(id);
  const [liveTime, setLiveTime] = useState("");

  // Sync a ticking clock to prove page is live and prevent fake screenshots
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <Loader2 className="size-10 text-amber-500 animate-spin mb-4" />
        <h2 className="font-serif font-black text-xl tracking-wider uppercase">Verifying Pass...</h2>
        <p className="text-xs text-slate-400 mt-2">Checking official parliamentary media registry...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-rose-500 uppercase tracking-wide">Invalid Pass</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto mt-3">
          This verification link is invalid, does not exist, or has been revoked by the system administrator.
        </p>
        <Link to="/" className="mt-8 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider">
          <ArrowLeft className="size-3.5" /> Return to Homepage
        </Link>
      </div>
    );
  }

  const { full_name: fullName, email, age, photo_url: photoUrl, role, department, expires_at: expiresAt, isValid } = employee;
  const expiryDate = new Date(expiresAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy to-slate-950 flex flex-col justify-between py-10 px-4 text-white">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center pb-6">
        <img src={brandLogoUrl} alt="The Eagle's Eye Media" className="size-14 rounded-full border border-white/20 shadow-md" />
        <h1 className="font-serif font-black text-xl mt-3 tracking-wide text-white uppercase leading-none">THE EAGLE'S EYE</h1>
        <p className="text-[10px] text-amber-400 uppercase tracking-widest font-extrabold mt-1">Parliamentary Media Center</p>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-sm w-full mx-auto bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow behind badge */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${isValid ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />

        {/* Live Status Badge */}
        <div className="flex justify-center pb-6">
          {isValid ? (
            <div className="inline-flex flex-col items-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-3 w-full text-center">
              <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce mb-1">
                <ShieldCheck className="size-6" />
              </div>
              <span className="text-sm font-black text-emerald-400 uppercase tracking-wider">Verified Active Pass</span>
              <span className="text-[10px] text-emerald-500/80 font-bold uppercase mt-0.5">Authorised Press Personnel</span>
            </div>
          ) : (
            <div className="inline-flex flex-col items-center bg-rose-500/10 border border-rose-500/30 rounded-xl px-6 py-3 w-full text-center">
              <div className="size-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 mb-1">
                <ShieldAlert className="size-6" />
              </div>
              <span className="text-sm font-black text-rose-400 uppercase tracking-wider">Pass Expired</span>
              <span className="text-[10px] text-rose-500/80 font-bold uppercase mt-0.5">Access Denied / Revoked</span>
            </div>
          )}
        </div>

        {/* User Card info */}
        <div className="flex flex-col items-center border-b border-white/10 pb-5">
          <img
            src={photoUrl || "/profile-circle-svgrepo-com.svg"}
            alt={fullName}
            className="size-28 rounded-full object-cover border-4 border-white/10 shadow-lg"
          />
          <h2 className="font-serif font-black text-xl mt-4 leading-tight">{fullName}</h2>
          <div className="text-xs text-amber-400 font-bold mt-1 uppercase tracking-wider">{role || "Staff"}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{department || "Operations"}</div>
        </div>

        {/* Additional metadata */}
        <div className="py-5 space-y-3.5 text-sm">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <User className="size-3.5" /> Age
            </span>
            <span className="font-bold text-white">{age}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Mail className="size-3.5" /> Email
            </span>
            <span className="font-bold text-white max-w-[200px] truncate">{email}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar className="size-3.5" /> Valid Until
            </span>
            <span className={`font-bold ${isValid ? "text-emerald-400" : "text-rose-400"}`}>
              {expiryDate.getFullYear() > 2090
                ? "PERMANENT STAFF (NO EXPIRATION)"
                : expiryDate.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>
        </div>

        {/* Live Watermark / Clock */}
        <div className="bg-slate-950/50 border border-white/5 rounded-lg p-3 text-center text-[10px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Clock className="size-3 text-emerald-400 animate-spin-slow" />
            <span>LIVE DATABASE TIME:</span>
          </div>
          <div className="font-extrabold text-white text-xs">{liveTime}</div>
          <div className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Secure digital badge check</div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 pt-6">
        <p className="font-serif italic">"Official press credential issued by The Eagle's Eye Media LLC."</p>
        <p className="text-[10px] mt-1">Yaoundé, Cameroon • support@theeagleseyemedia.com</p>
      </div>
    </div>
  );
}
