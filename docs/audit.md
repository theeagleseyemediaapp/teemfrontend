# Eagle's Eye Media — Audit + Mobile App Plan

## 1. What's working (verified in code)

### Frontend (web)

- TanStack Start routing, SSR shell, root layout, 404/error boundaries.
- Public routes all present: /, /plenaries, /committee-echoes, /networking, /parliamentary-diplomacy, /parliamentary-missions, /constituency-actions, /interviews, /bills-laws, /opinions, /opinion, /video, /watch-live, /about, /national-assembly, /senate, /economy, /government, /politics, /parliament, /sign-in, /reset-password.
- Article page (/article/$slug) with share buttons, read-time, like block.
- Hero slider with thumbnails + trending + editor's pick.
- Footer (12-col), legal hub + 5 policy pages rendered from markdown via LegalDoc.
- RSS (/rss.xml) and sitemap (/sitemap.xml).
- Cookie consent banner, breaking ticker, AI chat widget, welcome toast.
- Click-sound hook, localStorage engagement fallback.

### Admin

- Routes exist: dashboard, posts (list/create/edit/view), alerts, comments, media, newsletter, authors, analytics, AI, SEO, settings, users.
- Auth: sign-in, magic link, Google, password reset.

### Backend (Express/Render + Supabase)

- Modules: content (articles/comments/likes/alerts/media), AI (OpenRouter Llama 3.3 70B + refine + search + explain + support), auth (local/OAuth/OTP/reset), profiles, newsletter, settings, email (SMTP queue), metrics, SEO, audit, permissions, cache (Upstash), live (Watch Live config), queue.
- API hooks wired in src/lib/api.ts (~50 hooks).

## 2. What's broken or incomplete

### Critical

- **No env in production** — .env only has VITE_API_URL=http://localhost:8787. Published site cannot reach backend.
- **AI grounding**: ai.ts exists but doesn't yet inject site context (recent headlines, sections, matching articles) on every call → answers drift.
- **No analytics_events table or client tracker** — analytics dashboard reads aggregates that may be empty.
- **Newsletter double opt-in not implemented**; SMTP creds may still be placeholders → sends will silently fail.
- **No unique indexes** on articles.slug, newsletter_subscribers.email, comments(article_id,user_id,body_hash) → duplicate risk.
- **Media uploader route exists** but Supabase Storage bucket + upload flow not wired.
- **Watch Live admin override**: live.ts is in-memory only — resets on every Render cold start.
- **Settings table not driving the site** — site name, social links, footer copy still partially hardcoded.

### Visible / UX

- Hero on desktop still shows a gap under the image at some viewports (aspect-ratio vs. min-height mismatch).
- Several StoryCard variants overflow on <380px screens.
- Admin tables lack mobile horizontal-scroll wrapper.
- AI float bubble: response toast not anchored above the icon (still side panel in some states).
- 404 page lacks search + popular links.
- No reading-progress bar, no print stylesheet, no per-article OG image override.
- No skip-to-content link; focus rings inconsistent.

### Routing / nav

- Two near-duplicate routes: /opinion and /opinions, /parliament parent + children. Pick one.
- /video vs /watch-live overlap.

### Backend hygiene

- live.ts not persisted to DB.
- No webhook signature verification on any /api/public/* endpoint (none yet exist; flag for when added).
- No rate limiting on /ai/* endpoints — abuse risk with public OpenRouter key.

## 3. What to add (web, before mobile)

- Set VITE_API_URL to the Render URL in .env.production; add OPENROUTER_API_KEY, SMTP_*, SUPABASE_SERVICE_KEY on Render.
- Migration: analytics_events, unique indexes, settings rows, live_config table (replaces in-memory live.ts).
- getSiteContext() helper prepended to every AI call.
- Media uploader → Supabase Storage bucket media with signed-URL list.
- Newsletter double opt-in + unsubscribe token + Nodemailer with real SMTP.
- Rate limit /ai/* (Upstash already configured).
- Fix hero gap, card overflow, admin table scroll, AI toast anchor, 404 page.
- Collapse duplicate routes (/opinion(s), /video vs /watch-live).
- Per-article OG image, reading progress, skip-to-content.

## 4. Mobile App Plan

### Recommendation

Expo (React Native) + reuse the existing Express/Supabase backend. Same API, same Supabase auth, same OpenRouter AI. No second backend.

### Stack

- Expo SDK 51, React Native, Expo Router (file-based, mirrors TanStack routes).
- TanStack Query (reuse query keys + hooks from src/lib/api.ts via a shared packages/api workspace).
- @supabase/supabase-js with expo-secure-store for token persistence.
- NativeWind (Tailwind for RN) so design tokens (navy #1B2A6B, gold #F5A623, Playfair/Inter) port directly.
- Expo Notifications + FCM/APNs for push (breaking alerts).
- Expo AV for Watch Live (YouTube iframe via react-native-youtube-iframe).
- EAS Build + EAS Submit for App Store / Play Store.

### Repo shape

```
/                    (current web)
/apps/mobile         (new Expo app)
/packages/api        (shared: types, query hooks, zod schemas)
/packages/ui-tokens  (shared colors, fonts, spacing)
```

Move src/lib/api.ts types + query options into packages/api; web and mobile both import.

### Screens (v1)

- Splash + onboarding (3 slides, skip).
- Home feed — hero carousel + sections (Parliament Today, Latest, Senate, Assembly, Opinion).
- Section list — one screen, route param drives category.
- Article reader — cover, share sheet (native), like, comments, related.
- Watch Live — embedded YouTube player + schedule.
- Search — AI + traditional, voice input (Expo Speech).
- Breaking alerts inbox — push history.
- Profile — sign in/up (email + Google + Apple), saved articles, comment history, notification prefs.
- Settings — text size, dark mode, data saver, language toggle (FR/EN — later).

### Backend additions for mobile

- Device token registry: device_tokens(user_id, token, platform, created_at).
- Push trigger: when an alerts row is created or an article with breaking=true is published, fan-out to FCM/APNs via a queued job.
- Saved articles: bookmarks(user_id, article_id).
- /api/public/feed: lightweight paginated feed endpoint (returns slim DTOs, image variants) so mobile doesn't pull full HTML.
- Image CDN variants (Supabase transform): ?width=400&quality=70 for thumbs.
- App config endpoint /api/public/app-config: feature flags, force-update version, Watch Live ID, terms version.
- Auth: reuse Supabase JWT; mobile passes Authorization: Bearer <token> exactly like web.

### Auth flow

Email/password + magic link via Supabase; Apple Sign-In is mandatory for App Store if Google is offered. Use expo-apple-authentication.

### Offline + performance

- TanStack Query persistQueryClient with AsyncStorage → last feed cached for offline reading.
- Article body cached on open; images via expo-image (built-in disk cache).

### Release plan

- **Week 1**: monorepo split, packages/api, Expo scaffold, design tokens, home feed read-only.
- **Week 2**: article reader, sections, search, sign-in.
- **Week 3**: likes/comments, bookmarks, push notifications, Watch Live.
- **Week 4**: profile, settings, polish, EAS internal build, TestFlight + Play internal track.
- **Week 5**: store assets (screenshots, privacy labels, content rating), submit.

### Out of scope v1 (flag for v2)

Paywall/subscriptions, native AR/parliament 3D, in-app FR/EN toggle, podcast tab, live chat during plenaries.

## 5. Decisions needed

- Mobile stack: Expo (recommended) or native Swift/Kotlin?
- Push provider: FCM only (free) or OneSignal (easier admin UI, paid tier)?
- Sign-in on mobile: email + Google + Apple required, or email-only v1?
- Should I start by fixing the web critical items (env, AI grounding, hero gap, media, newsletter SMTP) before opening the mobile workstream — or run both in parallel?
