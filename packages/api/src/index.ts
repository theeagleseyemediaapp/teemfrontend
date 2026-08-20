export * from "./types";

import type {
  AppConfig,
  ArticleDetail,
  FeedItem,
  FeedResponse,
  SearchResult,
  VideoReport,
  NotificationItem,
  AiChatResponse,
} from "./types";

export type { AppConfig, ArticleDetail, FeedItem, FeedResponse, SearchResult, VideoReport, NotificationItem, AiChatResponse };

export function createApiClient(baseUrl: string, customFetch = fetch) {
  const base = baseUrl.replace(/\/$/, "");
  let token: string | null = null;

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const res = await customFetch(`${base}${path}`, {
      ...options,
      headers,
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? res.statusText);
    }
    return res.json() as Promise<T>;
  }

  return {
    setToken: (newToken: string | null) => {
      token = newToken;
    },
    getFeed: (page = 1, limit = 20, category?: string) => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (category) params.set("category", category);
      return request<FeedResponse>(`/public/feed?${params}`);
    },
    getAppConfig: () => request<AppConfig>("/public/app-config"),
    getArticles: () => request<any[]>("/articles"),
    getArticle: (slug: string) => request<ArticleDetail>(`/articles/${slug}`),
    getBanners: () => request<any[]>("/banners"),
    getSettings: () => request<any>("/settings"),
    getHeadlines: () => request<FeedItem[]>("/headlines"),
    searchArticles: (query: string) =>
      request<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`),
    getVideos: () => request<VideoReport[]>("/public/videos"),
    getNotifications: () => request<NotificationItem[]>("/public/notifications"),
    sendChatMessage: async (question: string) => {
      return request<AiChatResponse>("/ai/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
    },
    signIn: (email: string, password: string) => {
      return request<{ user: any; token: string }>("/auth/sign-in/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    },
    signUp: (email: string, password: string, displayName?: string, preferredLanguage?: "en" | "fr") => {
      return request<{ user: any; token: string }>("/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, preferredLanguage }),
      });
    },
    getCurrentUser: () => request<{ user: any }>("/auth/me"),
    updateProfile: (id: string, updates: any) => {
      return request<any>(`/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    getActiveAlert: () => request<any>("/alerts/notice"),
    getPremiumPlans: () => request<{ plans: any[] }>("/premium/plans"),
    getPremiumProducts: () => request<{ products: any[] }>("/premium/products"),
    getMyEntitlements: () => request<any>("/premium/me/entitlements"),
    getMyOrders: () => request<{ orders: any[] }>("/premium/me/orders"),
    getPremiumDownload: (productId: string) => request<{ url: string }>(`/premium/download/${productId}`),
    getFinancialMetrics: () => request<any>("/admin/dashboard/financial"),
    premiumCheckout: (kind: "product" | "plan", id: string, phone: string) => {
      return request<{ orderId: string; provider: string; amount: number }>("/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, phone }),
      });
    },
    toggleLike: (articleId: string, profileId: string) => {
      return request<{ likeCount: number }>(`/articles/${articleId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
    },
    getComments: (articleId: string) => request<any[]>(`/articles/${articleId}/comments`),
    addComment: (articleId: string, authorId: string, body: string) => {
      return request<any>(`/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId, body }),
      });
    },
    submitPartnershipInquiry: (data: {
      name: string;
      email: string;
      company: string;
      phone?: string;
      inquiryType: string;
      message: string;
    }) => {
      return request<{ success: boolean }>("/public/partnership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    subscribeNewsletter: (email: string, name: string) => {
      return request<any>("/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    },

    // Political Parties SDK
    getPoliticalParties: () => request<import("./types").PoliticalParty[]>("/public/political-parties"),
    createPoliticalParty: (data: { name: string; acronym: string; logoUrl?: string }) => {
      return request<import("./types").PoliticalParty>("/admin/political-parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
 updatePoliticalParty: (id: string, updates: Partial<{ name: string; acronym: string; logoUrl: string }>) => {
      return request<import("./types").PoliticalParty>(`/admin/political-parties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    deletePoliticalParty: (id: string) => {
      return request<{ ok: boolean }>(`/admin/political-parties/${id}`, {
        method: "DELETE",
      });
    },

    // Parliament Regions SDK
    getParliamentRegions: () => request<import("./types").ParliamentRegion[]>("/public/parliament-regions"),
    updateParliamentRegion: (id: string, updates: Partial<{ mapImageUrl: string; name: string }>) => {
      return request<import("./types").ParliamentRegion>(`/admin/parliament-regions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },

    // Members of Parliament (MPs) SDK
    getMps: (filters?: { partyId?: string; regionId?: string; gender?: string; chamber?: string }) => {
      const params = new URLSearchParams();
      if (filters?.partyId) params.append("partyId", filters.partyId);
      if (filters?.regionId) params.append("regionId", filters.regionId);
      if (filters?.gender) params.append("gender", filters.gender);
      if (filters?.chamber) params.append("chamber", filters.chamber);
      const queryStr = params.toString();
      return request<import("./types").MemberOfParliament[]>(`/public/mps${queryStr ? `?${queryStr}` : ""}`);
    },
    getMpAnalytics: () => request<import("./types").MpAnalytics>("/public/mps/analytics"),
    createMp: (data: { fullName: string; photoUrl?: string; partyId?: string; regionId?: string; gender?: string; constituency?: string; bio?: string }) => {
      return request<import("./types").MemberOfParliament>("/admin/mps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    updateMp: (id: string, updates: Partial<{ fullName?: string; photoUrl?: string; partyId?: string; regionId?: string; gender?: string; constituency?: string; bio?: string }>) => {
      return request<import("./types").MemberOfParliament>(`/admin/mps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    deleteMp: (id: string) => {
      return request<{ ok: boolean }>(`/admin/mps/${id}`, {
        method: "DELETE",
      });
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

