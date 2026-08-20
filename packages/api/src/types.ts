export type FeedItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  coverImage: string;
  publishedAt?: string;
  featured: boolean;
  alert: boolean;
  likeCount: number;
  commentCount: number;
};

export type FeedResponse = {
  page: number;
  limit: number;
  items: FeedItem[];
};

export type AppConfig = {
  siteName: string;
  description: string;
  aiSearchEnabled: boolean;
  noticeEnabled: boolean;
  liveVideoId: string;
  liveMode: "live" | "event";
  minAppVersion: string;
  termsVersion: string;
};

export type ArticleDetail = FeedItem & {
  body: string[];
  author?: string;
  additionalImages?: string[];
  videoUrl?: string;
  video_url?: string;
};

export type SearchResult = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
  publishedAt?: string;
  alert: boolean;
  featured: boolean;
  likeCount: number;
  commentCount: number;
};

export type VideoReport = {
  id: string;
  title: string;
  meta: string;
  live?: boolean;
  duration?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  time: string;
  icon: string;
  unread: boolean;
  type?: "alert" | "article";
  slug?: string;
  alertId?: string;
  alertTitle?: string;
  alertBody?: string;
  alertTitleFr?: string;
  alertBodyFr?: string;
  alertSeverity?: string;
};

export type AiChatResponse = {
  reply: string;
};

export type PoliticalParty = {
  id: string;
  name: string;
  acronym: string;
  logoUrl?: string;
  mpCount?: number;
  createdAt?: string;
};

export type ParliamentRegion = {
  id: string;
  name: string;
  code: string;
  mapImageUrl?: string;
  mpCount?: number;
  createdAt?: string;
};

export type MemberOfParliament = {
  id: string;
  fullName: string;
  photoUrl?: string;
  partyId?: string;
  partyName?: string;
  partyAcronym?: string;
  partyLogoUrl?: string;
  regionId?: string;
  regionName?: string;
  regionCode?: string;
  regionMapImageUrl?: string;
  gender: "male" | "female" | string;
  constituency?: string;
  bio?: string;
  createdAt?: string;
};

export type MpAnalytics = {
  totalMps: number;
  byParty: {
    partyId: string;
    partyName: string;
    partyAcronym: string;
    partyLogoUrl?: string;
    count: number;
  }[];
  byRegion: {
    regionId: string;
    regionName: string;
    regionCode: string;
    mapImageUrl?: string;
    count: number;
  }[];
  byGender: {
    male: number;
    female: number;
  };
};

