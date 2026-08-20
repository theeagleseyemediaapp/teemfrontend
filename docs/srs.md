# Software Requirements Specification

## 1. Purpose

The Eagle's Eye Media is a branded parliamentary newsroom platform for Cameroon. The system publishes political news, live parliamentary coverage, analysis, video, and editorial explainers, while also providing an admin area for newsroom operations.

## 2. Scope

The system includes:

- A public newsroom website
- Article and category pages
- A sliding recent-news hero
- A headline-based header ticker
- A notice bar for urgent admin alerts
- A root-level backend monolith
- Admin management pages
- AI-assisted editorial tools
- Optional AI search suggestions
- Reader support and help content
- AI explainers for news creation and news reading
- SMTP-based outbound email
- Auth, roles, and permissions
- Content analytics and interaction signals such as likes and comments

## 3. Product Goals

- Deliver a fast and trustworthy newsroom experience.
- Keep the site branded as The Eagle's Eye Media.
- Support editorial workflows through a clean admin interface.
- Use AI to assist search, support, and editing without replacing human review.
- Keep the codebase modular and maintainable.

## 4. User Roles

- Visitor: reads articles, views alerts, searches content, and uses support pages.
- Member: can like content, comment, and receive optional updates.
- Author: creates and edits drafts.
- Editor: reviews, refines, and publishes content.
- Admin: manages users, roles, alerts, SEO, settings, and site structure.
- Super Admin: full platform access including security and integrations.

## 5. Functional Requirements

### 5.1 Public Site

- The home page shall present a recent-news hero slider.
- The header shall auto-flow from published headlines.
- The site shall show a notice bar above the header when an alert article is active.
- Article cards shall display post time, like count, and comment count.
- Article pages shall show editorial content, metadata, related stories, and interaction counts.
- Category pages shall display grouped newsroom coverage.
- Support pages shall explain how to contact the newsroom and use the site.

### 5.2 Authentication and Profiles

- Users shall sign in with Google, Apple, or email.
- The system shall store profile data in Supabase.
- The system shall derive a default display name from the email address when needed.
- The system shall support role-based permissions for admin access.

### 5.3 Admin Area

- Admin users shall have access to a structured sidebar navigation.
- Admins shall create, edit, schedule, publish, and unpublish posts.
- Admins shall manage categories, alerts, comments, media, SEO, and settings.
- Admins shall see content analytics and moderation data.
- Admins shall use AI to refine posts before publishing.

### 5.4 AI Features

- Readers shall be able to ask natural-language questions to search content.
- AI search suggestions shall be opt-in and enabled by the user.
- Support pages shall provide AI-assisted help for site usage.
- Admins shall be able to request AI-generated headline, summary, and SEO improvements.
- The news create flow shall offer an AI explainer or helper for the editor.
- Published news pages shall expose an AI explainer view that summarizes or clarifies the story for readers.
- AI outputs shall be grounded in site content and docs.
- AI requests shall be logged.

### 5.5 Email and Notifications

- The system shall send branded outbound email through SMTP.
- The system shall support verification, password reset, alerts, and newsletter delivery.
- The system shall support site notices and editorial alerts.

## 6. Non-Functional Requirements

- The system shall be responsive on mobile, tablet, and desktop.
- The system shall support server-side rendering.
- The system shall be modular and maintainable.
- The system shall keep admin and public concerns separated.
- The system shall preserve SEO integrity for every article and page.
- The system shall protect private data with row-level security and server checks.
- The system shall support future expansion without a rewrite.

## 7. Proposed Architecture

### 7.1 Frontend

- `src/` contains the public app.
- `src/components/home/` contains home-specific components.
- `src/components/site/` contains shared site components.
- `src/components/admin/` contains admin-only UI components.
- `src/routes/admin/` contains admin routes.

### 7.2 Backend

- `backend/` is a root-level monolith backend folder.
- Backend services shall handle auth, permissions, content data, email, AI, media, and logs.

### 7.3 Data Layer

- Supabase Postgres shall store content, profiles, roles, comments, media, alerts, and logs.
- Row-level security shall protect private and admin data.

### 7.4 Email Layer

- SMTP shall handle all branded email delivery.

## 8. Core Data Objects

- User profile
- Role
- Article
- Category
- Comment
- Like
- Alert notice
- Media asset
- Newsletter subscriber
- Audit log
- AI request log

## 9. Acceptance Criteria

- The root metadata is branded correctly.
- The home page loads with a sliding hero and meaningful content blocks.
- The header ticker shows published headlines.
- The notice bar appears when alerts are active.
- The admin area is role-protected.
- AI search suggestions are opt-in and user-controlled.
- AI explainers are available in the news create flow and on published news pages.
- AI tools assist without replacing editorial approval.
- Documentation stays updated alongside code changes.

## 10. Documentation Rule

- Any architecture, folder, admin, AI, auth, or backend change shall be reflected in this SRS and the implementation plan.