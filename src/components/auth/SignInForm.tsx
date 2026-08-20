import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useSignInPassword, useSignUp } from "../../lib/api";
import { toast } from "sonner";

export function SignInForm({ onSuccess }: { onSuccess?: (data?: { user?: { role?: string } }) => void } = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useSignInPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signIn.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.error) {
            setError(data.error);
            toast.error(data.error);
            return;
          }
          toast.success("Welcome back!");
          onSuccess?.(data);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Sign-in failed";
          setError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
        <div className="mt-1 flex items-center gap-2 rounded border border-border bg-white px-3">
          <Mail className="size-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
        <div className="mt-1 flex items-center gap-2 rounded border border-border bg-white px-3">
          <Lock className="size-4 text-slate-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={signIn.isPending}
        className="w-full bg-gold hover:bg-gold/90 text-navy font-bold uppercase tracking-wider text-sm py-3 rounded transition-colors disabled:opacity-60"
      >
        {signIn.isPending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-slate-300">
        <Link to="/reset-password" className="text-gold font-bold hover:underline">Forgot password?</Link>
      </p>
    </form>
  );
}

export function SignInFormWithTabs({ onSuccess }: { onSuccess?: (data?: { user?: { role?: string } }) => void } = {}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  if (mode === "signup") {
    return (
      <div className="space-y-4">
        <SignUpForm onSuccess={onSuccess} onSwitch={() => setMode("signin")} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SignInForm onSuccess={onSuccess} />
      <p className="text-center text-xs text-slate-300">
        New here?{" "}
        <button type="button" onClick={() => setMode("signup")} className="text-gold font-bold hover:underline">
          Create an account
        </button>
      </p>
    </div>
  );
}

export function SignUpForm({ onSwitch, onSuccess }: { onSwitch?: () => void; onSuccess?: (data?: { user?: { role?: string } }) => void } = {}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signUp = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signUp.mutate(
      { email, password, displayName },
      {
        onSuccess: () => {
          toast.success("Account created! Please sign in.");
          onSuccess?.();
          onSwitch?.();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Account creation failed";
          setError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display name</span>
        <div className="mt-1 flex items-center gap-2 rounded border border-border bg-white px-3">
          <User className="size-4 text-slate-500" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            required
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
        <div className="mt-1 flex items-center gap-2 rounded border border-border bg-white px-3">
          <Mail className="size-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
        <div className="mt-1 flex items-center gap-2 rounded border border-border bg-white px-3">
          <Lock className="size-4 text-slate-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={signUp.isPending}
        className="w-full bg-gold hover:bg-gold/90 text-navy font-bold uppercase tracking-wider text-sm py-3 rounded transition-colors disabled:opacity-60"
      >
        {signUp.isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
