# Backend API Map

This document maps the root-level backend monolith APIs for The Eagle's Eye Media.

## 1. Health and Metadata

- `GET /health` - uptime check.
- `GET /api/v1/meta` - backend name, version, and feature list.

## 2. Public Content APIs

- `GET /api/v1/headlines` - published headline flow for the header ticker.
- `GET /api/v1/categories` - category list.
- `GET /api/v1/articles` - all articles.
- `GET /api/v1/articles/:slug` - article by slug.
- `GET /api/v1/articles/:slug/headline` - compact headline payload.
- `GET /api/v1/articles/:slug/ai-explain` - article explainer view.
- `GET /api/v1/articles/:slug/metrics` - article metrics for public view.
- `GET /api/v1/alerts` - all alerts.
- `GET /api/v1/alerts/active` - active alert notice.
- `GET /api/v1/alerts/notice` - active notice alias for frontend header use.
- `GET /api/v1/media` - media assets.

## 3. Article Management APIs

- `POST /api/v1/articles` - create article.
- `PATCH /api/v1/articles/:id` - update article.
- `POST /api/v1/articles/:id/publish` - publish article.
- `POST /api/v1/articles/:id/unpublish` - unpublish article.
- `POST /api/v1/articles/:id/schedule` - schedule article.

## 4. Comments and Likes APIs

- `GET /api/v1/comments` - all comments.
- `GET /api/v1/articles/:id/comments` - comments for an article.
- `GET /api/v1/comments/:id/replies` - replies to a comment.
- `POST /api/v1/articles/:id/comments` - add comment.
- `POST /api/v1/comments/:id/replies` - add reply to comment.
- `PATCH /api/v1/comments/:id/moderate` - moderate comment.
- `POST /api/v1/articles/:id/likes` - toggle like.

## 5. AI APIs

- `POST /api/v1/ai/search` - AI search assistant.
- `POST /api/v1/ai/explain` - AI explainer for a published story.
- `POST /api/v1/ai/refine` - AI post refiner for editors.
- `POST /api/v1/ai/support` - AI support assistant.

## 6. Support APIs

- `GET /api/v1/support/pages` - support page list.
- `GET /api/v1/support/pages/search` - support search.
- `POST /api/v1/support/messages` - submit support message.

## 7. Newsletter APIs

- `GET /api/v1/newsletter/subscribers` - subscriber list.
- `POST /api/v1/newsletter/subscribers` - add subscriber.

## 8. Settings APIs

- `GET /api/v1/settings` - site settings.
- `PATCH /api/v1/settings` - update settings.

## 9. Profiles and Auth APIs

- `GET /api/v1/profiles` - profile list.
- `GET /api/v1/profiles/:id` - profile detail.
- `PATCH /api/v1/profiles/:id` - update profile.
- `POST /api/v1/profiles/:id/ai-search` - toggle AI search suggestions.
- `POST /api/v1/auth/sign-in/email` - email magic-link sign-in (requires `email`).
- `POST /api/v1/auth/sign-in/google` - Google OAuth sign-in (requires `redirectTo`).
- `POST /api/v1/auth/sign-in/apple` - Apple OAuth sign-in (requires `redirectTo`).
- `POST /api/v1/auth/sign-out` - sign out.
- `GET /api/v1/auth/me` - current user.

## 10. Admin APIs

- `GET /api/v1/admin/dashboard` - admin dashboard summary.
- `GET /api/v1/admin/navigation` - admin sidebar map.
- `GET /api/v1/admin/audit-logs` - audit logs.
- `GET /api/v1/admin/roles` - role list with permissions.
- `GET /api/v1/admin/permissions/:role` - permissions for a role.
- `GET /api/v1/admin/metrics` - site-wide metrics.
- `GET /api/v1/admin/articles` - all articles.
- `GET /api/v1/admin/articles/metrics` - article metrics.
- `GET /api/v1/admin/articles/trending` - trending articles.
- `GET /api/v1/admin/email-logs` - email logs.
- `POST /api/v1/admin/email/send` - send email.

## 11. Job Queue APIs

- `GET /api/v1/admin/jobs` - list all background jobs.
- `GET /api/v1/admin/jobs/:id` - get job status.
- `POST /api/v1/admin/jobs/email` - queue an email job.
- `POST /api/v1/admin/jobs/newsletter` - queue a newsletter job.
- `GET /api/v1/admin/seo/default` - default SEO settings.
- `GET /api/v1/admin/seo/articles/:slug` - SEO for an article.
- `PATCH /api/v1/admin/seo/articles/:slug` - update article SEO.
- `GET /api/v1/admin/support/messages` - support messages list.

## 12. Search APIs

- `GET /api/v1/search` - search articles.
- `GET /api/v1/search/suggestions` - search suggestions.
- `GET /api/v1/search/support` - search support pages.

## 13. Homepage APIs

- `GET /api/v1/home/featured` - featured headlines for homepage.
- `GET /api/v1/home/trending` - trending articles for homepage.

## 14. Notes

- Supabase client is installed at `backend/src/supabase.ts`.
- ioredis is installed for Redis-based job queue persistence.
- OpenRouter AI integration available for real AI responses.
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` environment variables for production.
- The API map should be updated whenever a route is added, renamed, or removed.