# Architecture Overview

Admin-facing visual companion (Vietnamese/English, expandable sections): **locale route `/architecture`** (middleware-gated to `admin` role). This file remains the concise engineering summary.

## System Shape

- Next.js App Router serves both UI routes and API routes.
- Locale-first UI lives under `app/[locale]/` with **`next-intl`** (`i18n/routing.ts`, `i18n/request.ts`, message catalogs in `messages/`).
- `features/*` holds feature-specific UI, hooks, and local logic (including **`features/admin/`** for CMS list shells: `AdminDataTable`, hero, shared toolbar search, table text truncation under `lib/admin/`).
- `components/*` holds cross-feature reusable UI components.
- `app/api/*` holds HTTP transport handlers and boundary validation.
- `lib/data/*` holds repository/provider abstractions for data access.

## Data Layer Boundaries

- Route handlers should validate input, call repository/provider, and map stable responses.
- Domain/data access logic should stay in `lib/data/providers/*`.
- Keep transport logic out of provider internals.

## Auth and Access

- Auth is unified on Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`).
- Middleware protects `/admin` and `/api/admin` paths.
- Sensitive admin handlers should also enforce route-level role checks (defense in depth).

## Non-Functional Goals

- Strict TypeScript in production paths.
- Stable response contracts for frontend integrations.
- Clear logging/monitoring hooks for failure diagnosis.

## CMS post authoring (high level)

- **Composer**: `features/cms/components/AdminNewPostComposerLauncher.tsx` opens a modal with `PostComposerSplitWorkspace` (TipTap `RichTextEditor` + `PostDraftLivePreview`). Full-page **`/admin/posts/new` is removed**; `next.config` redirects to `/admin/posts?compose=1`. **Edit from the posts table** uses the same split modal in `AdminPostsClient`; full-page edit remains at `/admin/posts/[id]/edit`.
- **Shared modal chrome**: `PostComposerModalFrame` (header + close) is reused by the launcher and the table edit flow.
- **Rich text (TipTap v3)**: `features/cms/components/RichTextEditor.tsx` — `StarterKit` (incl. headings H2–H4, lists, blockquote, link, code + code block, underline, HR), `TableKit`, `TextAlign`, `Highlight`, `Image` (upload to **`post_media`**), `Youtube` (nocookie embeds), `Placeholder`. Toolbar primitives: `RichTextToolbarButton.tsx`.
- **HTML safety**: Reading view uses **`sanitizeHtmlClient`** (`lib/security/sanitize.client.ts`, DOMPurify + hooks). **Saving** posts runs **`sanitizeHtml`** (`lib/security/sanitize.ts`) on excerpt/body — strips scripts/styles and non-YouTube iframes; **YouTube iframe `src`** must match `youtube.com` / `youtu.be` / `youtube-nocookie.com` (same idea as client).
- **Storage**: `POST /api/admin/upload` — buckets include **`thumbnails`** and **`post_media`** (`lib/supabase/storage.ts`); thumbnails vs inline images stay separate.
