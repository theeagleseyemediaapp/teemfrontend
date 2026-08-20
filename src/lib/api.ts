import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authHeaders, getStoredUser, setStoredUser, setToken, clearSession } from "./auth-session";
import { supabase } from "./supabase";

// Primary: custom domain. Fallback: Render service URL.
// Both point to the same backend — failover happens automatically if primary is unreachable.
const PRIMARY_API   = import.meta.env.VITE_API_URL   ?? "https://the-eagles-eye-backend-api.onrender.com/api/v1";
const FALLBACK_API  = import.meta.env.VITE_API_URL_2 ?? "https://api.theeagleseyemedia.com/api/v1";

function apiUrl(base: string, path: string) {
  return `${base}${path}`;
}

/** Shorthand: build a URL against the primary API base. Used by raw fetch() calls in queries. */
function api(path: string) {
  return apiUrl(PRIMARY_API, path);
}


/**
 * Fetch with automatic failover.
 * 1. Tries PRIMARY_API first.
 * 2. If the request throws (network error / timeout) it retries against FALLBACK_API.
 * 3. Application-level errors (4xx/5xx) are NOT retried — only true connectivity failures.
 */
export async function fetchJson(path: string, init?: RequestInit): Promise<any> {
  const headers = { ...authHeaders(), ...(init?.headers ?? {}) };

  const attempt = async (base: string) => {
    const r = await fetch(apiUrl(base, path), { ...init, headers });
    if (!r.ok) {
      if (r.status === 401 && typeof window !== "undefined") {
        console.warn("[API] 401 Unauthorized detected. Clearing session and redirecting to sign-in.");
        clearSession();
        // Redirect if not already on an auth/portal page
        if (!window.location.pathname.startsWith("/sign-in") && !window.location.pathname.startsWith("/admin-portal")) {
          window.location.href = "/sign-in";
        }
      }
      const err = await r.json().catch(() => ({ error: r.statusText }));
      throw new Error(err.error || r.statusText);
    }
    return r.json();
  };

  try {
    return await attempt(PRIMARY_API);
  } catch (err: any) {
    // Only fall over on network failures, not on API-level errors (4xx/5xx)
    const isNetworkError = err instanceof TypeError || err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError");
    if (!isNetworkError) throw err;
    console.warn("[API] Primary unreachable, switching to fallback:", FALLBACK_API);
    return attempt(FALLBACK_API);
  }
}

// Health & Meta
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => fetch(api("/health")).then((r) => r.text()),
  });
}

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: () => fetch(api("/meta")).then((r) => r.json()),
  });
}

// Articles
export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: () => fetchJson("/articles"),
  });
}

export function useArticlesByCategory(categorySlug: string) {
  const all = useArticles();
  const items = (all.data ?? []).filter(
    (a: { categorySlug?: string }) => a.categorySlug === categorySlug || a.categorySlug?.includes(categorySlug),
  );
  return { ...all, data: items };
}

export function useCreateArticle() {
  return useMutation({
    mutationFn: ({ data, userId }: { data: Record<string, unknown>; userId: string }) =>
      fetchJson(`/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, userId }: { id: string; data: Record<string, unknown>; userId: string }) =>
      fetchJson(`/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["article", vars.data.slug ?? vars.id] });
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
  });
}

export const articleQueryOptions = (slug: string) => ({
  queryKey: ["article", slug],
  queryFn: () => fetchJson(`/articles/${slug}`),
  staleTime: 30000,
});

export function useArticle(slug: string) {
  return useQuery({
    ...articleQueryOptions(slug),
    enabled: !!slug,
  });
}

export function usePublishedHeadlines() {
  return useQuery({
    queryKey: ["headlines"],
    queryFn: () => fetchJson("/headlines"),
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchJson("/categories"),
  });
}

// Alerts
export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => fetchJson("/alerts"),
  });
}

export function useActiveAlert() {
  return useQuery({
    queryKey: ["alert", "active"],
    queryFn: () => fetchJson("/alerts/active"),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Comments
export function useComments(articleId: string) {
  return useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => fetchJson(`/articles/${articleId}/comments`),
    enabled: !!articleId,
  });
}

export function useCommentReplies(commentId: string) {
  return useQuery({
    queryKey: ["comments", "replies", commentId],
    queryFn: () => fetchJson(`/comments/${commentId}/replies`),
    enabled: !!commentId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, authorId, body }: { articleId: string; authorId: string; body: string }) =>
      fetchJson(`/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, body }),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.articleId] });
    },
  });
}

export function useAddReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, authorId, body, articleId }: { commentId: string; authorId: string; body: string; articleId: string }) =>
      fetchJson(`/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, body }),
      }).then((data) => ({ ...data, articleId })),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.articleId] });
      qc.invalidateQueries({ queryKey: ["comments", "replies", vars.commentId] });
    },
  });
}

export function useAdminComments() {
  return useQuery({
    queryKey: ["admin", "comments"],
    queryFn: () => fetchJson("/comments"),
  });
}

export function useModerateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, userId }: { id: string; status: "approved" | "rejected" | "pending"; userId: string }) =>
      fetchJson(`/comments/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "comments"] }),
  });
}

// Likes
export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, profileId }: { articleId: string; profileId: string }) =>
      fetchJson(`/articles/${articleId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

// Search
export type SearchResult = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  alert: boolean;
  featured: boolean;
  likeCount: number;
  commentCount: number;
};

export type SearchSuggestion = {
  label: string;
  slug: string;
  summary: string;
};

export function useSearchSuggestions(query: string) {
  return useQuery<SearchSuggestion[]>({
    queryKey: ["search", "suggestions", query],
    queryFn: () => fetchJson(`/search/suggestions?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
  });
}

// AI
export function useAiSearch() {
  return useMutation({
    mutationFn: (query: string) =>
      fetchJson("/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }),
  });
}

export function useAiExplain(slug: string) {
  return useQuery({
    queryKey: ["ai-explain", slug],
    queryFn: () => fetchJson(`/articles/${slug}/ai-explain`),
    enabled: !!slug,
  });
}

export function useAiSupport() {
  return useMutation({
    mutationFn: (question: string) =>
      fetchJson("/ai/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }),
  });
}

export function useAiRefine() {
  return useMutation({
    mutationFn: (data: { text: string; field: string }) =>
      fetchJson("/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

// Newsletter
export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: (data: { email: string; name: string }) =>
      fetchJson("/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

// Settings
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJson("/settings"),
  });
}

// Banners (public — active banners for the rotator with localStorage fallback)
export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      try {
        const data = await fetchJson("/banners");
        // Always update the cache with the latest data from a successful API call,
        // even if the array is empty — this ensures deleted banners are cleared.
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("cached_ad_banners_v1", JSON.stringify(data ?? []));
          } catch {
            /* quota error — ignore */
          }
        }
        return Array.isArray(data) ? data : [];
      } catch (err) {
        // Only fall back to stale cache on genuine network/connectivity failures
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("cached_ad_banners_v1");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) return parsed;
            } catch {
              /* ignore parse error */
            }
          }
        }
        return [];
      }
    },
    staleTime: 60_000,
  });
}

// Banners (admin — all banners including inactive)
export function useAdminBanners() {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => fetchJson("/admin/banners"),
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson("/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banners"] });
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchJson(`/admin/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banners"] });
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/admin/banners/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banners"] });
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });
}


export function useSignUp() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; displayName?: string }) =>
      fetchJson("/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (data.user) setStoredUser(data.user);
    },
  });
}

export function useSignInPassword() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetchJson("/auth/sign-in/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      if (data.user) {
        setStoredUser(data.user);
        if (data.token) setToken(data.token);
      }
    },
  });
}

export function useSignInMagicLink() {
  return useMutation({
    mutationFn: (data: { email: string; redirectTo?: string }) =>
      fetchJson("/auth/sign-in/otp/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useSignInGoogle() {
  return useMutation({
    mutationFn: (redirectTo?: string) =>
      fetchJson("/auth/sign-in/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectTo }),
      }),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => fetchJson("/auth/sign-out", { method: "POST" }),
    onSuccess: () => {
      clearSession();
    },
  });
}

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me", getStoredUser()?.id],
    queryFn: () => fetchJson("/auth/me"),
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => fetchJson("/profiles"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, userId }: { data: Record<string, unknown>; userId: string }) =>
      fetchJson("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => fetchJson("/admin/metrics"),
  });
}

export function useAdminArticles() {
  return useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () => fetchJson("/admin/articles"),
  });
}

export function useAdminArticleMetrics() {
  return useQuery({
    queryKey: ["admin", "articles", "metrics"],
    queryFn: () => fetchJson("/admin/articles/metrics"),
  });
}

export function useAdminAlerts() {
  return useQuery({
    queryKey: ["admin", "alerts"],
    queryFn: () => fetchJson("/admin/navigation"),
  });
}

export function useAdminMedia() {
  return useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => fetchJson("/media"),
  });
}

export function useAdminSeoDefault() {
  return useQuery({
    queryKey: ["admin", "seo", "default"],
    queryFn: () => fetchJson("/admin/seo/default"),
  });
}

export function useAdminEmailLogs() {
  return useQuery({
    queryKey: ["admin", "email-logs"],
    queryFn: () => fetchJson("/admin/email-logs"),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => fetchJson("/admin/dashboard"),
  });
}

export function useAdminFinancialMetrics() {
  return useQuery({
    queryKey: ["admin", "dashboard", "financial"],
    queryFn: () => fetchJson("/admin/dashboard/financial"),
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => fetchJson("/admin/audit-logs"),
  });
}

export function useAdminSupportMessages() {
  return useQuery({
    queryKey: ["admin", "support-messages"],
    queryFn: () => fetchJson("/admin/support/messages").then((r: any) => r.messages || r),
  });
}

export function useSubmitSupportMessage() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject: string; message: string }) =>
      fetchJson("/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => fetchJson("/admin/roles"),
  });
}

export function useAdminPermissions(role: string) {
  return useQuery({
    queryKey: ["admin", "permissions", role],
    queryFn: () => fetchJson(`/admin/permissions/${role}`),
    enabled: !!role,
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      body: string;
      titleFr?: string;
      bodyFr?: string;
      severity: "info" | "warning" | "breaking";
      active?: boolean;
    }) =>
      fetchJson("/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alert", "active"] });
    },
  });
}

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchJson(`/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alert", "active"] });
    },
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/alerts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alert", "active"] });
    },
  });
}


export function useBroadcastAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      body: string;
      titleFr?: string;
      bodyFr?: string;
      severity: "info" | "warning" | "breaking";
      sendEmail: boolean;
    }) =>
      fetchJson("/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alert", "active"] });
    },
  });
}


export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ displayName: string; email: string; role: string; avatarUrl: string }> }) =>
      fetchJson(`/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": id },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      fetchJson(`/articles/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": userId,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
  });
}

export function useUpdateArticleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, userId }: { id: string; status: "draft" | "published" | "archived"; userId: string }) =>
      fetchJson(`/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["articles"] });
      qc.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
  });
}

export function useMediaAssets() {
  return useQuery({
    queryKey: ["media"],
    queryFn: () => fetchJson("/media"),
  });
}

export function useAddMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fileName: string; url: string; mimeType: string; altText: string }) =>
      fetchJson("/media", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": getStoredUser()?.id ?? "" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      fetchJson(`/media/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": userId,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
}

export function useArticleSeo(slug: string) {
  return useQuery({
    queryKey: ["admin", "seo", "articles", slug],
    queryFn: () => fetchJson(`/admin/seo/articles/${slug}`),
    enabled: !!slug,
  });
}

export function useUpdateArticleSeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Record<string, unknown> }) =>
      fetchJson(`/admin/seo/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": getStoredUser()?.id ?? "" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "seo"] }),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) =>
      fetchJson("/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      fetchJson("/auth/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useConfirmResetPassword() {
  return useMutation({
    mutationFn: (data: { email: string; code: string; password: string }) =>
      fetchJson("/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

// ============================================================
// Workstream extensions: Authors, Newsletter, Analytics
// ============================================================

export function useAdminSubscribers() {
  return useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: () => fetchJson("/newsletter/subscribers"),
  });
}

export function useSendNewsletter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { subject: string; html: string; preview?: string; recipientType: "subscribers" | "all_users" | "specific"; targetEmail?: string }) =>
      fetchJson("/admin/email/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "email-logs"] }),
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (data: { to: string; subject: string; html: string }) =>
      fetchJson("/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["premium", "my-orders"],
    queryFn: () => fetchJson("/premium/me/orders").then((r: any) => r.orders || []),
  });
}

export function useUpdateProfileRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchJson(`/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useInviteAuthor() {
  return useMutation({
    mutationFn: (data: { email: string; displayName: string; role?: string }) =>
      fetchJson("/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, password: cryptoRandom() }),
      }),
  });
}

function cryptoRandom() {
  const a = new Uint8Array(16);
  (typeof crypto !== "undefined" ? crypto : (globalThis as any).crypto)?.getRandomValues?.(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ============ Premium / E-commerce ============
export type PremiumPlan = { id: string; code: string; name: string; description: string | null; priceXaf: number; periodDays: number; active: boolean };
export type PremiumProduct = { id: string; kind: "speech_pdf" | "insider_pdf" | "research_pdf" | "magazine"; title: string; summary: string | null; priceXaf: number; pdfPath: string; previewPath: string | null; coverUrl: string | null; publishedAt: string; downloadsCount: number };

export function usePremiumPlans() {
  return useQuery<{ plans: PremiumPlan[] }>({ queryKey: ["premium", "plans"], queryFn: () => fetchJson("/premium/plans") });
}
export function usePremiumProducts() {
  return useQuery<{ products: PremiumProduct[] }>({ queryKey: ["premium", "products"], queryFn: () => fetchJson("/premium/products") });
}
export function useMyEntitlements() {
  const token = typeof window !== "undefined" ? localStorage.getItem("eagle_token") : null;
  return useQuery({
    queryKey: ["premium", "entitlements"],
    queryFn: () => fetchJson("/premium/me/entitlements"),
    enabled: !!token,
  });
}
export function usePremiumCheckout() {
  return useMutation({
    mutationFn: (body: { kind: "product" | "plan"; id: string; phone: string }) =>
      fetchJson("/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });
}
export function usePremiumDownload() {
  return useMutation({
    mutationFn: (productId: string) => fetchJson(`/premium/download/${productId}`),
  });
}
export function useAdminPremiumOrders() {
  return useQuery({ queryKey: ["admin", "premium", "orders"], queryFn: () => fetchJson("/admin/premium/orders") });
}
export function useAdminPremiumSubscribers() {
  return useQuery({ queryKey: ["admin", "premium", "subscribers"], queryFn: () => fetchJson("/admin/premium/subscribers") });
}
export function usePreviewPdf(productId: string) {
  return useQuery({
    queryKey: ["premium", "preview", productId],
    queryFn: () => fetchJson(`/premium/preview/${productId}`).then((r: { url: string }) => r.url),
    enabled: !!productId,
  });
}
export function useAdminCreatePremiumProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { kind: PremiumProduct["kind"]; title: string; summary?: string; priceXaf: number; coverUrl?: string; pdfFilename: string; pdfBase64: string; previewFilename?: string; previewBase64?: string }) =>
      fetchJson("/admin/premium/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["premium", "products"] }),
  });
}
export function useAdminUpdatePremiumProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<{ title: string; summary: string; priceXaf: number; coverUrl: string }>;
    }) =>
      fetchJson(`/admin/premium/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["premium", "products"] }),
  });
}
export function useAdminDeletePremiumProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      fetchJson(`/admin/premium/products/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": userId,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["premium", "products"] }),
  });
}

export type Employee = {
  id: string;
  full_name: string;
  email: string;
  age: number;
  photo_url: string | null;
  role: string | null;
  department: string | null;
  expires_at: string;
  created_at: string;
  created_by: string;
};

export function useAdminEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["admin", "employees"],
    queryFn: () => fetchJson("/admin/employees"),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      fullName: string;
      email: string;
      age: number;
      photoUrl?: string;
      role?: string;
      department?: string;
      expiryHours?: number;
    }) =>
      fetchJson("/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "employees"] }),
  });
}

export function useResendEmployeeEmail() {
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/admin/employees/${id}/resend`, {
        method: "POST",
      }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/admin/employees/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "employees"] }),
  });
}

export function usePublicEmployee(id: string) {
  return useQuery<Employee & { isValid: boolean }>({
    queryKey: ["public", "employee", id],
    queryFn: () => fetchJson(`/employees/${id}`),
    enabled: !!id,
    retry: false,
  });
}

// MP, Political Party, and Region API Helpers
export const mpApi = {
  getPoliticalParties: async () => {
    try {
      const data = await fetchJson("/public/political-parties");
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {}
    try {
      const { data } = await supabase
        .from("political_parties")
        .select("id, name, acronym, logo_url, created_at")
        .order("acronym", { ascending: true });
      if (data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          acronym: p.acronym,
          logoUrl: p.logo_url,
          createdAt: p.created_at,
          mpCount: 0,
        }));
      }
    } catch (e) {}
    return [];
  },
  createPoliticalParty: (data: { name: string; acronym: string; logoUrl?: string }) =>
    fetchJson("/admin/political-parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updatePoliticalParty: (id: string, updates: Partial<{ name: string; acronym: string; logoUrl: string }>) =>
    fetchJson(`/admin/political-parties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deletePoliticalParty: (id: string) =>
    fetchJson(`/admin/political-parties/${id}`, { method: "DELETE" }),

  getParliamentRegions: async () => {
    try {
      const data = await fetchJson("/public/parliament-regions");
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {}
    try {
      const { data } = await supabase
        .from("parliament_regions")
        .select("id, name, code, map_image_url, created_at")
        .order("name", { ascending: true });
      if (data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          mapImageUrl: r.map_image_url,
          createdAt: r.created_at,
          mpCount: 0,
        }));
      }
    } catch (e) {}
    return [];
  },
  updateParliamentRegion: (id: string, updates: Partial<{ mapImageUrl: string; name: string }>) =>
    fetchJson(`/admin/parliament-regions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),

  getMps: async (filters?: { partyId?: string; regionId?: string; gender?: string; chamber?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.partyId && filters.partyId !== "all") params.append("partyId", filters.partyId);
      if (filters?.regionId && filters.regionId !== "all") params.append("regionId", filters.regionId);
      if (filters?.gender && filters.gender !== "all") params.append("gender", filters.gender);
      if (filters?.chamber && filters.chamber !== "all") params.append("chamber", filters.chamber);
      const q = params.toString();
      const res = await fetchJson(`/public/mps${q ? `?${q}` : ""}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch (e) {}

    try {
      let q = supabase.from("members_of_parliament").select(`
        id, full_name, photo_url, gender, constituency, bio, role, chamber, created_at,
        political_parties ( id, name, acronym, logo_url ),
        parliament_regions ( id, name, code, map_image_url )
      `);
      if (filters?.partyId && filters.partyId !== "all") q = q.eq("party_id", filters.partyId);
      if (filters?.regionId && filters.regionId !== "all") q = q.eq("region_id", filters.regionId);
      if (filters?.gender && filters.gender !== "all") q = q.ilike("gender", `%${filters.gender}%`);
      if (filters?.chamber && filters.chamber !== "all") {
        q = q.or(`chamber.ilike.%${filters.chamber}%,chamber.is.null`);
      }
      q = q.order("full_name", { ascending: true }).limit(1000);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return data.map((m: any) => ({
          id: m.id,
          fullName: m.full_name,
          photoUrl: m.photo_url,
          gender: m.gender,
          constituency: m.constituency,
          bio: m.bio,
          role: m.role,
          chamber: m.chamber,
          createdAt: m.created_at,
          partyId: m.political_parties?.id,
          partyName: m.political_parties?.name,
          partyAcronym: m.political_parties?.acronym,
          partyLogoUrl: m.political_parties?.logo_url,
          regionId: m.parliament_regions?.id,
          regionName: m.parliament_regions?.name,
          regionCode: m.parliament_regions?.code,
          regionMapImageUrl: m.parliament_regions?.map_image_url,
        }));
      }
    } catch (err) {
      console.error("[Supabase direct MP query error]:", err);
    }
    return [];
  },
  getMpAnalytics: async () => {
    try {
      const data = await fetchJson("/public/mps/analytics");
      if (data && (data.totalMps > 0 || (Array.isArray(data.byParty) && data.byParty.length > 0))) return data;
    } catch (e) {}
    try {
      const { data: mps } = await supabase.from("members_of_parliament").select("id, gender, party_id, region_id");
      if (mps) {
        const male = mps.filter((m) => !m.gender || m.gender.toLowerCase() === "male").length;
        const female = mps.filter((m) => m.gender && m.gender.toLowerCase() === "female").length;
        return {
          totalMps: mps.length,
          byParty: [],
          byRegion: [],
          byGender: { male, female },
        };
      }
    } catch (e) {}
    return { totalMps: 0, byParty: [], byRegion: [], byGender: { male: 0, female: 0 } };
  },
  createMp: (data: { fullName: string; photoUrl?: string; partyId?: string; regionId?: string; gender?: string; constituency?: string; bio?: string }) =>
    fetchJson("/admin/mps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateMp: (id: string, updates: Partial<{ fullName?: string; photoUrl?: string; partyId?: string; regionId?: string; gender?: string; constituency?: string; bio?: string }>) =>
    fetchJson(`/admin/mps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deleteMp: (id: string) =>
    fetchJson(`/admin/mps/${id}`, { method: "DELETE" }),
};

const CAMEROON_10_REGIONS = [
  { id: "yaounde", name: "Yaoundé", region: "Centre Region", role: "Seat of Parliament & Government", lat: 3.8480, lon: 11.5021, isCapital: true },
  { id: "douala", name: "Douala", region: "Littoral Region", role: "Economic Capital & Maritime Hub", lat: 4.0511, lon: 9.7679 },
  { id: "bamenda", name: "Bamenda", region: "North West Region", role: "Grassfields Regional Capital", lat: 5.9631, lon: 10.1591 },
  { id: "garoua", name: "Garoua", region: "North Region", role: "Northern Port & Administrative Center", lat: 9.3011, lon: 13.3977 },
  { id: "buea", name: "Buea", region: "South West Region", role: "Historic Capital & Mount Cameroon Hub", lat: 4.1550, lon: 9.2435 },
  { id: "maroua", name: "Maroua", region: "Far North Region", role: "Sahelian Regional Hub", lat: 10.5910, lon: 14.3159 },
  { id: "bafoussam", name: "Bafoussam", region: "West Region", role: "Western Highlands Hub", lat: 5.4778, lon: 10.4176 },
  { id: "ngaoundere", name: "Ngaoundéré", region: "Adamawa Region", role: "High Plateau Railhead & Trade Hub", lat: 7.3195, lon: 13.5841 },
  { id: "ebolowa", name: "Ebolowa", region: "South Region", role: "Forest Zone Regional Capital", lat: 2.9167, lon: 11.1500 },
  { id: "bertoua", name: "Bertoua", region: "East Region", role: "Eastern Timber & Mining Capital", lat: 4.5770, lon: 13.6846 },
];

function mapWmo(code: number) {
  if (code === 0) return { label: "Sunny / Clear Sky", icon: "sunny", severity: "clear" };
  if (code === 1 || code === 2) return { label: "Mainly Clear", icon: "sunny", severity: "clear" };
  if (code === 3) return { label: "Overcast / Cloudy", icon: "cloudy", severity: "mild" };
  if (code >= 45 && code <= 48) return { label: "Foggy & Hazy", icon: "fog", severity: "mild" };
  if (code >= 51 && code <= 55) return { label: "Light Drizzle", icon: "drizzle", severity: "mild" };
  if (code >= 61 && code <= 65) return { label: "Rain Showers", icon: "rain", severity: "moderate" };
  if (code >= 80 && code <= 82) return { label: "Heavy Rain", icon: "rain", severity: "heavy" };
  if (code >= 95 && code <= 99) return { label: "Tropical Thunderstorm", icon: "thunderstorm", severity: "heavy" };
  return { label: "Partly Cloudy", icon: "partly-cloudy", severity: "mild" };
}

async function fetchDirectOpenMeteoWeather() {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const results = await Promise.all(
    CAMEROON_10_REGIONS.map(async (city) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=Africa%2FDouala`;
      const res = await fetch(url);
      const raw: any = await res.json();
      const current = raw.current || {};
      const daily = raw.daily || {};
      const tempC = Math.round(current.temperature_2m ?? 26);
      const tempF = Math.round((tempC * 9) / 5 + 32);
      const feelsLikeC = Math.round(current.apparent_temperature ?? tempC);
      const weatherCode = current.weather_code ?? 1;
      const condition = mapWmo(weatherCode);

      const forecast = (daily.time || []).slice(0, 5).map((dStr: string, i: number) => {
        const dObj = new Date(dStr);
        const wCode = daily.weather_code?.[i] ?? weatherCode;
        return {
          date: dStr,
          dayName: i === 0 ? "Today" : dayNames[dObj.getDay()] || dStr,
          tempMaxC: Math.round(daily.temperature_2m_max?.[i] ?? tempC + 2),
          tempMinC: Math.round(daily.temperature_2m_min?.[i] ?? tempC - 4),
          weatherCode: wCode,
          condition: mapWmo(wCode),
          precipitationMm: daily.precipitation_sum?.[i] ?? 0,
          uvIndexMax: Math.round(daily.uv_index_max?.[i] ?? 6),
        };
      });

      return {
        city,
        tempC,
        tempF,
        feelsLikeC,
        humidity: current.relative_humidity_2m ?? 75,
        windSpeedKmH: Math.round(current.wind_speed_10m ?? 12),
        precipitationMm: current.precipitation ?? 0,
        surfacePressureHpa: Math.round(current.surface_pressure ?? 1012),
        weatherCode,
        condition,
        uvIndexMax: forecast[0]?.uvIndexMax ?? 6,
        forecast,
        updatedAt: new Date().toISOString(),
      };
    })
  );
  return results;
}

// Weather Forecasting System Hook
export function useWeather() {
  return useQuery({
    queryKey: ["weather", "cameroon"],
    queryFn: async () => {
      try {
        return await fetchJson("/weather");
      } catch (err) {
        console.warn("[Weather] Backend endpoint unreachable, switching to direct Open-Meteo satellite feed.");
        return await fetchDirectOpenMeteoWeather();
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export function useCityWeather(cityId: string) {
  return useQuery({
    queryKey: ["weather", "city", cityId],
    queryFn: async () => {
      try {
        return await fetchJson(`/weather/${cityId}`);
      } catch (err) {
        const all = await fetchDirectOpenMeteoWeather();
        return all.find((c) => c.city.id.toLowerCase() === cityId.toLowerCase()) || null;
      }
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000,
  });
}



