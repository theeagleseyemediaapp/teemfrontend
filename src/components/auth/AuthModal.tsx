import { useState } from "react";
import { SignInForm, SignUpForm } from "./SignInForm";
import { X } from "lucide-react";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: { user?: { role?: string } }) => void;
  initialMode?: "sign-in" | "sign-up";
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "sign-in" }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b">
          <h3 className="font-serif font-bold text-navy text-sm">
            {initialMode === "sign-up" ? "Create Account" : "Sign In"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-navy"><X className="size-4" /></button>
        </div>
        <div className="p-4">
          <AuthFormWrapper initialMode={initialMode} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}

function AuthFormWrapper({ initialMode, onSuccess }: { initialMode: "sign-in" | "sign-up"; onSuccess?: (data?: { user?: { role?: string } }) => void }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);

  return (
    <div className="space-y-4">
      {mode === "sign-up" ? (
        <div className="space-y-4">
          <SignUpForm onSwitch={() => setMode("sign-in")} onSuccess={onSuccess} />
        </div>
      ) : (
        <div className="space-y-4">
          <SignInForm onSuccess={onSuccess} />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>
          <GoogleSignInButton redirectTo={typeof window !== "undefined" ? window.location.origin : undefined} />
          <p className="text-center text-xs text-muted-foreground mt-4">
            New here?{" "}
            <button type="button" onClick={() => setMode("sign-up")} className="text-navy font-semibold hover:underline">
              Create an account
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
