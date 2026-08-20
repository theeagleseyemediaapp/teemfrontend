import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { setStoredUser, setToken } from "../lib/auth-session";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL ??
  "https://the-eagles-eye-backend-api.onrender.com/api/v1";

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

/**
 * OAuth Callback Route — /auth/callback
 *
 * Supabase redirects here after Google (and other OAuth) sign-ins.
 * The access_token and user info arrive in the URL hash fragment.
 * We parse them, store the session, then ensure a profile row exists
 * by calling /auth/me (which triggers profile upsert on the backend).
 */
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase puts session data in the URL hash after OAuth redirect
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const params = new URLSearchParams(hash.replace(/^#/, ""));

        const accessToken = params.get("access_token");
        const errorDescription = params.get("error_description");

        if (errorDescription) {
          setErrorMsg(decodeURIComponent(errorDescription));
          setStatus("error");
          return;
        }

        if (!accessToken) {
          setErrorMsg("No access token returned from OAuth provider.");
          setStatus("error");
          return;
        }

        // Store the token so subsequent API calls are authenticated
        const expiresIn = parseInt(params.get("expires_in") ?? "604800", 10);
        setToken(accessToken, Math.floor(expiresIn / 60));

        // Fetch the user profile — this also triggers profile creation on backend
        const meResp = await fetch(apiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const meData = await meResp.json().catch(() => ({}));

        if (meData?.user) {
          setStoredUser({
            id: meData.user.id,
            email: meData.user.email,
            displayName: meData.user.displayName ?? meData.user.email?.split("@")[0] ?? "User",
            role: meData.user.role ?? "reader",
          });
        }

        // Redirect to home (or wherever the user was going)
        const next = params.get("next") ?? "/";
        router.navigate({ to: next });
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Authentication failed.");
        setStatus("error");
      }
    }

    handleCallback();
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-serif font-bold text-navy">Sign-in Failed</h1>
          <p className="text-sm text-muted-foreground">{errorMsg || "Something went wrong during Google sign-in."}</p>
          <a
            href="/sign-in"
            className="inline-block mt-4 bg-navy text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="size-10 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
}
