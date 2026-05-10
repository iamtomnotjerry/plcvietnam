# Current System State

This document is the operational source-of-truth snapshot for codebase behavior and conventions.
Update this file whenever API contracts, security posture, or architecture behavior changes.

## Last Updated

- Date: 2026-05-10
- Scope: **UX motion layer**: shared tokens in `lib/ui/motion.ts`; **`AuthCallbackPending`** spinner/skeleton + `role="status"` on `/auth/callback`; **`TiltCard`** (3D tilt, desktop-only, off when `prefers-reduced-motion`, safe without `matchMedia` in tests); **`SectionReveal`** (`whileInView` fade-up) on post detail header, book detail hero, about hero; **`AmbientBackground`** + **`AmbientCursorGlow`** in `AppLayout` (cursor glow skips coarse pointer + reduced motion); footer/header motion presets re-export from `lib/ui/motion`; ambient blob keyframes in `app/globals.css`. Prior: resend-confirmation, auth hardening, i18n

## API Contract Status

- Error responses are standardized across admin and most non-admin routes via `lib/api/responses.ts`.
- Error payload shape:
  - `{ "error": { "code": "<ERROR_CODE>", "message": "<message>" } }`
- Standard codes currently in use:
  - `UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`
- `429` responses now support standardized rate-limit headers through `apiTooManyRequests(...)`.

## Security Posture Updates

- Service-role fallback to anon key has been removed in privileged paths.
- Admin routes now enforce route-level role checks (defense-in-depth), not only middleware.
- `GET /api/admin/fields` now enforces `admin` role before data access.
- Upload endpoint validates file type/size and sanitizes upload path.
- Upload endpoint now restricts provided path prefix to `uploads/{userId}/...` and storage write uses `upsert: false`.
- Reset password endpoint no longer exposes raw internal error text.
- Google login flow now runs through Supabase OAuth (`signInWithOAuth`) with callback exchange at `/auth/callback`.
- Comment auth state is now derived from Supabase session in client (`useSupabaseAuth`) and no longer depends on NextAuth for social login.
- `POST /api/comments` now validates auth via Supabase server session (`supabase.auth.getUser()`).
- Comment login prompts are simplified to a single Google provider path for consistent behavior.
- Admin API auth checks now use centralized Supabase auth context (`lib/auth/server-auth.ts`) instead of `getServerSession`.
- Middleware now enforces `/admin` and `/api/admin` access using Supabase session + profile role (`admin`/`author`), aligning guard behavior with runtime auth source.
- Header/editor UI role checks (`UserMenu`, `AdminHeaderLink`, `PostDetail` edit actions) now read Supabase-backed auth state.
- Legacy NextAuth runtime has been removed (`next-auth` package, API route, and ambient types), leaving Supabase as the single auth source.
- Password sign-in now goes through server route `POST /api/auth/sign-in` with layered throttling (IP + IP/email hash) and structured auth audit logging.
- Password recovery and email confirmation callbacks are unified through `/auth/callback` (and `/en/auth/callback`) on a client page under `[locale]`, so PKCE `code`, email `token_hash`, and hash-token redirects all establish a browser session before routing onward.
- `POST /api/auth/register`, `POST /api/auth/forgot-password`, `POST /api/auth/resend-confirmation`, and `POST /api/auth/reset-password` now return standardized `429` errors via shared `apiTooManyRequests(...)` where rate limits apply.
- Reset-password now has explicit route-level rate limiting (`auth` limiter namespace with reset-password identifier suffix).
- Registration now validates profile provisioning write result and fails closed if profile setup does not persist.
- Auth POST routes (`sign-in`, `register`, `forgot-password`, `resend-confirmation`, `reset-password`) now apply same-origin guard (`sec-fetch-site` + `origin`/`referer` trust check) to reduce CSRF surface.
- Registration now normalizes email before signup and returns indistinguishable success for existing email (`EMAIL_TAKEN`) to reduce account enumeration signal.
- Forgot-password now normalizes email before requesting Supabase recovery email for consistent identity handling.
- Registration applies layered abuse throttling: per-IP `auth` bucket plus per-identity `signup:{ip}:{emailHash}` on the same `auth` bucket.
- Forgot-password applies per-IP `auth` throttling plus a dedicated **`forgotResend`** bucket: **1 request per 60 seconds** per `forgot-resend:{ip}:{emailHash}` (Redis sliding window or in-memory equivalent). The forgot-password UI enforces a matching **60s cooldown** when the email field still matches the last successful submit.
- Resend signup confirmation uses the same **`forgotResend`** bucket with key **`confirm-resend:{ip}:{emailHash}`**; the sign-up success screen enforces a client **60s cooldown** after a successful resend.
- Auth flow now records structured audit events for signup, forgot-password, and reset-password outcomes/rate-limits/input-validation failures.
- Reset-password API now validates `{ password, confirmPassword }` server-side through `ResetPasswordSchema` to prevent mismatch bypass from direct API calls.
- Reset-password client now bootstraps Supabase session from URL hash recovery tokens (`#access_token`, `#refresh_token`) before submitting API call, then clears hash from browser URL.
- Password policy has been aligned across UI and API validation to require uppercase, lowercase, digit, and special character (in addition to minimum length).
- Environment validation now fails fast in production when Upstash Redis is missing, preventing deployment with in-memory auth rate limiting fallback.
- Auth route request handling now uses shared utilities (`lib/auth/route-utils.ts`) for trusted-origin checks, request context generation, and JSON parsing to reduce duplicated boilerplate.
- Auth audit logs now include `requestId` to improve end-to-end traceability across auth events.
- Local Supabase auth config now enforces email confirmations and stronger password policy defaults (`minimum_password_length=8`, `password_requirements=lower_upper_letters_digits_symbols`).
- Turnstile CAPTCHA support is now available for auth abuse-prone routes (`sign-in`, `register`, `forgot-password`, `resend-confirmation`) and is enforced when both Turnstile env vars are configured.

## Reliability and Maintainability Updates

- Centralized environment validation in `lib/env.ts`.
- Core infra modules now read validated env:
  - `lib/supabase/client-singleton.ts`
  - `lib/supabase/storage.ts`
  - `lib/rate-limit.ts`
- Test-safe env defaults are provided only for `NODE_ENV=test`.
- Data provider factory now defaults to `supabase` outside test; test environment defaults to `mock`.
- Admin fields/comments routes use singleton service client instead of ad-hoc client creation.

## Frontend Quality Updates

- Rate limiting: if Upstash Redis returns an error at runtime (e.g. `WRONGPASS` / bad `UPSTASH_REDIS_REST_TOKEN`), `checkRateLimit` **degrades to in-memory** per instance instead of failing closed as a false 429; fix Vercel + Upstash credentials for distributed limits.
- Global motion: `lib/ui/motion.ts` centralizes easing, durations, stagger/fade-up/card variants and `sectionRevealVariants`; footer presets remain available via `features/layout/footer/footer-motion.ts`.
- Auth OAuth/email callback shows accessible pending UI (`features/auth/components/AuthCallbackPending.tsx`) instead of plain text alone while session exchanges.
- Listing cards (`PostCard`, `BookCard`) use `TiltCard` for subtle pointer tilt on `md+`; disabled when reduced motion or when `matchMedia` is unavailable (tests).
- Navigation tree semantics improved:
  - expandable nodes use `button` semantics
  - `aria-expanded` and `aria-controls` added
- Navigation fetch no longer forces `no-store`, allowing route cache policy to apply.
- Mobile search overlay now restores focus and traps focus while dialog is open.
- Post delete flow in `PostDetail` now uses inline error surface instead of blocking alert popup.

## Documentation Baseline

Core docs are present for senior-level onboarding and operations:

- `README.md`
- `CONTRIBUTING.md`
- `docs/senior-md/architecture-overview.md`
- `docs/senior-md/testing-strategy.md`
- `docs/senior-md/environment-variables.md`
- `docs/senior-md/deployment-runbook.md`
- `docs/senior-md/incident-runbook.md`
- `docs/senior-md/onboarding.md`
- `docs/senior-md/observability-runbook.md`
- `docs/senior-md/api-contracts.md`
- `docs/senior-md/current-system-state.md` (this file)

## Known Remaining Gaps (Next Priorities)

- Expand API contract tests for additional admin routes (`reorder`, `upload`, `users`, `posts` PATCH/DELETE edge cases).
- Add request correlation IDs and structured log schema in runtime code.
- Move multi-step post/tag mutations to transactional DB flow (RPC/transaction).
- Add focused API tests for `register` and `reset-password` rate-limit and error-contract paths (`forgot-password` resend cooldown is covered in route tests).
