import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://www.theeagleseyemedia.com";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/parliament",
  "/national-assembly",
  "/senate",
  "/politics",
  "/government",
  "/economy",
  "/opinion",
  "/video",
  "/watch-live",
  "/awards",
  "/bills-laws",
  "/committee-echoes",
  "/constituency-actions",
  "/networking",
  "/premium",
  "/interviews",
  "/parliamentary-diplomacy",
  "/parliamentary-missions",
  "/plenaries",
  "/pub",
  "/legal",
  "/legal/terms-of-service",
  "/legal/privacy-policy",
  "/legal/editorial-policy",
  "/legal/copyright-notice",
  "/legal/disclaimer",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const API_BASE = (import.meta.env.VITE_API_URL ?? "/api/v1").replace(
          /\/$/,
          "",
        );
        let articles: { slug: string }[] = [];
        try {
          const res = await fetch(`${API_BASE}/articles`);
          if (res.ok) articles = await res.json();
        } catch {
          /* swallow */
        }

        const paths = [
          ...STATIC_PATHS,
          ...articles.map((a) => `/article/${a.slug}`),
        ];

        const urls = paths.map(
          (p) =>
            `  <url>\n    <loc>${SITE}${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
  component: () => null,
});
