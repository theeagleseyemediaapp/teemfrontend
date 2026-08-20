import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, KeyRound } from "lucide-react";
import { useRequestPasswordReset, useVerifyResetCode, useConfirmResetPassword } from "../../lib/api";

type Step = "request" | "verify" | "confirm";

export function ResetPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const requestReset = useRequestPasswordReset();
  const verifyCode = useVerifyResetCode();
  const confirmReset = useConfirmResetPassword();

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    requestReset.mutate(email, {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInfo("A 4-digit code has been sent to your email.");
          setStep("verify");
        }
      },
      onError: (err: unknown) => {
        setError(err instanceof Error ? err.message : "Request failed");
      },
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    verifyCode.mutate(
      { email, code },
      {
        onSuccess: (data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setInfo("Code verified. Set your new password.");
            setStep("confirm");
          }
        },
        onError: (err: unknown) => {
          setError(err instanceof Error ? err.message : "Verification failed");
        },
      },
    );
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    confirmReset.mutate(
      { email, code, password },
      {
        onSuccess: (data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setInfo("Password reset successful. You can now sign in.");
            setTimeout(() => {
              window.location.href = "/sign-in";
            }, 1500);
          }
        },
        onError: (err: unknown) => {
          setError(err instanceof Error ? err.message : "Reset failed");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-serif font-black text-3xl text-navy">
          {step === "request" && "Reset password"}
          {step === "verify" && "Enter 4-digit code"}
          {step === "confirm" && "New password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "request" && "Enter your email and we will send you a 4-digit code."}
          {step === "verify" && `Code sent to ${email}`}
          {step === "confirm" && "Choose a strong password."}
        </p>
      </div>

      <form onSubmit={step === "request" ? handleRequest : step === "verify" ? handleVerify : handleConfirm} className="space-y-4 rounded border border-border bg-card p-6">
        {step === "request" && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded border border-border bg-background px-3">
              <Mail className="size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
          </label>
        )}

        {step === "verify" && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">4-digit code</span>
            <div className="mt-1 flex items-center gap-2 rounded border border-border bg-background px-3">
              <KeyRound className="size-4 text-muted-foreground" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                required
                className="flex-1 bg-transparent py-2.5 text-sm outline-none tracking-widest"
              />
            </div>
          </label>
        )}

        {step === "confirm" && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New password</span>
            <div className="mt-1 flex items-center gap-2 rounded border border-border bg-background px-3">
              <KeyRound className="size-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
          </label>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
        {info && <p className="text-xs text-green-600">{info}</p>}

        <button
          type="submit"
          disabled={requestReset.isPending || verifyCode.isPending || confirmReset.isPending}
          className="w-full bg-navy text-white font-bold uppercase tracking-wider text-sm py-3 rounded hover:bg-navy/90 disabled:opacity-60"
        >
          {step === "request" && (requestReset.isPending ? "Sending..." : "Send code")}
          {step === "verify" && (verifyCode.isPending ? "Verifying..." : "Verify code")}
          {step === "confirm" && (confirmReset.isPending ? "Updating..." : "Update password")}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Remember your password?{" "}
        <Link to="/sign-in" className="text-navy font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
