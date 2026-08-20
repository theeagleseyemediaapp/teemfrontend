# Implementation Plan

Status legend:
- `[ ]` not started
- `[x]` completed

## 1. Foundation

- [x] Keep the project monolithic for now.
- [x] Use a root-level `backend/` folder for server logic.
- [x] Keep public UI code in `src/`.
- [x] Keep public homepage modules in `src/components/home/`.
- [x] Keep admin UI modules in `src/components/admin/`.
- [x] Keep shared site UI in `src/components/site/`.

## 2. Public Site

- [x] Maintain the newsroom home page, article pages, and category pages.
- [x] Keep the homepage hero as a recent-news slider.
- [x] Show the latest headline flow in the header ticker.
- [x] Show a notice bar above the header when an alert story is active.
- [x] Display post time, like count, and comment count on all story surfaces.

## 3. Admin System

- [x] Build a dedicated admin dashboard. (scaffolded in src/routes/admin.tsx)
- [x] Add a structured admin sidebar. (AdminLayout.tsx component)
- [x] Add admin access control with roles. (backend/src/modules/permissions.ts)
- [x] Add article creation, editing, publishing, and scheduling. (backend APIs implemented)
- [x] Add AI-assisted editing tools for admins. (backend/src/modules/ai.ts)
- [x] Add comment moderation. (backend APIs implemented)
- [x] Add notice and alert publishing. (backend APIs implemented)
- [x] Add site settings and SEO management. (backend APIs implemented)

## 4. Backend

- [x] Create the backend service layer in `backend/`.
- [x] Add Supabase auth integration.
- [x] Add profiles, roles, and permissions.
- [x] Add article, category, comment, and media services.
- [x] Add SMTP email delivery.
- [x] Add audit logs and moderation logs.
- [x] Add AI service helpers for editorial and support use cases.

## 5. Data and Security

- [x] Define the database schema in Supabase. (docs/database-schema.sql)
- [x] Add row-level security for admin and private data. (Supabase RLS policies - see schema)
- [x] Validate and sanitize all user and admin input. (backend/src/http.ts)
- [x] Restrict uploads to approved media types. (ALLOWED_MEDIA_TYPES constant)
- [x] Protect all admin routes server-side. (requireAdmin in backend/src/app.ts)

## 6. AI Features

- [x] Add search-based AI assistance for readers. (backend AI APIs)
- [x] Make AI search suggestions opt-in for the user. (backend API toggle)
- [x] Add support-page AI help. (backend/src/modules/ai.ts aiSupportReply)
- [x] Add admin AI refiner for headlines, summaries, SEO, and tags. (backend API)
- [x] Add AI explainer support in the news create flow. (backend API)
- [x] Add AI explainer support on published news pages. (backend API)
- [x] Keep all AI responses grounded in site content and docs.
- [x] Log AI requests for moderation and quality checks. (audit module)

## 7. Documentation

- [x] Keep a live implementation plan.
- [x] Keep a living SRS.
- [x] Update the README to point to planning docs.
- [x] Update docs whenever structure or scope changes.

## 8. Next Build Phase

- [x] Confirm the final root-level folder structure.
- [x] Draft the backend module map.
- [x] Draft the database schema.
- [x] Draft the admin sidebar and route map.
- [x] Draft the AI assistant flows.