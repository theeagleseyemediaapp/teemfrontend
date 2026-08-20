import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { SignInFormWithTabs } from "../components/auth/SignInForm";
import { brandLogoUrl } from "@/lib/branding";

import { clearSession } from "../lib/auth-session";
import { toast } from "sonner";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign In — The Eagle's Eye Media" },
      { name: "description", content: "Sign in to comment, save stories and manage your subscription." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: SignIn,
});

function SignIn() {
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectTo(window.location.origin);
    }
  }, []);

  const handleAuthSuccess = (data?: { user?: { role?: string } }) => {
    const role = data?.user?.role;
    if (role === "admin" || role === "editor" || role === "super_admin") {
      clearSession();
      toast.error("Administrators must sign in through the secure portal.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 bg-navy overflow-hidden">
      {/* Background Image of Parliament with Dark Wash */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter blur-[1px] scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200')` }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <img src={brandLogoUrl} alt="The Eagle's Eye Media" className="size-16 rounded-full ring-4 ring-gold/60 bg-white p-0.5 shadow-xl" width={64} height={64} />
          </Link>
          <h1 className="font-serif font-black text-3xl text-white tracking-tight">Welcome Back</h1>
          <p className="mt-1.5 text-xs text-slate-300">
            Sign in to comment, save stories, and get the daily briefing.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-navy/85 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold via-white/10 to-gold" />
          <SignInFormWithTabs onSuccess={handleAuthSuccess} />
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-navy px-2 text-slate-400">Or continue with</span>
            </div>
          </div>
          <GoogleSignInButton redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
