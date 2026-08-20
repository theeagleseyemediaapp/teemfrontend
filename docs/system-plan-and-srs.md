# Eagle's Eye Media System Plan and SRS

## 1. Purpose
Build a branded, newsroom-style parliamentary publishing platform for The Eagle's Eye Media. The system will serve public readers, editors, and administrators, with strong SEO, social metadata, editorial workflows, and authentication.

## 2. Recommended Stack
- Frontend: TanStack Start, React, TypeScript, Vite
- Backend foundation: Supabase
- Database: PostgreSQL via Supabase
- Authentication: Supabase Auth with Google, Apple, and email/password
- Email delivery: SMTP
- Media storage: Supabase Storage
- Admin UI: React components in `src/components/admin`
- Public home UI: React components in `src/components/home`

## 3. Why Supabase
Supabase is the better fit for this project than MongoDB because:
- It gives us auth, database, storage, and row-level security in one system.
- PostgreSQL is better suited for newsroom content, publishing status, category relationships, and reporting.
- It supports Google, Apple, and email/password auth cleanly.
- It is easier to enforce admin/editor roles and content permissions.
- SMTP and notification workflows are straightforward to add on top.

MongoDB would require more custom work for permissions, relational content, and editorial workflows.

## 4. Folder Strategy
- `src/components/home/`: public home page modules
- `src/components/admin/`: admin dashboard and management modules
- `src/backend/`: backend services, auth logic, email helpers, and database access layer
- `docs/`: product and system documentation

## 5. User Roles
### Public Visitor
- Can browse articles, categories, videos, and about pages.
- Can sign up or sign in with Google, Apple, or email/password.

### Registered User
- Has a profile created on first auth.
- Name is derived from the email local part if no display name is provided by the provider.
- Can subscribe to newsletters and potentially save preferences later.

### Editor
- Can create and edit articles.
- Can upload media.
- Can schedule or publish content.

### Admin
- Can manage users, roles, categories, site content, and moderation.
- Can access all backend management tools.

## 6. Authentication Requirements
### Supported sign-up methods
- Google OAuth
- Apple OAuth
- Email/password

### Profile rules
- If the OAuth provider returns a full name, use it.
- If no name is present, derive a display name from the email local part.
- Store the canonical email, display name, avatar URL when available, provider, and role.

### Session rules
- Sessions should be server-validated.
- Admin routes must require an authenticated admin/editor role.
- Public routes must remain accessible without login.

## 7. Email and SMTP Requirements
SMTP will be used for:
- Sign-up verification emails
- Password reset emails
- Newsletter confirmations
- Administrative notifications
- Workflow alerts for publication and moderation

Email templates should be branded for The Eagle's Eye Media and kept in the backend email module.

## 8. Content Model
Core entities:
- Users
- Roles
- Articles
- Categories
- Tags
- Media assets
- Comments or reactions if enabled later
- Newsletter subscriptions
- Publication events / audit log

## 9. Article Workflow
1. Draft created by editor
2. Draft edited and reviewed
3. Media attached
4. SEO fields completed
5. Scheduled or published
6. Visible to public pages
7. Updates tracked through an audit log

## 10. Public UI Modules
### Home
- Hero news slider
- Recent news rail
- Featured stories
- Category blocks
- Video strip
- Editorial highlights

### Site-wide shared components
- Header
- Footer
- Breaking ticker
- Section heading
- Story card
- Category page layout

## 11. Admin UI Modules
- Dashboard summary cards
- Article list and filters
- Article editor
- Media upload manager
- Category manager
- User role manager
- Publish/schedule controls
- Audit trail viewer

## 12. Backend Module Plan
Suggested backend structure under `src/backend/`:
- `auth/`: provider handling, roles, session helpers
- `users/`: profile creation, name derivation, role sync
- `content/`: articles, categories, tags, publish states
- `email/`: SMTP service and templates
- `storage/`: media handling and image metadata
- `admin/`: privileged operations and moderation APIs
- `db/`: query helpers, schema definitions, migrations
- `audit/`: logging of admin actions and publishing events

## 13. Data Model Draft
### users
- id
- email
- display_name
- avatar_url
- provider
- role
- created_at
- updated_at

### articles
- id
- slug
- title
- summary
- body
- category_id
- author_id
- status
- featured
- hero_order
- published_at
- created_at
- updated_at

### categories
- id
- name
- slug
- description
- sort_order

### media_assets
- id
- file_url
- file_type
- alt_text
- metadata_json
- uploaded_by
- created_at

### subscriptions
- id
- email
- status
- confirmed_at
- created_at

### audit_log
- id
- actor_id
- action
- entity_type
- entity_id
- details_json
- created_at

## 14. API / Server Needs
- Auth session endpoints
- Current user endpoint
- Admin CRUD endpoints for articles
- Category management endpoints
- Media upload metadata endpoints
- SMTP notification triggers
- Newsletter subscription endpoints

## 15. Security Requirements
- Role-based access control for admin features
- Row-level security in the database
- Server-side validation for all forms
- Safe file upload constraints
- Audit logging for content changes
- CSRF-safe server actions where needed

## 16. SEO and Metadata Requirements
- Site-wide root metadata in the HTML shell
- Per-route metadata for articles and category pages
- Open Graph and Twitter card support
- Canonical URLs
- Structured data for article pages

## 17. Non-Functional Requirements
- Mobile-first responsive design
- Fast initial load and image optimization
- Reliable SSR on Vercel
- Accessible navigation and forms
- Clear admin workflows
- Maintainable folder boundaries

## 18. Proposed Implementation Phases
### Phase 1
- Lock folder structure
- Finalize auth and user profile rules
- Define schema
- Create backend service modules

### Phase 2
- Build admin dashboard shell
- Build article editor and media workflows
- Add SMTP templates and notifications

### Phase 3
- Connect public content to backend data
- Add publishing workflow
- Add audit logging

### Phase 4
- Polish SEO, analytics, and performance
- Harden permissions and moderation
- Prepare deployment and monitoring

## 19. Immediate Next Steps
- Create Supabase project and schema
- Add auth provider configuration for Google and Apple
- Implement user profile bootstrap from email/provider data
- Build admin folder structure into working components
- Wire SMTP service and templates
- Replace hardcoded content with backend data gradually

## 20. Decision Summary
Use Supabase, not MongoDB, for this project.