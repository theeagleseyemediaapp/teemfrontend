import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { SignInForm } from "../components/auth/SignInForm";
import { getStoredUser } from "../lib/auth-session";
import { brandLogoUrl } from "@/lib/branding";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-portal/$slug")({
  head: () => ({
    meta: [
      { title: "Admin Portal Security Gateway" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ params }) => {
    const expectedSlug = import.meta.env.VITE_ADMIN_LOGIN_SLUG;
    if (!expectedSlug || params.slug !== expectedSlug) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminPortal,
});

function AdminPortal() {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user && (user.role === "admin" || user.role === "editor" || user.role === "super_admin")) {
      setIsRedirecting(true);
      toast.success("Already authenticated as administrator. Redirecting...");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 800);
    }
  }, []);

  const handleAuthSuccess = (data?: { user?: { role?: string } }) => {
    const role = data?.user?.role;
    if (role === "admin" || role === "editor" || role === "super_admin") {
      toast.success("Welcome back, Administrator!");
      setIsRedirecting(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 800);
    } else {
      toast.error("Unauthorized. Admin access required.");
    }
  };

  if (isRedirecting) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 flex flex-col items-center justify-center space-y-4">
        <ShieldCheck className="size-16 text-emerald-500 animate-bounce" />
        <h2 className="font-serif font-black text-2xl text-navy">Securing Session...</h2>
        <p className="text-sm text-muted-foreground">Redirecting you to the Control Panel.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 bg-navy overflow-hidden">
      {/* Background Image with Dark Wash */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter blur-[1px] scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200')` }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <img src={brandLogoUrl} alt="The Eagle's Eye" className="size-16 rounded-full ring-4 ring-gold/60 bg-white p-0.5 shadow-xl" width={64} height={64} />
          </Link>
          <h1 className="font-serif font-black text-3xl text-white tracking-tight">Admin Gateway</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-gold font-bold">
            Restricted Security Portal
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-navy/85 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold via-navy to-gold" />
          <div className="mb-6 flex items-center gap-3 rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-amber-500 text-xs">
            <ShieldAlert className="size-5 shrink-0" />
            <span>Access logs are monitored. Unauthorized access attempts will be blocked and recorded.</span>
          </div>
          <SignInForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
}
