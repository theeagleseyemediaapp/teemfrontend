/**
 * YouTube Data API v3 helper
 *
 * Required env vars (set in .env):
 *   VITE_YOUTUBE_CHANNEL_ID  — your channel ID, e.g. UCxxxxxxxxxxxxxx
 *   VITE_YOUTUBE_API_KEY     — YouTube Data API v3 key from Google Cloud Console
 *
 * How to get them:
 *  1. Channel ID: go to youtube.com → your channel → Settings → Advanced Settings → Channel ID
 *  2. API Key: https://console.cloud.google.com → Enable "YouTube Data API v3" → Credentials → API key
 */

const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined;
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;

const YT_BASE = "https://www.googleapis.com/youtube/v3";

export interface YTVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  isLive: boolean;
}

function isConfigured() {
  return !!CHANNEL_ID && !!API_KEY;
}

export function getChannelUrl() {
  if (!CHANNEL_ID) return "https://www.youtube.com";
  return `https://www.youtube.com/channel/${CHANNEL_ID}`;
}

/**
 * Returns the current live stream video ID for the channel, or null if offline.
 */
export async function fetchLiveStreamId(): Promise<string | null> {
  if (!isConfigured()) return null;
  try {
    const url = new URL(`${YT_BASE}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", CHANNEL_ID!);
    url.searchParams.set("eventType", "live");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("key", API_KEY!);

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json() as { items?: { id?: { videoId?: string } }[] };
    return data.items?.[0]?.id?.videoId ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches recent videos from the channel, optionally filtered by a search query.
 * Returns at most `maxResults` items (default 12).
 */
export async function fetchChannelVideos(opts?: {
  query?: string;
  maxResults?: number;
  eventType?: "completed" | "live" | "upcoming";
}): Promise<YTVideo[]> {
  if (!isConfigured()) return [];
  try {
    const url = new URL(`${YT_BASE}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", CHANNEL_ID!);
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "date");
    url.searchParams.set("maxResults", String(opts?.maxResults ?? 12));
    url.searchParams.set("key", API_KEY!);
    if (opts?.query) url.searchParams.set("q", opts.query);
    if (opts?.eventType) url.searchParams.set("eventType", opts.eventType);

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json() as {
      items?: {
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          description?: string;
          publishedAt?: string;
          liveBroadcastContent?: string;
          thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
        };
      }[];
    };

    return (data.items ?? []).map((item) => ({
      videoId: item.id?.videoId ?? "",
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url ?? "",
      publishedAt: item.snippet?.publishedAt ?? "",
      isLive: item.snippet?.liveBroadcastContent === "live",
    })).filter((v) => v.videoId);
  } catch {
    return [];
  }
}

/**
 * Fetches interview videos — searches channel for "interview" keyword.
 */
export async function fetchInterviewVideos(maxResults = 6): Promise<YTVideo[]> {
  return fetchChannelVideos({ query: "interview", maxResults });
}
