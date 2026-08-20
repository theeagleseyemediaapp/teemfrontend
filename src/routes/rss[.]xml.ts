import { createFileRoute } from "@tanstack/react-router";

const API_BASE = (process.env.VITE_API_URL ?? import.meta.env?.VITE_API_URL ?? "https://eagles-4lyx.onrender.com/api/v1").replace(/\/$/, "");
const SITE = "https://theeagleseyemedia.com";

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        let articles: any[] = [];
        try {
          const res = await fetch(`${API_BASE}/articles`);
          if (res.ok) articles = await res.json();
        } catch { /* swallow */ }

        const published = articles
          .filter((a) => (a.status ?? "published") === "published")
          .slice(0, 50);

        const items = published
          .map((a) => {
            const link = `${SITE}/article/${a.slug}`;
            const pub = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
            return `<item>
<title>${esc(a.title)}</title>
<link>${link}</link>
<guid isPermaLink="true">${link}</guid>
<pubDate>${pub}</pubDate>
<description>${esc(a.summary ?? "")}</description>
${a.author ? `<author>noreply@theeagleseyemedia.com (${esc(a.author)})</author>` : ""}
${a.categorySlug ? `<category>${esc(a.categorySlug)}</category>` : ""}
</item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>The Eagle's Eye Media</title>
<link>${SITE}</link>
<description>Parliamentary news from Cameroon — The Eagle's Eye Media.</description>
<language>en-CM</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
